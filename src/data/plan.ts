import type { Block, Plan, Session } from './types'

/*
 * LA MIA SCHEDA: corpo libero (niente attrezzi per ora), tutto il corpo, con attenzione alla moto:
 * presa e avambracci, gambe in piedi, schiena, core ed equilibrio.
 * Quattro sessioni base; ogni fase usa le stesse sessioni a un livello più alto
 * (un giro in più dalla seconda fase, poi +2 ripetizioni e +5 secondi a livello).
 * Progressione presa dalla ricerca sull'enduro: 2, poi 3 sessioni a settimana, 20-30 minuti.
 */

const A: Session = {
  id: 'a',
  name: 'Parte alta e presa',
  focus: 'Spinta, tirata, posizione in moto e avambracci',
  blocks: [
    {
      title: 'Riscaldamento',
      rounds: 1,
      restBetweenItems: 10,
      items: [
        { exerciseId: 'm1', seconds: 40 },
        { exerciseId: 'm2', reps: 8 },
        { exerciseId: 'm3', reps: 6 },
      ],
    },
    {
      title: 'Circuito',
      rounds: 2,
      restBetweenItems: 20,
      restBetweenRounds: 60,
      items: [
        { exerciseId: 'f1', reps: 8 },
        { exerciseId: 'f14', reps: 8 },
        { exerciseId: 'e1', seconds: 30 },
      ],
    },
    {
      title: 'Presa',
      rounds: 2,
      restBetweenItems: 15,
      restBetweenRounds: 45,
      items: [
        { exerciseId: 'e4', seconds: 30 },
        { exerciseId: 'e3', seconds: 30 },
      ],
    },
    {
      title: 'Defaticamento',
      rounds: 1,
      restBetweenItems: 5,
      items: [
        { exerciseId: 's1', seconds: 30 },
        { exerciseId: 's2', seconds: 30 },
        { exerciseId: 's3', seconds: 30 },
      ],
    },
  ],
}

const B: Session = {
  id: 'b',
  name: 'Gambe, equilibrio e core',
  focus: 'Stare in piedi sulle pedane a lungo',
  blocks: [
    {
      title: 'Riscaldamento',
      rounds: 1,
      restBetweenItems: 10,
      items: [
        { exerciseId: 'm7', reps: 10 },
        { exerciseId: 'm5', reps: 4 },
      ],
    },
    {
      title: 'Equilibrio',
      rounds: 2,
      restBetweenRounds: 20,
      items: [{ exerciseId: 'e11', seconds: 30 }],
    },
    {
      title: 'Circuito gambe',
      rounds: 2,
      restBetweenItems: 20,
      restBetweenRounds: 60,
      items: [
        { exerciseId: 'f6', reps: 8 },
        { exerciseId: 'e12', reps: 6 },
        { exerciseId: 'e2', seconds: 20 },
      ],
    },
    {
      title: 'Core',
      rounds: 2,
      restBetweenItems: 20,
      restBetweenRounds: 45,
      items: [
        { exerciseId: 'f9', reps: 8 },
        { exerciseId: 'f8', seconds: 25 },
      ],
    },
    {
      title: 'Defaticamento',
      rounds: 1,
      restBetweenItems: 5,
      items: [
        { exerciseId: 's5', seconds: 30 },
        { exerciseId: 's7', seconds: 30 },
        { exerciseId: 's8', seconds: 30 },
      ],
    },
  ],
}

const C: Session = {
  id: 'c',
  name: 'Energia ed enduro',
  focus: 'Cardio a intervalli, tutto il corpo e stretching lungo',
  blocks: [
    {
      title: 'Cardio',
      rounds: 6,
      restBetweenRounds: 30,
      items: [{ exerciseId: 'f11', seconds: 30 }],
    },
    {
      title: 'Circuito enduro',
      rounds: 2,
      restBetweenItems: 20,
      restBetweenRounds: 60,
      items: [
        { exerciseId: 'e1', seconds: 40 },
        { exerciseId: 'f13', reps: 10 },
        { exerciseId: 'f1', reps: 8 },
        { exerciseId: 'f14', reps: 8 },
      ],
    },
    {
      title: 'Stretching lungo',
      rounds: 1,
      restBetweenItems: 5,
      items: [
        { exerciseId: 'm3', reps: 6 },
        { exerciseId: 's1', seconds: 30 },
        { exerciseId: 's2', seconds: 30 },
        { exerciseId: 's5', seconds: 30 },
        { exerciseId: 's8', seconds: 30 },
      ],
    },
  ],
}

/** Giornata leggera, solo nell'ultima fase: mobilità, equilibrio e stretching. */
const D: Session = {
  id: 'd',
  name: 'Mobilità e recupero',
  focus: 'Giornata leggera: articolazioni libere ed equilibrio',
  blocks: [
    {
      title: 'Mobilità',
      rounds: 1,
      restBetweenItems: 10,
      items: [
        { exerciseId: 'm1', seconds: 40 },
        { exerciseId: 'm2', reps: 8 },
        { exerciseId: 'm3', reps: 6 },
        { exerciseId: 'm5', reps: 4 },
        { exerciseId: 'm7', reps: 10 },
      ],
    },
    {
      title: 'Equilibrio',
      rounds: 2,
      restBetweenRounds: 20,
      items: [{ exerciseId: 'e11', seconds: 30 }],
    },
    {
      title: 'Stretching',
      rounds: 1,
      restBetweenItems: 5,
      items: ['s1', 's2', 's3', 's5', 's7', 's8'].map((exerciseId) => ({ exerciseId, seconds: 30 })),
    },
  ],
}

/**
 * La stessa sessione a un livello più alto. Crescono solo i blocchi ripetuti (circuiti e serie):
 * riscaldamento e stretching restano uguali.
 */
function atLevel(base: Session, level: number): Session {
  const grow = (block: Block): Block => {
    if (block.rounds < 2) return block
    return {
      ...block,
      rounds: level >= 1 ? block.rounds + 1 : block.rounds,
      items: block.items.map((item) => ({
        ...item,
        reps: item.reps === undefined ? undefined : item.reps + 2 * level,
        seconds: item.seconds === undefined ? undefined : item.seconds + 5 * level,
      })),
    }
  }
  return { ...base, id: `${base.id}${level + 1}`, blocks: base.blocks.map(grow) }
}

export const PLAN: Plan = {
  name: 'La mia scheda',
  isExample: false,
  phases: [
    { label: 'Adattamento', weeks: 2, sessionsPerWeek: 2, rotation: ['a1', 'b1'] },
    { label: 'Base', weeks: 2, sessionsPerWeek: 3, rotation: ['a2', 'b2', 'c2'] },
    { label: 'Costruzione', weeks: 4, sessionsPerWeek: 3, rotation: ['a3', 'b3', 'c3'] },
    { label: 'Sviluppo', weeks: 4, sessionsPerWeek: 3, rotation: ['a4', 'b4', 'c4', 'd4'] },
  ],
  sessions: [
    atLevel(A, 0),
    atLevel(B, 0),
    ...[A, B, C].map((s) => atLevel(s, 1)),
    ...[A, B, C].map((s) => atLevel(s, 2)),
    ...[A, B, C, D].map((s) => atLevel(s, 3)),
  ],
}

/** Un giro veloce di tutti gli esercizi, per vedere gli omini. Non conta per la streak. */
export const PRACTICE: Session = {
  id: 'prova',
  name: 'Prova: tutti gli esercizi',
  focus: 'Un giro veloce di tutti gli esercizi, per vedere come si fanno',
  practice: true,
  doneMessage: 'Prova finita: non conta per la streak.',
  blocks: [
    {
      title: 'Stretching',
      rounds: 1,
      restBetweenItems: 6,
      restAfter: 6,
      items: ['s1', 's2', 's3', 's5', 's7', 's8'].map((exerciseId) => ({ exerciseId, seconds: 8 })),
    },
    {
      title: 'Mobilità',
      rounds: 1,
      restBetweenItems: 6,
      restAfter: 6,
      items: [
        { exerciseId: 'm1', seconds: 8 },
        { exerciseId: 'm2', reps: 4 },
        { exerciseId: 'm3', reps: 3 },
        { exerciseId: 'm5', reps: 3 },
        { exerciseId: 'm7', reps: 4 },
      ],
    },
    {
      title: 'Enduro',
      rounds: 1,
      restBetweenItems: 6,
      restAfter: 6,
      items: [
        { exerciseId: 'e1', seconds: 8 },
        { exerciseId: 'e2', seconds: 8 },
        { exerciseId: 'e3', seconds: 8 },
        { exerciseId: 'e4', seconds: 8 },
        { exerciseId: 'e11', seconds: 8 },
        { exerciseId: 'e12', reps: 3 },
      ],
    },
    {
      title: 'Flex',
      rounds: 1,
      restBetweenItems: 6,
      items: [
        { exerciseId: 'f1', reps: 5 },
        { exerciseId: 'f14', reps: 4 },
        { exerciseId: 'f6', reps: 4 },
        { exerciseId: 'f8', seconds: 8 },
        { exerciseId: 'f9', reps: 4 },
        { exerciseId: 'f13', reps: 4 },
        { exerciseId: 'f11', seconds: 8 },
      ],
    },
  ],
}

/**
 * Scarico dopo un giro in moto, la sera: avambracci induriti, schiena e anche. Non conta come
 * allenamento (conta già il giro) e non si salva.
 */
export const COOLDOWN: Session = {
  id: 'scarico',
  name: 'Scarico post-giro',
  focus: 'Avambracci, schiena e anche, dopo la moto',
  practice: true,
  doneMessage: 'Scarico fatto: buon recupero.',
  blocks: [
    {
      title: 'Avambracci',
      rounds: 1,
      restBetweenItems: 5,
      restAfter: 5,
      items: [
        { exerciseId: 'm1', seconds: 40 },
        { exerciseId: 's1', seconds: 30 },
        { exerciseId: 's2', seconds: 30 },
      ],
    },
    {
      title: 'Schiena',
      rounds: 1,
      restBetweenItems: 5,
      restAfter: 5,
      items: [
        { exerciseId: 'm2', reps: 8 },
        { exerciseId: 'm3', reps: 6 },
      ],
    },
    {
      title: 'Anche e gambe',
      rounds: 1,
      restBetweenItems: 5,
      items: [
        { exerciseId: 's5', seconds: 30 },
        { exerciseId: 's7', seconds: 30 },
      ],
    },
  ],
}

const EXTRA = [PRACTICE, COOLDOWN]

export function getSession(id: string) {
  return EXTRA.find((s) => s.id === id) ?? PLAN.sessions.find((s) => s.id === id)
}
