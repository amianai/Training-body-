"""Ritaglia l'audio di un gruppo riconoscendo le parole, quando il taglio sulle pause di generate.py sbaglia.

Divide l'audio a ogni pausa, trascrive ogni pezzetto con Whisper e assegna i pezzetti alle frasi attese,
in ordine, scegliendo la divisione che somiglia di più ai testi. Serve sherpa-onnx con un modello Whisper
(cartella con *-encoder.int8.onnx, *-decoder.int8.onnx, *-tokens.txt).

    python3 scripts/voice/riallinea.py --voce Schedar --neutro --gruppo 16 --whisper <cartella del modello>

Rifà tutti i gruppi di cui c'è l'audio intero in scripts/voice/prova/ (gruppo-<voce>-<prima frase>.wav).
"""
import argparse
import io
import json
import re
import wave
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np
import sherpa_onnx

import generate as g

NUM = {'2': 'due', '3': 'tre', '4': 'quattro', '5': 'cinque', '6': 'sei', '7': 'sette', '8': 'otto', '10': 'dieci',
       '12': 'dodici', '14': 'quattordici', '16': 'sedici', '18': 'diciotto', '20': 'venti', '25': 'venticinque',
       '30': 'trenta', '35': 'trentacinque', '40': 'quaranta', '45': 'quarantacinque', '50': 'cinquanta',
       '55': 'cinquantacinque', '60': 'sessanta', '90': 'novanta'}


def norm(text: str) -> str:
    text = re.sub(r'\d+', lambda m: NUM.get(m.group(), m.group()), text.lower().replace('’', "'"))
    return ''.join(re.findall(r'[a-zàèéìòù]+', text))


def segments(samples, rate, min_pause=0.25):
    """Pezzetti tra una pausa e l'altra: [(inizio, fine)] in campioni, tagliati a metà pausa."""
    hop = rate // 100
    loud = [max(abs(int(s)) for s in samples[i:i + hop]) > 900 for i in range(0, len(samples), hop)]
    cuts = [0]
    for value, a, b in g.runs(loud):
        if not value and (b - a) * 0.01 >= min_pause and a > 0 and b < len(loud):
            cuts.append((a + b) // 2 * hop)
    cuts.append(len(samples))
    return list(zip(cuts, cuts[1:]))


def align(heard: list[str], expected: list[str], max_span=14):
    """Divide i pezzetti in tanti gruppi consecutivi quante sono le frasi, massimizzando la somiglianza."""
    m, n = len(heard), len(expected)
    score = lambda i, a, b: SequenceMatcher(None, expected[i], ''.join(heard[a:b])).ratio() * (len(expected[i]) + 5)
    best = [[-1.0] * (m + 1) for _ in range(n + 1)]
    back = [[0] * (m + 1) for _ in range(n + 1)]
    best[0][0] = 0.0
    for i in range(1, n + 1):
        for j in range(i, m - (n - i) + 1):
            for k in range(max(i - 1, j - max_span), j):
                if best[i - 1][k] < 0:
                    continue
                value = best[i - 1][k] + score(i - 1, k, j)
                if value > best[i][j]:
                    best[i][j], back[i][j] = value, k
    bounds, j = [m], m
    for i in range(n, 0, -1):
        j = back[i][j]
        bounds.append(j)
    return bounds[::-1]


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--voce', required=True)
    p.add_argument('--neutro', action='store_true')
    p.add_argument('--gruppo', type=int, default=15)
    p.add_argument('--whisper', required=True, type=Path)
    a = p.parse_args()

    w = a.whisper
    rec = sherpa_onnx.OfflineRecognizer.from_whisper(
        encoder=str(next(w.glob('*encoder.int8.onnx'))), decoder=str(next(w.glob('*decoder.int8.onnx'))),
        tokens=str(next(w.glob('*tokens.txt'))), language='it', task='transcribe', num_threads=4)

    def transcribe(part, rate):
        x = np.asarray(part, dtype=np.float32) / 32768
        stream = rec.create_stream()
        stream.accept_waveform(rate, x)
        rec.decode_stream(stream)
        return stream.result.text

    clips = {c['id']: c for c in json.loads(g.CLIPS.read_text())}
    pack_id = a.voce.lower()
    index = g.load_index()
    pack = index['voices'][pack_id]
    order = [c for c in clips.values() if not (a.neutro and g.is_cheer(c['id']))]
    for wav_path in sorted(g.PROVA.glob(f'gruppo-{pack_id}-*.wav')):
        first = wav_path.stem.removeprefix(f'gruppo-{pack_id}-')
        listed = wav_path.with_suffix('.json')
        if listed.exists():
            # generate.py ha scritto quali frasi ha mandato in questa richiesta
            same = [clips[i] for i in json.loads(listed.read_text()) if i in clips]
        else:
            # audio vecchio, senza elenco: dalla prima frase in poi, solo frasi di questo stile
            start = next((i for i, c in enumerate(order) if c['id'] == first), None)
            if start is None:
                print(f'{wav_path.name}: la frase {first} non c\'è più, salto')
                continue
            same = [c for c in order[start:] if a.neutro or c['calm'] == order[start]['calm']]
        if any(pack['clips'].get(c['id']) not in (None, c['text']) for c in same):
            print(f'{wav_path.name}: alcune frasi sono cambiate dopo la registrazione, salto')
            continue
        rate, samples = g.pcm(wav_path.read_bytes())
        segs = segments(samples, rate)
        heard = [norm(transcribe(samples[s:e], rate)) for s, e in segs]
        # quante frasi contiene davvero l'audio: si prova la dimensione piena e quelle più corte (ultimo gruppo)
        best = None
        for size in range(min(a.gruppo, len(same)), 0, -1):
            batch = same[:size]
            if len(segs) < size:
                continue
            bounds = align(heard, [norm(c['text']) for c in batch])
            ratios = [SequenceMatcher(None, norm(c['text']), ''.join(heard[x:y])).ratio() for c, x, y in zip(batch, bounds, bounds[1:])]
            mean = sum(ratios) / len(ratios)
            if best is None or mean > best[0] + 0.02:
                best = (mean, batch, bounds, ratios)
            if size == min(a.gruppo, len(same)) and mean > 0.9:
                break
        mean, batch, bounds, ratios = best
        print(f'{wav_path.name}: {len(batch)} frasi, somiglianza media {mean:.2f}')
        for c, x, y, r in zip(batch, bounds, bounds[1:], ratios):
            part = samples[segs[x][0]:segs[y - 1][1]]
            buf = io.BytesIO()
            with wave.open(buf, 'wb') as out:
                out.setnchannels(1)
                out.setsampwidth(2)
                out.setframerate(rate)
                out.writeframes(part.tobytes())
            g.to_mp3(buf.getvalue(), g.AUDIO / pack_id / f"{c['id']}.mp3")
            pack['clips'][c['id']] = c['text']
            if r < 0.8:
                print(f"  da riascoltare ({r:.2f}) {c['id']}: {''.join(heard[x:y])}")
    pack['complete'] = all(c['id'] in pack['clips'] and pack['clips'][c['id']] == c['text'] for c in order)
    g.save_index(index)


if __name__ == '__main__':
    main()
