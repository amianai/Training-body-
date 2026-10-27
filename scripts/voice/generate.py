"""Registra le frasi della voce guida con Gemini TTS e le salva come mp3 in public/voce.

Legge la lista da scripts/voice/clips.json (la scrive il test di src/lib/voiceScript.ts) e registra
solo le frasi nuove o cambiate. La quota gratuita è di poche richieste al giorno, quindi ogni richiesta
legge un gruppo di frasi separate da pause lunghe, poi l'audio si taglia nelle pause.
Dopo ogni gruppo aggiorna src/data/voiceRecorded.json: se la quota finisce, lo stesso comando il
giorno dopo riprende dalle frasi mancanti.

    export GEMINI_API_KEY=...                            # serve anche ffmpeg
    python3 scripts/voice/generate.py --prova            # stessa frase con più voci, per scegliere
    python3 scripts/voice/generate.py --voce Kore        # registra tutte le frasi con la voce scelta
"""
import argparse
import array
import base64
import io
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CLIPS = ROOT / 'scripts' / 'voice' / 'clips.json'
INDEX = ROOT / 'src' / 'data' / 'voiceRecorded.json'
AUDIO = ROOT / 'public' / 'voce'
PROVA = ROOT / 'scripts' / 'voice' / 'prova'

API = 'https://generativelanguage.googleapis.com/v1beta/interactions'
MODEL = 'gemini-3.8-flash-tts'

STYLE = {
    False: ('Personal trainer italiano che guida un allenamento a casa. Voce naturale e calda, tono neutro '
            'con un filo di energia e di incoraggiamento, mai urlato. Ritmo tranquillo e chiaro. '
            'Italiano standard, senza accento regionale.'),
    True: ('Personal trainer italiano durante lo stretching. Voce naturale e calda, tono calmo e rilassato, '
           'ritmo lento, pause morbide. Italiano standard, senza accento regionale.'),
}
# Tra una frase e l'altra del gruppo: una pausa molto più lunga di quelle dentro una frase.
SEPARATOR = ' <long pause> <long pause> '

# Voci predefinite di Gemini da ascoltare: sei femminili e sei maschili, tra le più adatte a un coach.
PROVA_VOCI = ['Kore', 'Aoede', 'Sulafat', 'Despina', 'Leda', 'Achernar',
              'Charon', 'Orus', 'Achird', 'Iapetus', 'Sadaltager', 'Puck']
PROVA_TESTO = ('Flessioni. 8 ripetizioni. Mani sotto le spalle, corpo dritto. '
               'Petto quasi a terra, poi spingi. Forza, ci sei.')


class QuotaFinita(Exception):
    pass


def synthesize(text: str, voice: str, calm: bool, model: str) -> bytes:
    """Testo → WAV (24 kHz, mono, 16 bit). Aspetta se Gemini chiede di rallentare un attimo."""
    key = os.environ.get('GEMINI_API_KEY')
    if not key:
        sys.exit('Manca GEMINI_API_KEY: crea una chiave su https://aistudio.google.com/apikey')
    body = json.dumps({
        'model': model,
        'input': [{'type': 'text', 'text': text,
                   'annotations': [{'type': 'speech_metadata', 'style': STYLE[calm]}]}],
        'response_format': {'type': 'audio'},
        'generation_config': {'speech_config': [{'voice': voice}]},
    }).encode()
    for attempt in range(5):
        req = urllib.request.Request(API, body, {'Content-Type': 'application/json', 'x-goog-api-key': key})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                reply = json.load(r)
            break
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise RuntimeError(f'Gemini ha risposto {e.code}: {e.read().decode()[:500]}') from e
            wait = int(e.headers.get('retry-after') or 30)
            if wait > 120:
                raise QuotaFinita(json.loads(e.read() or b'{}').get('error', {}).get('message', '')) from e
            print(f'  troppe richieste, aspetto {wait} s', flush=True)
            time.sleep(wait)
    else:
        raise RuntimeError('Gemini continua a rifiutare le richieste: riprova più tardi.')
    for step in reply.get('steps', []):
        for part in step.get('content', []):
            if part.get('type') == 'audio':
                return base64.b64decode(part['data'])
    raise RuntimeError(f'Nessun audio nella risposta: {str(reply)[:300]}')


def pcm(wav_bytes: bytes):
    with wave.open(io.BytesIO(wav_bytes)) as w:
        assert w.getnchannels() == 1 and w.getsampwidth() == 2, 'atteso audio mono a 16 bit'
        return w.getframerate(), array.array('h', w.readframes(w.getnframes()))


def runs(flags):
    """[(valore, inizio, fine)] dei tratti consecutivi uguali."""
    out, start = [], 0
    for i in range(1, len(flags) + 1):
        if i == len(flags) or flags[i] != flags[start]:
            out.append((flags[start], start, i))
            start = i
    return out


def split(wav_bytes: bytes, texts: list[str]) -> list[bytes]:
    """Taglia l'audio di un gruppo in una parte per frase.

    I tagli vanno nelle pause lunghe (quelle tra una frase e l'altra) che cadono più vicino a dove
    dovrebbe finire ogni frase, stimato dalla sua lunghezza: una pausa lunga dentro una frase o un
    respiro dentro la pausa non spostano le frasi.
    """
    rate, samples = pcm(wav_bytes)
    hop = rate // 100  # 10 ms
    loud = [max(abs(s) for s in samples[i:i + hop]) > 900 for i in range(0, len(samples), hop)]
    # Un respiro o un click (<80 ms) in mezzo al silenzio è silenzio; un buco <40 ms in una parola è voce.
    for value, a, b in runs(loud):
        if value and b - a < 8 and a > 0 and b < len(loud):
            loud[a:b] = [False] * (b - a)
    for value, a, b in runs(loud):
        if not value and b - a < 4 and a > 0 and b < len(loud):
            loud[a:b] = [True] * (b - a)

    # Posizioni misurate in "tempo di voce" (solo i tratti parlati), così le pause non falsano la stima.
    spoken_before = [0]
    for on in loud:
        spoken_before.append(spoken_before[-1] + on)
    total = spoken_before[-1]
    pauses = [(a, b) for value, a, b in runs(loud)
              if not value and b - a >= 15 and spoken_before[a] > 0 and spoken_before[a] < total]
    weights = [len(t) + 6 for t in texts]
    expected = [total * sum(weights[:k + 1]) / sum(weights) for k in range(len(texts) - 1)]

    def cost(k, j):
        a, b = pauses[j]
        return 0.3 * abs(spoken_before[a] - expected[k]) / 100 - 2 * min(b - a, 250) / 100

    # Programmazione dinamica: un taglio per confine, in ordine, col costo totale minore.
    n, m = len(texts) - 1, len(pauses)
    if m < n:
        raise RuntimeError(f'Trovate solo {m} pause per {n} confini: riprova con gruppi più piccoli.')
    best = [[cost(0, j) for j in range(m)]]
    back = [[-1] * m]
    for k in range(1, n):
        row, prev = [float('inf')] * m, [-1] * m
        run_min, run_arg = float('inf'), -1
        for j in range(m):
            if j > 0 and best[k - 1][j - 1] < run_min:
                run_min, run_arg = best[k - 1][j - 1], j - 1
            if run_arg >= 0:
                row[j], prev[j] = run_min + cost(k, j), run_arg
        best.append(row)
        back.append(prev)
    chosen = []
    j = min(range(m), key=lambda x: best[n - 1][x]) if n else -1
    for k in range(n - 1, -1, -1):
        chosen.append(j)
        j = back[k][j]
    cuts = [pauses[j] for j in reversed(chosen)]

    bounds = [0] + [(a + b) // 2 * hop for a, b in cuts] + [len(samples)]
    # Controllo: ogni parte deve durare più o meno quanto ci si aspetta dalla sua frase.
    per_weight = total / sum(weights)
    for text, w, a, b in zip(texts, weights, bounds, bounds[1:]):
        got = spoken_before[min(b // hop, len(loud))] - spoken_before[a // hop]
        if not 0.4 < got / (w * per_weight) < 2.5:
            raise RuntimeError(f'Taglio dubbio su «{text}»: riprova con gruppi più piccoli.')
    out = []
    for a, b in zip(bounds, bounds[1:]):
        buf = io.BytesIO()
        with wave.open(buf, 'wb') as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(rate)
            w.writeframes(samples[a:b].tobytes())
        out.append(buf.getvalue())
    return out


def to_mp3(wav_bytes: bytes, out: Path):
    """Taglia il silenzio a inizio e fine, porta tutte le frasi allo stesso volume, salva in mp3 leggero."""
    trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04'
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', 'pipe:0',
         '-af', f'{trim},areverse,{trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11',
         '-ar', '24000', '-ac', '1', '-b:a', '48k', str(out)],
        input=wav_bytes, check=True)


def load_index():
    if INDEX.exists():
        return json.loads(INDEX.read_text())
    return {'voice': None, 'model': None, 'clips': {}}


def save_index(index):
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=1) + '\n')


def record(voice: str, model: str, group: int, pause: float, max_requests: int | None):
    clips = json.loads(CLIPS.read_text())
    index = load_index()
    if (index['voice'], index['model']) != (voice, model):
        # Voce o modello nuovi: si registra tutto da capo, per non mischiare due voci.
        index = {'voice': voice, 'model': model, 'clips': {}}
    AUDIO.mkdir(parents=True, exist_ok=True)

    wanted = {c['id'] for c in clips}
    for stale in set(index['clips']) - wanted:
        del index['clips'][stale]
        (AUDIO / f'{stale}.mp3').unlink(missing_ok=True)
    save_index(index)

    todo = [c for c in clips
            if index['clips'].get(c['id']) != c['text'] or not (AUDIO / f"{c['id']}.mp3").exists()]
    # Gruppi con lo stesso tono: una richiesta legge tutto con lo stesso stile.
    groups = []
    for calm in (False, True):
        same = [c for c in todo if c['calm'] == calm]
        groups += [same[i:i + group] for i in range(0, len(same), group)]
    groups = groups[:max_requests]
    print(f'{len(todo)} frasi da registrare con {voice} ({model}) in {len(groups)} richieste', flush=True)
    for g, batch in enumerate(groups, 1):
        print(f"[{g}/{len(groups)}] {', '.join(c['id'] for c in batch)}", flush=True)
        try:
            audio = synthesize(SEPARATOR.join(c['text'] for c in batch), voice, batch[0]['calm'], model)
        except QuotaFinita as e:
            sys.exit(f'Quota gratuita finita: riprendi più tardi con lo stesso comando.\n{e}')
        # L'audio intero resta in prova/ (non va su git): se un taglio esce male si può rifare senza quota.
        PROVA.mkdir(parents=True, exist_ok=True)
        (PROVA / f'gruppo-{batch[0]["id"]}.wav').write_bytes(audio)
        for c, part in zip(batch, split(audio, [c['text'] for c in batch])):
            to_mp3(part, AUDIO / f"{c['id']}.mp3")
            index['clips'][c['id']] = c['text']
        save_index(index)
        if g < len(groups):
            time.sleep(pause)
    print('Fatto.')


def audition(voices: list[str], model: str, pause: float):
    PROVA.mkdir(parents=True, exist_ok=True)
    for i, voice in enumerate(voices, 1):
        out = PROVA / f'{voice}.mp3'
        if out.exists():
            continue
        print(f'[{i}/{len(voices)}] {voice}', flush=True)
        try:
            to_mp3(synthesize(PROVA_TESTO, voice, False, model), out)
        except QuotaFinita as e:
            sys.exit(f'Quota gratuita finita: riprendi più tardi con lo stesso comando.\n{e}')
        time.sleep(pause)
    print(f'Campioni in {PROVA}')


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--voce', help='voce Gemini con cui registrare tutte le frasi, es. Kore')
    p.add_argument('--prova', nargs='*', metavar='VOCE',
                   help='registra la frase di prova con queste voci (senza nomi: 12 voci scelte)')
    p.add_argument('--modello', default=MODEL)
    p.add_argument('--gruppo', type=int, default=15, help='frasi lette in una sola richiesta')
    p.add_argument('--pausa', type=float, default=6, help='secondi tra una richiesta e l’altra')
    p.add_argument('--richieste', type=int, help='al massimo queste richieste (per provare)')
    a = p.parse_args()
    if a.prova is not None:
        audition(a.prova or PROVA_VOCI, a.modello, a.pausa)
    elif a.voce:
        record(a.voce, a.modello, a.gruppo, a.pausa, a.richieste)
    else:
        p.print_help()
