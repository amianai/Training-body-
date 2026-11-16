import { describe, expect, it } from 'vitest'

import { PLAN } from '@/data/plan'
import type { Entry, EntryType } from '@/data/types'
import { reminderState } from './reminderState'
// La decisione vera la prende il server: qui si controlla che i due pezzi si capiscano.
import { cleanState, decide } from '../../api/_reminder.js'

let id = 0
const entry = (type: EntryType, date: string): Entry => ({ id: `r${id++}`, type, date, createdAt: id })

describe('reminderState', () => {
  // Come nel backup del 16 novembre: 5 allenamenti, settimana 3 appena iniziata.
  const mine = ['2026-11-02', '2026-11-07', '2026-11-10', '2026-11-14', '2026-11-15'].map((d) => entry('workout', d))

  it('riassume la settimana in corso', () => {
    expect(reminderState(mine, PLAN, '2026-11-02', '2026-11-16')).toEqual({
      weekStart: '2026-11-16',
      target: 3,
      nextTarget: 3,
      doneDates: [],
      offDates: [],
      freezeUsed: false,
      lastDate: '2026-11-15',
      streak: 5,
    })
  })

  it('conta allenamenti, freeze e salti della settimana; il giro in moto no', () => {
    const entries = [...mine, entry('workout', '2026-11-17'), entry('ride', '2026-11-18'), entry('freeze', '2026-11-19')]
    const state = reminderState(entries, PLAN, '2026-11-02', '2026-11-19')
    expect(state.doneDates).toEqual(['2026-11-17'])
    expect(state.offDates).toEqual(['2026-11-19'])
    expect(state.freezeUsed).toBe(true)
    expect(state.lastDate).toBe('2026-11-17')
  })

  it('il server lo accetta così com’è e decide', () => {
    const state = reminderState(mine, PLAN, '2026-11-02', '2026-11-16')
    expect(cleanState(state)).toEqual(state)
    // lunedì 16: ieri allenamento e c'è margine, quindi niente; martedì 17 avvisa
    const now = Date.parse('2026-11-16T12:00:00Z')
    expect(decide(state, '2026-11-16', now)).toBeNull()
    expect(decide(state, '2026-11-17', now)?.body).toBe('Ne mancano 3 questa settimana, restano 6 giorni. La fiamma è a 5.')
  })
})
