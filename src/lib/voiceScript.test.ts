import { describe, expect, it } from 'vitest'

import { getSession } from '@/data/plan'
import { buildSteps, type WorkStep } from './session'
import { spokenIntro } from './voiceScript'

const work = buildSteps(getSession('a1')!).filter((s): s is WorkStep => s.kind === 'work')

describe('spokenIntro', () => {
  it('la prima volta spiega nome, obiettivo e come si fa', () => {
    const first = work[0]
    const { text, calm } = spokenIntro(first, undefined, true, 0)
    expect(text).toBe('Mobilità dei polsi. 40 secondi. Cerchi lenti e ampi con i polsi. Metà tempo in un senso, metà nell’altro. Respira piano.')
    expect(calm).toBe(true)
  })

  it('al giro successivo è breve', () => {
    const flessioni = work.filter((s) => s.exercise.id === 'f1')
    expect(spokenIntro(flessioni[1], undefined, false, 0).text).toBe('Flessioni, giro 2. 8 ripetizioni. Vai!')
  })

  it('al cambio di lato dice solo di cambiare', () => {
    const lati = work.filter((s) => s.exercise.id === 's1')
    expect(spokenIntro(lati[1], lati[0], false, 1).text).toBe('Cambia lato: ora il destro. 30 secondi. Rilassati e respira.')
  })

  it('legge i gradi in parole', () => {
    const deadBug = buildSteps(getSession('b1')!).find((s): s is WorkStep => s.kind === 'work' && s.exercise.id === 'f9')!
    expect(spokenIntro(deadBug, undefined, true, 0).text).toContain('ginocchia a 90 gradi.')
  })
})
