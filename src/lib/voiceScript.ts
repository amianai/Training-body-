import type { Category } from '@/data/types'
import type { WorkStep } from './session'

/*
 * Cosa dice la voce guida all'inizio di un esercizio. Testo scritto per essere ascoltato:
 * frasi brevi, punteggiatura che dà le pause giuste, tono calmo nello stretching e nella
 * mobilità, più carico nella forza e nell'enduro.
 */

const CALM: ReadonlySet<Category> = new Set(['stretching', 'mobilita'])

const CLOSERS = {
  calm: ['Respira piano.', 'Rilassati e respira.', 'Senza fretta.'],
  push: ['Vai!', 'Forza, ci sei.', 'Dai, comincia.', 'Controllato, e vai.'],
}

/** Testo da leggere e ritmo della voce. */
export interface Spoken {
  text: string
  calm: boolean
}

function target(step: WorkStep): string {
  const perSide = step.exercise.perSide && !step.side ? ' per lato' : ''
  if (step.seconds !== undefined) return `${step.seconds} secondi${perSide}`
  return `${step.reps} ripetizioni${perSide}`
}

/** Le frasi di "come si fa" chiuse da un punto, per far respirare la voce. */
function sentences(lines: string[]): string {
  return lines.map((l) => l.replace(/°/g, ' gradi').replace(/\s*[.!]?$/, '.')).join(' ')
}

/**
 * @param step esercizio che sta per iniziare
 * @param previous l'ultimo esercizio prima di questo (per sapere se è solo un cambio di lato)
 * @param firstTime prima volta che l'esercizio compare nella sessione: solo allora si spiega
 * @param n numero progressivo, per variare la frase finale
 */
export function spokenIntro(step: WorkStep, previous: WorkStep | undefined, firstTime: boolean, n: number): Spoken {
  const { exercise } = step
  const calm = CALM.has(exercise.category)
  const closers = calm ? CLOSERS.calm : CLOSERS.push
  const closer = closers[n % closers.length]

  // Secondo lato subito dopo il primo: basta dirlo.
  if (step.side === 'destro' && previous?.exercise.id === exercise.id && previous.side === 'sinistro') {
    return { text: `Cambia lato: ora il destro. ${target(step)}. ${closer}`, calm }
  }

  const side = step.side ? `, lato ${step.side}` : ''
  if (!firstTime) {
    const round = step.rounds > 1 ? `, giro ${step.round}` : ''
    return { text: `${exercise.name}${round}${side}. ${target(step)}. ${closer}`, calm }
  }
  return {
    text: `${exercise.name}${side}. ${target(step)}. ${sentences(exercise.cues)} ${closer}`,
    calm,
  }
}

export const DONE_PHRASE = 'Fatto! Ottimo lavoro. Ora recupera.'
