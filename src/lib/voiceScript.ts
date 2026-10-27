import { PLAN, PRACTICE } from '@/data/plan'
import type { Category, Exercise } from '@/data/types'
import { buildSteps, type Side, type Step, type WorkStep } from './session'

/*
 * Cosa dice la voce guida all'inizio di un esercizio. Testo scritto per essere ascoltato:
 * frasi brevi, punteggiatura che dà le pause giuste, tono calmo nello stretching e nella
 * mobilità, più carico nella forza e nell'enduro.
 *
 * Ogni frase è un pezzo (clip) con un nome fisso: così si può registrare una volta con una
 * voce vera e rimontare per qualsiasi esercizio, giro e livello della scheda.
 */

const CALM: ReadonlySet<Category> = new Set(['stretching', 'mobilita'])

const CLOSERS = {
  calm: ['Respira piano.', 'Rilassati e respira.', 'Senza fretta.'],
  push: ['Vai!', 'Forza, ci sei.', 'Dai, comincia.', 'Controllato, e vai.'],
}

/** Una frase registrabile: `id` è anche il nome del file audio. */
export interface Clip {
  id: string
  text: string
  /** Da leggere con calma (stretching e mobilità). */
  calm: boolean
}

/** Cosa dire: i pezzi in fila, lo stesso testo per intero per la voce del telefono e il ritmo. */
export interface Spoken {
  clips: Clip[]
  text: string
  calm: boolean
}

const clip = (id: string, text: string, calm = false): Clip => ({ id, text, calm })

const isCalm = (exercise: Exercise) => CALM.has(exercise.category)

/** Le frasi di "come si fa" chiuse da un punto, per far respirare la voce. */
function sentences(lines: string[]): string {
  return lines.map((l) => l.replace(/°/g, ' gradi').replace(/\s*[.!]?$/, '.')).join(' ')
}

const nameClip = (exercise: Exercise) => clip(`nome-${exercise.id}`, `${exercise.name}.`, isCalm(exercise))
const howClip = (exercise: Exercise) => clip(`come-${exercise.id}`, sentences(exercise.cues), isCalm(exercise))
const roundClip = (round: number) => clip(`giro-${round}`, `Giro ${round}.`)
const sideClip = (side: Side) => clip(`lato-${side}`, `Lato ${side}.`)
const SWITCH = clip('cambia-lato', 'Cambia lato: ora il destro.')

function targetClip(step: WorkStep): Clip {
  const perSide = step.exercise.perSide && !step.side
  const [key, n, unit] = step.seconds !== undefined ? ['sec', step.seconds, 'secondi'] : ['rip', step.reps, 'ripetizioni']
  return clip(`${key}-${n}${perSide ? '-lato' : ''}`, `${n} ${unit}${perSide ? ' per lato' : ''}.`)
}

function closerClip(calm: boolean, n: number): Clip {
  const closers = calm ? CLOSERS.calm : CLOSERS.push
  const i = n % closers.length
  return clip(`${calm ? 'calma' : 'forza'}-${i}`, closers[i], calm)
}

function spoken(clips: Clip[], calm: boolean): Spoken {
  return { clips, text: clips.map((c) => c.text).join(' '), calm }
}

/**
 * @param step esercizio che sta per iniziare
 * @param previous l'ultimo esercizio prima di questo (per sapere se è solo un cambio di lato)
 * @param firstTime prima volta che l'esercizio compare nella sessione: solo allora si spiega
 * @param n numero progressivo, per variare la frase finale
 */
export function spokenIntro(step: WorkStep, previous: WorkStep | undefined, firstTime: boolean, n: number): Spoken {
  const { exercise } = step
  const calm = isCalm(exercise)
  const closer = closerClip(calm, n)

  // Secondo lato subito dopo il primo: basta dirlo.
  if (step.side === 'destro' && previous?.exercise.id === exercise.id && previous.side === 'sinistro') {
    return spoken([SWITCH, targetClip(step), closer], calm)
  }

  const head = [nameClip(exercise)]
  if (!firstTime && step.rounds > 1) head.push(roundClip(step.round))
  if (step.side) head.push(sideClip(step.side))
  const how = firstTime ? [howClip(exercise)] : []
  return spoken([...head, targetClip(step), ...how, closer], calm)
}

/** Cosa dire al passo `index` di una sessione (niente durante i recuperi). */
export function introAt(steps: Step[], index: number): Spoken | null {
  const step = steps[index]
  if (step?.kind !== 'work') return null
  const previous = steps.slice(0, index).filter((s): s is WorkStep => s.kind === 'work')
  return spokenIntro(step, previous.at(-1), !previous.some((s) => s.exercise.id === step.exercise.id), previous.length)
}

export const DONE: Spoken = spoken([clip('fatto', 'Fatto! Ottimo lavoro. Ora recupera.')], false)

/** Tutte le frasi che la scheda può far dire, una volta sola: è la lista da registrare. */
export function allClips(): Clip[] {
  const byId = new Map<string, Clip>()
  const add = (c: Clip) => {
    const seen = byId.get(c.id)
    if (seen && seen.text !== c.text) throw new Error(`Clip ${c.id} con due testi diversi`)
    byId.set(c.id, c)
  }
  for (const session of [...PLAN.sessions, PRACTICE]) {
    for (const mini of [false, true]) {
      const steps = buildSteps(session, { mini })
      steps.forEach((_, i) => introAt(steps, i)?.clips.forEach(add))
    }
  }
  DONE.clips.forEach(add)
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id, 'it', { numeric: true }))
}
