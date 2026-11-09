import type { Block, Plan, Session } from './types'

/*
 * LA MIA SCHEDA: corpo libero (niente attrezzi per ora), tutto il corpo, con attenzione alla moto:
 * presa e avambracci, gambe in piedi, schiena, core ed equilibrio.
 * Quattro sessioni base; ogni fase usa le stesse sessioni a un livello più alto
 * (un giro in più dalla seconda fase, poi +2 ripetizioni e +5 secondi a livello).
 * Tre sessioni a settimana fin dall'inizio (la terza, all'inizio, è la giornata leggera D) e quattro nelle ultime due settimane.
 */

const A: Session = {
  id: 'a',
  name: 'Parte alta e postura',
  focus: 'Spinta, tirata, spalle e postura',
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
      title: 'Postura',
      rounds: 2,
      restBetweenItems: 10,
      restBetweenRounds: 30,
      items: [
        { exerciseId: 'p1', seconds: 30 },
        { exerciseId: 'p3', reps: 6 },
        { exerciseId: 'p4', reps: 6 },
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
      title: 'Spalle e presa',
      rounds: 2,
      restBetweenItems: 15,
      restBetweenRounds: 45,
      items: [
        { exerciseId: 'p8', reps: 10 },
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
  name: 'Gambe, schiena e core',
  focus: 'Stare in piedi sulle pedane a lungo, schiena che regge',
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
      title: 'Collo e torace',
      rounds: 1,
      restBetweenItems: 10,
      restAfter: 20,
      items: [
        { exerciseId: 'p1', seconds: 30 },
        { exerciseId: 'p5', seconds: 40 },
      ],
    },
    {
      title: 'Equilibrio',
      rounds: 1,
      restBetweenRounds: 20,
      restAfter: 20,
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
      ],
    },
    {
      title: 'Core e schiena',
      rounds: 2,
      restBetweenItems: 20,
      restBetweenRounds: 45,
      items: [
        { exerciseId: 'f9', reps: 8 },
        { exerciseId: 'p6', reps: 6 },
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
  name: 'Energia e schiena',
  focus: 'Cardio a intervalli, tutto il corpo e schiena',
  blocks: [
    {
      title: 'Cardio',
      rounds: 5,
      restBetweenRounds: 30,
      restAfter: 30,
      items: [{ exerciseId: 'f11', seconds: 30 }],
    },
    {
      title: 'Circuito',
      rounds: 2,
      restBetweenItems: 20,
      restBetweenRounds: 60,
      items: [
        { exerciseId: 'f13', reps: 10 },
        { exerciseId: 'f1', reps: 8 },
        { exerciseId: 'f14', reps: 8 },
        { exerciseId: 'p8', reps: 10 },
      ],
    },
    {
      title: 'Collo e scapole',
      rounds: 1,
      restBetweenItems: 10,
      restAfter: 20,
      items: [
        { exerciseId: 'p1', seconds: 40 },
        { exerciseId: 'p3', reps: 8 },
      ],
    },
    {
      title: 'Stretching',
      rounds: 1,
      restBetweenItems: 5,
      items: [
        { exerciseId: 'm3', reps: 6 },
        { exerciseId: 's3', seconds: 30 },
        { exerciseId: 's5', seconds: 30 },
        { exerciseId: 's8', seconds: 30 },
      ],
    },
  ],
}

/** Giornata leggera: mobilità, postura e stretching. Terzo allenamento delle prime due settimane e quarto del Picco. */
const D: Session = {
  id: 'd',
  name: 'Postura e recupero',
  focus: 'Giornata leggera: schiena, collo e articolazioni libere',
  blocks: [
    {
      title: 'Mobilità',
      rounds: 1,
      restBetweenItems: 10,
      restAfter: 15,
      items: [
        { exerciseId: 'm2', reps: 8 },
        { exerciseId: 'm3', reps: 6 },
        { exerciseId: 'p5', seconds: 40 },
      ],
    },
    {
      title: 'Postura',
      rounds: 2,
      restBetweenItems: 10,
      restBetweenRounds: 30,
      restAfter: 15,
      items: [
        { exerciseId: 'p1', seconds: 30 },
        { exerciseId: 'p3', reps: 6 },
        { exerciseId: 'p4', reps: 6 },
        { exerciseId: 'p6', reps: 6 },
      ],
    },
    {
      title: 'Stretching',
      rounds: 1,
      restBetweenItems: 5,
      items: ['s3', 's5', 's1', 's2'].map((exerciseId) => ({ exerciseId, seconds: 30 })),
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
  // Fino al 8 novembre 2026 le prime due settimane erano da 2 allenamenti: chi li aveva fatti non perde la streak.
  grandfather: { before: '2026-11-09', sessionsPerWeek: 2 },
  phases: [
    { label: 'Adattamento', weeks: 2, sessionsPerWeek: 3, rotation: ['a1', 'b1', 'd1'] },
    { label: 'Base', weeks: 2, sessionsPerWeek: 3, rotation: ['a2', 'b2', 'c2'] },
    { label: 'Costruzione', weeks: 4, sessionsPerWeek: 3, rotation: ['a3', 'b3', 'c3'] },
    { label: 'Sviluppo', weeks: 2, sessionsPerWeek: 3, rotation: ['a4', 'b4', 'c4'] },
    { label: 'Picco', weeks: 2, sessionsPerWeek: 4, rotation: ['a4', 'b4', 'c4', 'd4'] },
  ],
  sessions: [
    atLevel(A, 0),
    atLevel(B, 0),
    atLevel(D, 0),
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
        { exerciseId: 'e13', seconds: 8 },
      ],
    },
    {
      title: 'Postura',
      rounds: 1,
      restBetweenItems: 6,
      restAfter: 6,
      items: [
        { exerciseId: 'p1', seconds: 8 },
        { exerciseId: 'p3', reps: 3 },
        { exerciseId: 'p4', reps: 3 },
        { exerciseId: 'p5', seconds: 8 },
        { exerciseId: 'p6', reps: 3 },
        { exerciseId: 'p8', reps: 3 },
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

/**
 * Test di forma: alla settimana 1 e poi ogni 4 settimane, al posto di un allenamento.
 * Quattro prove al massimo, con 2 minuti per recuperare tra una e l'altra.
 */
export const FITNESS_TEST: Session = {
  id: 'test',
  name: 'Test di forma',
  focus: 'Quattro prove al massimo: da dove parti e quanto migliori',
  test: true,
  blocks: [
    {
      title: 'Riscaldamento',
      rounds: 1,
      restBetweenItems: 10,
      restAfter: 60,
      items: [
        { exerciseId: 'm1', seconds: 30 },
        { exerciseId: 'm2', reps: 6 },
        { exerciseId: 'f11', seconds: 30 },
      ],
    },
    {
      title: 'Test',
      rounds: 1,
      restBetweenItems: 120,
      items: [
        { exerciseId: 'f1', max: true },
        { exerciseId: 'f14', max: true },
        { exerciseId: 'f8', max: true },
        { exerciseId: 'e13', max: true },
      ],
    },
  ],
}

const EXTRA = [PRACTICE, COOLDOWN, FITNESS_TEST]

export function getSession(id: string) {
  return EXTRA.find((s) => s.id === id) ?? PLAN.sessions.find((s) => s.id === id)
}
