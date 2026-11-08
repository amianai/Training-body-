import { GROUND as G, type FigureSpec, type Limb } from '@/lib/figure/rig'

/*
 * Movimento dell'omino per ogni esercizio: due pose chiave e i tempi.
 * Di profilo, guardando a destra (tranne il jumping jack, di fronte).
 * Angoli: 0 = destra, 90 = giù, 180 = sinistra, 270 = su.
 */

const STAND: Limb = { a: 90, b: 90, c: 15 }
const HANG: Limb = { a: 92, b: 90, c: 90 }
const ATTACK_DECOR: FigureSpec['decor'] = [
  { kind: 'line', a: [0.41, 0.805], b: [0.63, 0.805], tone: 'moto' },
  { kind: 'line', a: [0.715, 0.475], b: [0.805, 0.375], tone: 'moto', front: true },
]

export const FIGURES: Record<string, FigureSpec> = {
  // Stretching
  s1: {
    frames: [
      { root: [0.4, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [STAND, STAND], arms: [{ a: 0, b: 0, c: 275 }, { target: [0.68, 0.035], bend: 1, c: 330 }] },
      { root: [0.4, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [STAND, STAND], arms: [{ a: 0, b: 0, c: 245 }, { target: [0.672, 0.03], bend: 1, c: 330 }] },
    ],
    hold: [0.8, 0.8],
    move: 1.2,
    phases: ['Tieni', 'Tira', 'Tieni', 'Molla'],
  },
  s2: {
    frames: [
      { root: [0.4, G - 0.02], anchor: 'ankle', torso: 270, neck: 275, legs: [STAND, STAND], arms: [{ a: 0, b: 0, c: 85 }, { target: [0.69, 0.115], bend: 1, c: 60 }] },
      { root: [0.4, G - 0.02], anchor: 'ankle', torso: 270, neck: 275, legs: [STAND, STAND], arms: [{ a: 0, b: 0, c: 115 }, { target: [0.675, 0.11], bend: 1, c: 60 }] },
    ],
    hold: [0.8, 0.8],
    move: 1.2,
    phases: ['Tieni', 'Tira', 'Tieni', 'Molla'],
  },
  s3: {
    frames: [
      { root: [0.48, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, STAND], arms: [{ target: [0.3, -0.07], bend: -1, c: 270 }, { a: 95, b: 95, c: 95 }] },
      { root: [0.48, G - 0.02], anchor: 'ankle', torso: 276, neck: 278, legs: [{ a: 96, b: 96, c: 15 }, { a: 96, b: 96, c: 15 }], arms: [{ target: [0.3, -0.07], bend: -1, c: 270 }, { a: 95, b: 95, c: 95 }] },
    ],
    hold: [0.6, 1],
    move: 1.4,
    phases: ['Tieni', 'Avanti', 'Tieni', 'Indietro'],
    decor: [{ kind: 'line', a: [0.29, -0.2], b: [0.29, G], tone: 'prop' }],
  },
  s5: {
    frames: [
      { root: [0.62, 0.845], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 0, b: 90, c: 0 }, { a: 100, b: 180, c: 175 }], arms: [{ a: 95, b: 90, c: 90 }, { a: 95, b: 90, c: 90 }] },
      { root: [0.62, 0.845], anchor: 'ankle', torso: 268, neck: 270, legs: [{ a: 355, b: 100, c: 0 }, { a: 105, b: 180, c: 175 }], arms: [{ a: 95, b: 90, c: 90 }, { a: 95, b: 90, c: 90 }] },
    ],
    hold: [0.6, 1],
    move: 1.4,
    phases: ['Tieni', 'Avanti', 'Tieni', 'Torna'],
    key: 'hip',
  },
  s7: {
    frames: [
      { root: [0.46, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, { a: 92, b: 90, c: 0 }], arms: [{ target: [0.47, 0.36], bend: 1, c: 90 }, { a: 95, b: 90, c: 90 }] },
      { root: [0.46, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, { a: 100, b: 262, c: 270 }], arms: [{ target: [0.386, 0.378], bend: 1, c: 100 }, { a: 95, b: 90, c: 90 }] },
    ],
    hold: [0.6, 1.2],
    move: 1.3,
    phases: ['In piedi', 'Tira il tallone', 'Tieni', 'Molla'],
  },
  s8: {
    frames: [
      { root: [0.62, 0.845], anchor: 'ankle', torso: 300, neck: 300, legs: [{ a: 34, b: 105, c: 0 }, { a: 128, b: 128, c: 10 }], arms: [{ target: [0.79, 0.22], bend: 1, c: 270 }, { target: [0.79, 0.22], bend: 1, c: 270 }] },
      { root: [0.62, 0.845], anchor: 'ankle', torso: 304, neck: 304, legs: [{ a: 38, b: 110, c: 0 }, { a: 126, b: 126, c: 10 }], arms: [{ target: [0.79, 0.22], bend: 1, c: 270 }, { target: [0.79, 0.22], bend: 1, c: 270 }] },
    ],
    hold: [0.6, 1],
    move: 1.4,
    phases: ['Tieni', 'Spingi', 'Tieni', 'Molla'],
    decor: [{ kind: 'line', a: [0.8, -0.05], b: [0.8, G], tone: 'prop' }],
  },

  // Mobilità
  m1: {
    frames: [
      { root: [0.42, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [STAND, STAND], arms: [{ a: 85, b: 0, c: 320 }, { a: 95, b: 0, c: 320 }] },
      { root: [0.42, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [STAND, STAND], arms: [{ a: 85, b: 0, c: 40 }, { a: 95, b: 0, c: 40 }] },
    ],
    hold: [0.05, 0.05],
    move: 0.5,
    phases: ['Ruota', 'Ruota', 'Ruota', 'Ruota'],
  },
  m2: {
    frames: [
      { root: [0.36, 0.62], anchor: 'hip', torso: 352, bend: 30, neck: 60, legs: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }], arms: [{ target: [0.66, G], bend: -1, c: 0 }, { target: [0.66, G], bend: -1, c: 0 }] },
      { root: [0.36, 0.62], anchor: 'hip', torso: 352, bend: -24, neck: 320, legs: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }], arms: [{ target: [0.66, G], bend: -1, c: 0 }, { target: [0.66, G], bend: -1, c: 0 }] },
    ],
    hold: [0.5, 0.5],
    move: 1.4,
    phases: ['Gatto', 'Inarca', 'Mucca', 'Arrotonda'],
  },
  m3: {
    // Dall'alto, sdraiato su un fianco: le ginocchia piegate in avanti, il braccio sopra si apre come un libro.
    frames: [
      { root: [0.35, 0.5], anchor: 'hip', torso: 0, neck: 0, legs: [{ a: 90, b: 180, c: 180 }, { a: 95, b: 185, c: 180 }], arms: [{ target: [0.66, 0.78], bend: -1, c: 90 }, { target: [0.66, 0.78], bend: -1, c: 90 }] },
      { root: [0.35, 0.5], anchor: 'hip', torso: 0, neck: 0, legs: [{ a: 90, b: 180, c: 180 }, { a: 95, b: 185, c: 180 }], arms: [{ target: [0.66, 0.22], bend: 1, c: 270 }, { target: [0.66, 0.78], bend: -1, c: 90 }] },
    ],
    hold: [0.5, 0.9],
    move: 1.8,
    ground: false,
    view: 'Vista dall’alto',
    phases: ['Chiuso', 'Apri', 'Aperto', 'Chiudi'],
    trace: 'wrist',
  },
  m5: {
    // Affondo basso, di lato: le braccia unite si aprono (una in alto, una in basso) mentre il busto ruota.
    frames: [
      { root: [0.45, 0.57], anchor: 'hip', torso: 272, neck: 272, legs: [{ target: [0.686, 0.84], bend: -1, c: 0 }, { target: [0.17, 0.8], bend: -1, c: 100 }], arms: [{ a: 355, b: 355, c: 355 }, { a: 5, b: 5, c: 5 }] },
      { root: [0.45, 0.57], anchor: 'hip', torso: 272, neck: 272, legs: [{ target: [0.686, 0.84], bend: -1, c: 0 }, { target: [0.17, 0.8], bend: -1, c: 100 }], arms: [{ a: 270, b: 270, c: 270 }, { a: 90, b: 90, c: 90 }] },
    ],
    hold: [0.5, 0.8],
    move: 1.3,
    phases: ['Giù', 'Ruota', 'Tieni', 'Chiudi'],
    view: 'Il busto ruota: le braccia si aprono',
  },
  m7: {
    frames: [
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, STAND], arms: [{ a: 90, b: 90, c: 90 }, { a: 90, b: 90, c: 90 }] },
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 330, neck: 335, legs: [{ a: 65, b: 100, c: 15 }, { a: 65, b: 100, c: 15 }], arms: [{ a: 95, b: 92, c: 92 }, { a: 95, b: 92, c: 92 }] },
    ],
    hold: [0.4, 0.5],
    move: 1.2,
    phases: ['Su', 'Piegati', 'Giù', 'Risali'],
    decor: [{ kind: 'stick' }],
    key: 'hip',
  },

  // Enduro
  e1: {
    frames: [
      { root: [0.5, 0.79], anchor: 'ankle', torso: 318, neck: 300, legs: [{ a: 35, b: 115, c: 0 }, { a: 35, b: 115, c: 0 }], arms: [{ target: [0.77, 0.43], bend: -1 }, { target: [0.77, 0.43], bend: -1 }] },
      { root: [0.5, 0.79], anchor: 'ankle', torso: 322, neck: 302, legs: [{ a: 25, b: 122, c: 0 }, { a: 25, b: 122, c: 0 }], arms: [{ target: [0.77, 0.43], bend: -1 }, { target: [0.77, 0.43], bend: -1 }] },
    ],
    hold: [0.15, 0.15],
    move: 0.45,
    ground: false,
    phases: ['Tieni', 'Assorbi', 'Assorbi', 'Tieni'],
    decor: ATTACK_DECOR,
    key: 'knee',
  },
  e2: {
    frames: [
      { root: [0.42, 0.8], anchor: 'hip', torso: 180, neck: 180, legs: [{ a: 300, b: 70, c: 0 }, { a: 300, b: 70, c: 0 }], arms: [{ a: 5, b: 0, c: 0 }, { a: 5, b: 0, c: 0 }] },
      { root: [0.42, 0.8], anchor: 'hip', torso: 180, neck: 180, legs: [{ a: 297, b: 70, c: 0 }, { a: 297, b: 70, c: 0 }], arms: [{ a: 5, b: 0, c: 0 }, { a: 5, b: 0, c: 0 }] },
    ],
    hold: [0.6, 1.2],
    move: 0.4,
    phases: ['Rilassa', 'Stringi', 'Stringi', 'Rilassa'],
    decor: [{ kind: 'cushion' }],
  },
  e3: {
    frames: [
      { root: [0.5, 0.4], anchor: 'hip', torso: 270, neck: 270, legs: [{ a: 75, b: 95, c: 15 }, { a: 105, b: 100, c: 25 }], arms: [{ a: 92, b: 90, c: 90 }, { a: 88, b: 90, c: 90 }] },
      { root: [0.5, 0.4], anchor: 'hip', torso: 270, neck: 270, legs: [{ a: 105, b: 100, c: 25 }, { a: 75, b: 95, c: 15 }], arms: [{ a: 88, b: 90, c: 90 }, { a: 92, b: 90, c: 90 }] },
    ],
    hold: [0, 0],
    move: 0.55,
    phases: ['Cammina', 'Cammina', 'Cammina', 'Cammina'],
    decor: [{ kind: 'bags' }],
  },
  e4: {
    frames: [
      { root: [0.45, G - 0.02], anchor: 'ankle', torso: 270, neck: 275, legs: [STAND, STAND], arms: [{ a: 60, b: 350, c: 330 }, { a: 65, b: 352, c: 30 }] },
      { root: [0.45, G - 0.02], anchor: 'ankle', torso: 270, neck: 275, legs: [STAND, STAND], arms: [{ a: 60, b: 350, c: 30 }, { a: 65, b: 352, c: 330 }] },
    ],
    hold: [0.1, 0.1],
    move: 0.5,
    phases: ['Strizza', 'Strizza', 'Strizza', 'Strizza'],
  },
  e11: {
    // Di fronte: due piedi a terra, poi un piede si alza vicino al polpaccio e si resta in equilibrio.
    frames: [
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 87, b: 87, c: 0 }, { a: 93, b: 93, c: 180 }], arms: [{ a: 80, b: 85, c: 85 }, { a: 100, b: 95, c: 95 }] },
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 87, b: 87, c: 0 }, { a: 120, b: 45, c: 0 }], arms: [{ a: 35, b: 25, c: 25 }, { a: 145, b: 155, c: 155 }] },
    ],
    hold: [0.5, 1.6],
    move: 1.2,
    view: 'Vista di fronte',
    phases: ['Pronto', 'Alza', 'Tieni', 'Appoggia'],
  },
  p1: {
    frames: [
      { root: [0.55, 0.8], anchor: 'hip', torso: 180, neck: 190, legs: [{ a: 300, b: 70, c: 0 }, { a: 300, b: 70, c: 0 }], arms: [{ a: 5, b: 0, c: 0 }, { a: 5, b: 0, c: 0 }] },
      { root: [0.55, 0.8], anchor: 'hip', torso: 180, neck: 177, legs: [{ a: 300, b: 70, c: 0 }, { a: 300, b: 70, c: 0 }], arms: [{ a: 5, b: 0, c: 0 }, { a: 5, b: 0, c: 0 }] },
    ],
    hold: [0.6, 1.4],
    move: 1.2,
    phases: ['Rilassa', 'Mento in dentro', 'Tieni', 'Rilassa'],
  },
  p3: {
    frames: [
      { root: [0.45, 0.82], anchor: 'hip', torso: 0, neck: 0, legs: [{ a: 180, b: 180, c: 180 }, { a: 180, b: 180, c: 180 }], arms: [{ a: 10, b: 5, c: 5 }, { a: 10, b: 5, c: 5 }] },
      { root: [0.45, 0.82], anchor: 'hip', torso: 0, neck: 355, legs: [{ a: 180, b: 180, c: 180 }, { a: 180, b: 180, c: 180 }], arms: [{ a: 335, b: 328, c: 328 }, { a: 335, b: 328, c: 328 }] },
    ],
    hold: [0.4, 1],
    move: 1,
    phases: ['Giù', 'Su', 'Tieni', 'Giù'],
  },
  p4: {
    // Di fronte, schiena al muro: le braccia a W salgono a Y e tornano giù.
    frames: [
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 87, b: 87, c: 0 }, { a: 93, b: 93, c: 180 }], arms: [{ a: 35, b: 300, c: 300 }, { a: 145, b: 240, c: 240 }] },
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 87, b: 87, c: 0 }, { a: 93, b: 93, c: 180 }], arms: [{ a: 300, b: 300, c: 300 }, { a: 240, b: 240, c: 240 }] },
    ],
    hold: [0.6, 0.8],
    move: 1.6,
    view: 'Vista di fronte',
    phases: ['W', 'Sali', 'Y', 'Scendi'],
  },
  p5: {
    frames: [
      { root: [0.62, 0.77], anchor: 'hip', torso: 180, neck: 180, legs: [{ a: 300, b: 70, c: 0 }, { a: 300, b: 70, c: 0 }], arms: [{ a: 235, b: 20, c: 0 }, { a: 235, b: 20, c: 0 }] },
      { root: [0.62, 0.77], anchor: 'hip', torso: 180, bend: -24, neck: 165, legs: [{ a: 300, b: 70, c: 0 }, { a: 300, b: 70, c: 0 }], arms: [{ a: 235, b: 20, c: 0 }, { a: 235, b: 20, c: 0 }] },
    ],
    hold: [0.8, 1.6],
    move: 1.6,
    decor: [{ kind: 'roll', at: [0.46, 0.83], r: 0.04 }],
    phases: ['Piatto', 'Lasciati andare', 'Respira', 'Torna'],
  },
  p6: {
    frames: [
      { root: [0.45, 0.6], anchor: 'hip', torso: 352, neck: 355, legs: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }], arms: [{ a: 90, b: 90, c: 90 }, { a: 90, b: 90, c: 90 }] },
      { root: [0.45, 0.6], anchor: 'hip', torso: 352, neck: 355, legs: [{ a: 90, b: 180, c: 180 }, { a: 184, b: 184, c: 184 }], arms: [{ a: 352, b: 352, c: 352 }, { a: 90, b: 90, c: 90 }] },
    ],
    hold: [0.5, 1.2],
    move: 1.3,
    phases: ['Quattro zampe', 'Allunga', 'Tieni', 'Torna'],
  },
  p8: {
    // Di fronte: le braccia si alzano ai lati, fino all'altezza delle spalle.
    frames: [
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 87, b: 87, c: 0 }, { a: 93, b: 93, c: 180 }], arms: [{ a: 85, b: 85, c: 85 }, { a: 95, b: 95, c: 95 }] },
      { root: [0.5, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [{ a: 87, b: 87, c: 0 }, { a: 93, b: 93, c: 180 }], arms: [{ a: 356, b: 356, c: 356 }, { a: 184, b: 184, c: 184 }] },
    ],
    hold: [0.4, 0.7],
    move: 1.4,
    decor: [{ kind: 'bags' }],
    view: 'Vista di fronte',
    phases: ['Giù', 'Alza', 'Tieni', 'Scendi'],
  },
  e13: {
    frames: [
      { root: [0.62, G - 0.02], anchor: 'ankle', torso: 270, neck: 272, legs: [{ a: 0, b: 90, c: 0 }, { a: 0, b: 90, c: 0 }], arms: [{ a: 8, b: 2, c: 0 }, { a: 8, b: 2, c: 0 }] },
      { root: [0.62, G - 0.02], anchor: 'ankle', torso: 270, neck: 274, legs: [{ a: 2, b: 90, c: 0 }, { a: 2, b: 90, c: 0 }], arms: [{ a: 12, b: 4, c: 0 }, { a: 12, b: 4, c: 0 }] },
    ],
    hold: [1.2, 1.2],
    move: 1.6,
    phases: ['Tieni', 'Tieni', 'Tieni', 'Tieni'],
    decor: [{ kind: 'line', a: [0.34, -0.2], b: [0.34, G], tone: 'prop' }],
    key: 'knee',
  },
  e12: {
    frames: [
      { root: [0.45, G - 0.02], anchor: 'ankle', torso: 270, neck: 270, legs: [STAND, { a: 95, b: 92, c: 15 }], arms: [HANG, HANG] },
      { root: [0.45, G - 0.02], anchor: 'ankle', torso: 355, neck: 355, legs: [{ a: 80, b: 95, c: 15 }, { a: 178, b: 178, c: 100 }], arms: [{ a: 88, b: 90, c: 90 }, { a: 88, b: 90, c: 90 }] },
    ],
    hold: [0.4, 0.5],
    move: 1.3,
    phases: ['Su', 'Scendi', 'Giù', 'Risali'],
    key: 'hip',
  },

  // Flex
  f1: {
    frames: [
      { root: [0.86, G - 0.065], anchor: 'ankle', torso: 197, neck: 197, legs: [{ a: 17, b: 17, c: 95 }, { a: 17, b: 17, c: 95 }], arms: [{ target: [0.13, G], bend: -1, c: 180 }, { target: [0.13, G], bend: -1, c: 180 }] },
      { root: [0.86, G - 0.065], anchor: 'ankle', torso: 185, neck: 190, legs: [{ a: 5, b: 5, c: 95 }, { a: 5, b: 5, c: 95 }], arms: [{ target: [0.13, G], bend: -1, c: 180 }, { target: [0.13, G], bend: -1, c: 180 }] },
    ],
    hold: [0.5, 0.25],
    move: 1,
    phases: ['Su', 'Scendi', 'Giù', 'Spingi'],
    key: 'elbow',
    trace: 'shoulder',
  },
  f6: {
    // Di lato: i piedi restano fermi (il busto scende dritto), il ginocchio dietro sfiora terra.
    frames: [
      { root: [0.45, 0.45], anchor: 'hip', torso: 270, neck: 270, legs: [{ target: [0.686, 0.84], bend: -1, c: 0 }, { target: [0.17, 0.8], bend: -1, c: 100 }], arms: [HANG, HANG] },
      { root: [0.45, 0.57], anchor: 'hip', torso: 270, neck: 270, legs: [{ target: [0.686, 0.84], bend: -1, c: 0 }, { target: [0.17, 0.8], bend: -1, c: 100 }], arms: [HANG, HANG] },
    ],
    hold: [0.4, 0.3],
    move: 1.1,
    phases: ['Su', 'Scendi', 'Giù', 'Spingi'],
    key: 'knee',
    trace: 'hip',
  },
  f8: {
    frames: [
      { root: [0.86, 0.795], anchor: 'ankle', torso: 186, neck: 190, legs: [{ a: 6, b: 6, c: 95 }, { a: 6, b: 6, c: 95 }], arms: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }] },
      { root: [0.86, 0.795], anchor: 'ankle', torso: 187, neck: 191, legs: [{ a: 7, b: 7, c: 95 }, { a: 7, b: 7, c: 95 }], arms: [{ a: 90, b: 180, c: 180 }, { a: 90, b: 180, c: 180 }] },
    ],
    hold: [1.2, 1.2],
    move: 1.6,
    phases: ['Tieni', 'Tieni', 'Tieni', 'Tieni'],
    key: 'hip',
  },
  f9: {
    frames: [
      { root: [0.42, 0.8], anchor: 'hip', torso: 0, neck: 0, legs: [{ a: 270, b: 180, c: 270 }, { a: 270, b: 180, c: 270 }], arms: [{ a: 270, b: 270, c: 270 }, { a: 270, b: 270, c: 270 }] },
      { root: [0.42, 0.8], anchor: 'hip', torso: 0, neck: 0, legs: [{ a: 185, b: 185, c: 180 }, { a: 270, b: 180, c: 270 }], arms: [{ a: 270, b: 270, c: 270 }, { a: 340, b: 350, c: 350 }] },
    ],
    hold: [0.5, 0.5],
    move: 1.2,
    phases: ['Pronto', 'Allunga', 'Tieni', 'Torna'],
  },
  f13: {
    frames: [
      { root: [0.45, 0.82], anchor: 'hip', torso: 0, neck: 335, legs: [{ a: 180, b: 180, c: 180 }, { a: 180, b: 180, c: 180 }], arms: [{ a: 10, b: 5, c: 5 }, { a: 10, b: 5, c: 5 }] },
      { root: [0.45, 0.82], anchor: 'hip', torso: 352, neck: 320, legs: [{ a: 188, b: 188, c: 188 }, { a: 188, b: 188, c: 188 }], arms: [{ a: 357, b: 355, c: 355 }, { a: 357, b: 355, c: 355 }] },
    ],
    hold: [0.4, 0.8],
    move: 0.9,
    phases: ['Giù', 'Su', 'Tieni', 'Giù'],
  },
  f14: {
    frames: [
      { root: [0.88, 0.83], anchor: 'ankle', torso: 192, neck: 195, legs: [{ a: 15, b: 15, c: 300 }, { a: 15, b: 15, c: 300 }], arms: [{ target: [0.13, 0.356], bend: 1, c: 200 }, { target: [0.13, 0.356], bend: 1, c: 200 }] },
      { root: [0.88, 0.83], anchor: 'ankle', torso: 205, neck: 208, legs: [{ a: 25, b: 25, c: 300 }, { a: 25, b: 25, c: 300 }], arms: [{ target: [0.13, 0.356], bend: 1, c: 200 }, { target: [0.13, 0.356], bend: 1, c: 200 }] },
    ],
    hold: [0.4, 0.4],
    move: 1,
    phases: ['Giù', 'Tira', 'Su', 'Scendi'],
    decor: [
      { kind: 'line', a: [-0.08, 0.34], b: [0.36, 0.34], tone: 'prop' },
      { kind: 'line', a: [-0.06, 0.34], b: [-0.06, G], tone: 'prop' },
    ],
    key: 'elbow',
    trace: 'shoulder',
  },
  f11: {
    frames: [
      { root: [0.5, 0.4], anchor: 'hip', torso: 270, neck: 270, legs: [{ a: 86, b: 90, c: 0 }, { a: 94, b: 90, c: 180 }], arms: [{ a: 80, b: 85, c: 85 }, { a: 100, b: 95, c: 95 }] },
      { root: [0.5, 0.4], anchor: 'hip', torso: 270, neck: 270, legs: [{ a: 70, b: 75, c: 0 }, { a: 110, b: 105, c: 180 }], arms: [{ a: 300, b: 290, c: 285 }, { a: 240, b: 250, c: 255 }] },
    ],
    hold: [0, 0],
    move: 0.35,
    phases: ['Salta', 'Salta', 'Salta', 'Salta'],
  },
}
