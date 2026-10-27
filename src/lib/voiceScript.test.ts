import { describe, expect, it } from 'vitest'

import { getSession } from '@/data/plan'
import { buildSteps, type WorkStep } from './session'
import { allClips, spokenIntro } from './voiceScript'

const work = buildSteps(getSession('a1')!).filter((s): s is WorkStep => s.kind === 'work')

describe('spokenIntro', () => {
  it('la prima volta spiega nome, obiettivo e come si fa', () => {
    const first = work[0]
    const { text, calm, clips } = spokenIntro(first, undefined, true, 0)
    expect(text).toBe('Mobilità dei polsi. 40 secondi. Cerchi lenti e ampi con i polsi. Metà tempo in un senso, metà nell’altro. Respira piano.')
    expect(clips.map((c) => c.id)).toEqual(['nome-m1', 'sec-40', 'come-m1', 'calma-0'])
    expect(calm).toBe(true)
  })

  it('al giro successivo è breve', () => {
    const flessioni = work.filter((s) => s.exercise.id === 'f1')
    expect(spokenIntro(flessioni[1], undefined, false, 0).text).toBe('Flessioni. Giro 2. 8 ripetizioni. Vai!')
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

describe('allClips', () => {
  // La lista da registrare sta in scripts/voice/clips.json: se cambia la scheda o un testo,
  // `npx vitest run -u` la aggiorna e poi scripts/voice/generate.py registra solo i pezzi nuovi.
  it('è la lista delle frasi da registrare', async () => {
    const clips = allClips()
    expect(new Set(clips.map((c) => c.id)).size).toBe(clips.length)
    await expect(JSON.stringify(clips, null, 1) + '\n').toMatchFileSnapshot('../../scripts/voice/clips.json')
  })
})
