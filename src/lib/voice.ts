import { useSyncExternalStore } from 'react'

// Voce guida con la sintesi vocale del telefono (sul Pixel: le voci italiane di Google, anche offline).
// Si parla solo con una voce italiana: una voce inglese che legge l'italiano non si capisce.

const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
let voices: SpeechSynthesisVoice[] = []
let version = 0
const listeners = new Set<() => void>()

function refresh() {
  if (!synth) return
  voices = synth.getVoices()
  version++
  listeners.forEach((l) => l())
}

if (synth) {
  refresh()
  synth.addEventListener('voiceschanged', refresh)
}

const isItalian = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace('_', '-').startsWith('it')

/** Voci italiane, dalla più naturale: prima quelle "neurali", poi quelle di Google, poi quelle sul telefono. */
export function italianVoices(): SpeechSynthesisVoice[] {
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online|enhanced|premium/i.test(v.name) ? 4 : 0) +
    (/google/i.test(v.name) ? 2 : 0) +
    (v.localService ? 1 : 0)
  return voices.filter(isItalian).sort((a, b) => score(b) - score(a))
}

export type VoiceStatus =
  | { kind: 'unsupported' }
  /** Il browser non ha ancora detto quali voci ci sono: si prova chiedendo l'italiano. */
  | { kind: 'unknown' }
  | { kind: 'missing' }
  | { kind: 'ok'; voice: SpeechSynthesisVoice }

export function voiceStatus(preferred?: string | null): VoiceStatus {
  if (!synth) return { kind: 'unsupported' }
  if (voices.length === 0) return { kind: 'unknown' }
  const italian = italianVoices()
  const voice = italian.find((v) => v.name === preferred) ?? italian[0]
  return voice ? { kind: 'ok', voice } : { kind: 'missing' }
}

/** Stato della voce che si aggiorna quando il telefono carica le voci. */
export function useVoiceStatus(preferred?: string | null): VoiceStatus {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => version,
  )
  return voiceStatus(preferred)
}

export const voiceAvailable = synth !== null

/** Legge un testo con la voce italiana, interrompendo quello che stava dicendo. Senza voce italiana tace. */
export function speak(text: string, calm = false, preferred?: string | null) {
  if (!synth) return
  const status = voiceStatus(preferred)
  if (status.kind === 'missing') return
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'it-IT'
  if (status.kind === 'ok') utterance.voice = status.voice
  // Un filo più lenta e bassa nello stretching, ritmo normale altrove: niente voce da robot accelerato.
  utterance.rate = calm ? 0.94 : 1.02
  utterance.pitch = calm ? 0.96 : 1.02
  synth.speak(utterance)
}

export function stopSpeaking() {
  synth?.cancel()
}
