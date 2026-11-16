import { useSyncExternalStore } from 'react'

import recorded from '@/data/voiceRecorded.json'
import type { Spoken } from './voiceScript'

// Voce guida: prima le frasi registrate con una voce vera (scripts/voice), poi la sintesi vocale del telefono.
// Col telefono si parla solo con una voce italiana: una voce inglese che legge l'italiano non si capisce.

/**
 * Una voce registrata: le sue frasi (id → testo letto) stanno in public/voce/<id>/.
 * Un audio vale solo se il testo è ancora quello di oggi.
 */
interface VoicePack {
  voice: string
  model: string
  /** Ha anche le frasi di incoraggiamento; senza, è una voce "solo tecnica". */
  cheers: boolean
  /** Tutte le frasi sono registrate: solo allora la voce si può scegliere. */
  complete: boolean
  clips: Record<string, string>
}

const PACKS = Object.entries(recorded.voices as Record<string, VoicePack>).filter(([, pack]) => pack.complete)

export interface VoiceChoice {
  id: string
  name: string
  cheers: boolean
}

/** Voci registrate tra cui scegliere, la prima è quella di partenza. */
export const recordedVoices: VoiceChoice[] = PACKS.map(([id, pack]) => ({ id, name: pack.voice, cheers: pack.cheers }))
export const hasRecordings = recordedVoices.length > 0

/** La voce scelta, o la prima se la scelta non c'è (più). */
export function recordedVoiceFor(id: string | null | undefined): VoiceChoice | null {
  return recordedVoices.find((v) => v.id === id) ?? recordedVoices[0] ?? null
}

function packClips(id: string | null | undefined): [string, Record<string, string>] | null {
  const choice = recordedVoiceFor(id)
  const pack = choice && PACKS.find(([packId]) => packId === choice.id)
  return pack ? [pack[0], pack[1].clips] : null
}

export function isRecorded(spoken: Spoken, pack?: string | null): boolean {
  const clips = packClips(pack)?.[1]
  return clips !== undefined && spoken.clips.length > 0 && spoken.clips.every((c) => clips[c.id] === c.text)
}

declare global {
  interface Window {
    /** Nella pagina di prova su claude.ai gli audio stanno dentro la pagina: voce → frase → audio. */
    __VOCE__?: Record<string, Record<string, string>>
  }
}

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

export const voiceAvailable = synth !== null || hasRecordings

/** Pausa tra due frasi registrate, come tra due frasi dette di fila. */
const GAP_MS = 200

let playing: { cancelled: boolean; audio?: HTMLAudioElement; timer?: number } | null = null

function playClips(spoken: Spoken, pack: string) {
  const run: NonNullable<typeof playing> = { cancelled: false }
  playing = run
  const audios = spoken.clips.map((c) => {
    const audio = new Audio(window.__VOCE__?.[pack]?.[c.id] ?? `${import.meta.env.BASE_URL}voce/${pack}/${c.id}.mp3`)
    audio.preload = 'auto'
    return audio
  })
  const play = (i: number) => {
    if (run.cancelled || i >= audios.length) return
    const audio = audios[i]
    run.audio = audio
    audio.onended = () => {
      run.timer = window.setTimeout(() => play(i + 1), GAP_MS)
    }
    audio.onerror = () => play(i + 1)
    // Se il browser rifiuta l'audio (nessun tocco sulla pagina) la guida resta zitta.
    audio.play().catch(() => {})
  }
  play(0)
}

/** Dice una frase, interrompendo quella prima: registrata se c'è, altrimenti con la voce italiana del telefono. */
export function say(spoken: Spoken, pack?: string | null, preferred?: string | null) {
  stopSpeaking()
  const recordedPack = packClips(pack)?.[0]
  if (recordedPack && isRecorded(spoken, pack)) playClips(spoken, recordedPack)
  else speak(spoken.text, spoken.calm, preferred)
}

/** Legge un testo con la voce italiana del telefono, interrompendo quello che stava dicendo. Senza voce italiana tace. */
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
  if (!playing) return
  playing.cancelled = true
  playing.audio?.pause()
  window.clearTimeout(playing.timer)
  playing = null
}
