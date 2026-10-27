// Voce guida con la sintesi vocale del telefono (sul Pixel: le voci italiane di Google, anche offline).

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
let voice: SpeechSynthesisVoice | null = null

/** La voce italiana più naturale disponibile: prima quelle "neurali", poi quelle di Google. */
function pickVoice() {
  if (!synth) return
  const italian = synth.getVoices().filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('it'))
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online|enhanced|premium/i.test(v.name) ? 4 : 0) +
    (/google/i.test(v.name) ? 2 : 0) +
    (v.localService ? 1 : 0)
  voice = italian.sort((a, b) => score(b) - score(a))[0] ?? null
}

if (synth) {
  pickVoice()
  synth.addEventListener('voiceschanged', pickVoice)
}

export const voiceAvailable = synth !== null

/** Legge un testo, interrompendo quello che stava dicendo. */
export function speak(text: string, calm = false) {
  if (!synth) return
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'it-IT'
  if (voice) utterance.voice = voice
  // Un filo più lenta e bassa nello stretching, ritmo normale altrove: niente voce da robot accelerato.
  utterance.rate = calm ? 0.94 : 1.02
  utterance.pitch = calm ? 0.96 : 1.02
  synth.speak(utterance)
}

export function stopSpeaking() {
  synth?.cancel()
}
