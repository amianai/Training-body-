# Voce guida registrata

La voce guida dice sempre le stesse frasi: nome dell'esercizio, giro, lato, obiettivo, come si fa e una frase di incoraggiamento.
Invece di farle leggere al telefono (le voci italiane di sistema sono robotiche), si registrano **una volta** con un modello vero e l'app le rimonta in fila.

- `src/lib/voiceScript.ts`: cosa dire e in quali pezzi (clip). Ogni pezzo ha un nome fisso, che è anche il nome del file audio.
- `scripts/voice/clips.json`: tutti i pezzi che la scheda può far dire (87 oggi, circa 3.200 caratteri). Lo scrive il test di `voiceScript.ts`.
- `public/voce/<id>.mp3`: i pezzi registrati. Il service worker li salva, quindi funzionano anche offline.
- `src/data/voiceRecorded.json`: quale voce ha registrato e quale testo ha letto ogni pezzo.
  L'app usa un audio solo se il testo è ancora quello di oggi. Altrimenti, o se manca, usa la voce italiana del telefono.

## Registrare

Serve una chiave gratuita di Gemini ([Google AI Studio](https://aistudio.google.com/apikey)) nella variabile `GEMINI_API_KEY`, più `ffmpeg`.

```bash
python3 scripts/voice/generate.py --prova          # la stessa frase con 12 voci, in scripts/voice/prova/
python3 scripts/voice/generate.py --voce Kore      # registra tutti i pezzi con la voce scelta
```

Modello: `gemini-3.8-flash-tts`, gratuito con la quota free di AI Studio. Il tono si dà a parte, in `STYLE` dentro `generate.py`: neutro con un filo di energia, più calmo nello stretching.

La quota gratuita è di **10 richieste al giorno**. Per questo ogni richiesta legge un gruppo di frasi (15 di default) separate da pause lunghe, e lo script taglia l'audio nelle pause.
Se un taglio non torna con la durata attesa, lo script si ferma senza salvare quel gruppo. L'audio intero di ogni gruppo resta in `scripts/voice/prova/`, fuori da git.
Se la quota del giorno finisce, lo script si ferma: lo stesso comando, il giorno dopo, riprende dai pezzi mancanti.
Il modello `gemini-3.8-flash-lite-tts` ha una quota separata, ma con tante frasi brevi in fila ne salta o ne unisce alcune: meglio non usarlo.

Dopo la registrazione conviene riascoltare i pezzi, o farli trascrivere, per scoprire tagli sbagliati.

## Quando cambia la scheda o un testo

```bash
npx vitest run -u                                  # aggiorna scripts/voice/clips.json
python3 scripts/voice/generate.py --voce Kore      # registra solo i pezzi nuovi o cambiati
```

Cambiare voce riregistra tutto, per non mischiare due voci nella stessa sessione.
