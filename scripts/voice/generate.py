"""Registra le frasi della voce guida con Gemini TTS e le salva come mp3 in public/voce.

Legge la lista da scripts/voice/clips.json (la scrive il test di src/lib/voiceScript.ts) e registra
solo le frasi nuove o cambiate. Dopo ogni frase aggiorna src/data/voiceRecorded.json, così si può
fermare e riprendere (per esempio quando finisce la quota gratuita del giorno).

    pip install "google-genai>=2.24"      # serve anche ffmpeg
    export GEMINI_API_KEY=...
    python3 scripts/voice/generate.py --prova            # stessa frase con più voci, per scegliere
    python3 scripts/voice/generate.py --voce Kore        # registra tutte le frasi con la voce scelta
"""
import argparse
import base64
import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CLIPS = ROOT / 'scripts' / 'voice' / 'clips.json'
INDEX = ROOT / 'src' / 'data' / 'voiceRecorded.json'
AUDIO = ROOT / 'public' / 'voce'
PROVA = ROOT / 'scripts' / 'voice' / 'prova'

MODEL = 'gemini-3.8-flash-tts'

STYLE = {
    False: ('Personal trainer italiano che guida un allenamento a casa. Voce naturale e calda, tono neutro '
            'con un filo di energia e di incoraggiamento, mai urlato. Ritmo tranquillo e chiaro. '
            'Italiano standard, senza accento regionale.'),
    True: ('Personal trainer italiano durante lo stretching. Voce naturale e calda, tono calmo e rilassato, '
           'ritmo lento, pause morbide. Italiano standard, senza accento regionale.'),
}

# Voci predefinite di Gemini da ascoltare: sei femminili e sei maschili, tra le più adatte a un coach.
PROVA_VOCI = ['Kore', 'Aoede', 'Sulafat', 'Despina', 'Leda', 'Achernar',
              'Charon', 'Orus', 'Achird', 'Iapetus', 'Sadaltager', 'Puck']
PROVA_TESTO = ('Flessioni. 8 ripetizioni. Mani sotto le spalle, corpo dritto. '
               'Petto quasi a terra, poi spingi. Forza, ci sei.')


def client():
    from google import genai

    key = os.environ.get('GEMINI_API_KEY')
    if not key:
        sys.exit('Manca GEMINI_API_KEY: crea una chiave su https://aistudio.google.com/apikey')
    return genai.Client(api_key=key)


def synthesize(gemini, text: str, voice: str, calm: bool, model: str) -> bytes:
    """Testo → audio WAV. Riprova quando Gemini chiede di rallentare; si ferma se la quota del giorno è finita."""
    wait = 20
    for attempt in range(6):
        try:
            interaction = gemini.interactions.create(
                model=model,
                input=[{'type': 'text', 'text': text,
                        'annotations': [{'type': 'speech_metadata', 'style': STYLE[calm]}]}],
                response_format={'type': 'audio'},
                generation_config={'speech_config': [{'voice': voice}]},
            )
            return base64.b64decode(interaction.output_audio.data)
        except Exception as e:
            if (getattr(e, 'code', None) or getattr(e, 'status_code', None)) != 429:
                raise
            if 'day' in str(e).lower():
                sys.exit(f'Quota gratuita di oggi finita: riprendi domani con lo stesso comando.\n{e}')
            print(f'  troppe richieste, aspetto {wait} s (tentativo {attempt + 1})', flush=True)
            time.sleep(wait)
            wait *= 2
    sys.exit('Gemini continua a rifiutare le richieste: riprova più tardi.')


def to_mp3(audio: bytes, out: Path):
    """Taglia il silenzio a inizio e fine, porta tutte le frasi allo stesso volume, salva in mp3 leggero."""
    raw = 'raw' if audio[:4] != b'RIFF' else 'wav'
    with tempfile.NamedTemporaryFile(suffix='.' + raw) as src:
        src.write(audio)
        src.flush()
        fmt = ['-f', 's16le', '-ar', '24000', '-ac', '1'] if raw == 'raw' else []
        trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.04'
        subprocess.run(
            ['ffmpeg', '-y', '-loglevel', 'error', *fmt, '-i', src.name,
             '-af', f'{trim},areverse,{trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11',
             '-ar', '24000', '-ac', '1', '-b:a', '48k', str(out)],
            check=True)


def load_index():
    if INDEX.exists():
        return json.loads(INDEX.read_text())
    return {'voice': None, 'model': None, 'clips': {}}


def save_index(index):
    INDEX.write_text(json.dumps(index, ensure_ascii=False, indent=1) + '\n')


def record(voice: str, model: str, pause: float, limit: int | None):
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
    if limit:
        todo = todo[:limit]
    print(f'{len(todo)} frasi da registrare con {voice} ({model})', flush=True)
    gemini = client()
    for i, c in enumerate(todo, 1):
        print(f"[{i}/{len(todo)}] {c['id']}: {c['text']}", flush=True)
        to_mp3(synthesize(gemini, c['text'], voice, c['calm'], model), AUDIO / f"{c['id']}.mp3")
        index['clips'][c['id']] = c['text']
        save_index(index)
        if i < len(todo):
            time.sleep(pause)
    print('Fatto.')


def audition(voices: list[str], model: str, pause: float):
    PROVA.mkdir(parents=True, exist_ok=True)
    gemini = client()
    for i, voice in enumerate(voices, 1):
        out = PROVA / f'{voice}.mp3'
        if out.exists():
            continue
        print(f'[{i}/{len(voices)}] {voice}', flush=True)
        to_mp3(synthesize(gemini, PROVA_TESTO, voice, False, model), out)
        time.sleep(pause)
    print(f'Campioni in {PROVA}')


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--voce', help='voce Gemini con cui registrare tutte le frasi, es. Kore')
    p.add_argument('--prova', nargs='*', metavar='VOCE',
                   help='registra la frase di prova con queste voci (senza nomi: 12 voci scelte)')
    p.add_argument('--modello', default=MODEL)
    p.add_argument('--pausa', type=float, default=6, help='secondi tra una richiesta e l’altra (quota gratuita)')
    p.add_argument('--limite', type=int, help='registra al massimo queste frasi (per provare)')
    a = p.parse_args()
    if a.prova is not None:
        audition(a.prova or PROVA_VOCI, a.modello, a.pausa)
    elif a.voce:
        record(a.voce, a.modello, a.pausa, a.limite)
    else:
        p.print_help()
