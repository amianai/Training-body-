import { describe, expect, it } from 'vitest'

import { cleanState, cleanSubscription, decide, mondayOf, romeNow, weekdayIndex } from './_reminder.js'

// Settimana da lunedì 16 a domenica 22 novembre 2026, obiettivo 3.
const week = (over = {}) => ({ weekStart: '2026-11-16', target: 3, nextTarget: 3, doneDates: [], offDates: [], freezeUsed: false, lastDate: '2026-11-15', streak: 5, ...over })
const now = Date.parse('2026-11-18T12:00:00Z')

describe('date', () => {
  it('lunedì è il primo giorno', () => {
    expect(weekdayIndex('2026-11-16')).toBe(0)
    expect(weekdayIndex('2026-11-22')).toBe(6)
    expect(mondayOf('2026-11-22')).toBe('2026-11-16')
  })
  it('giorno e ora sono quelli italiani', () => {
    expect(romeNow(new Date('2026-11-16T23:30:00Z'))).toEqual({ date: '2026-11-17', hour: 0 })
    expect(romeNow(new Date('2026-07-01T16:00:00Z'))).toEqual({ date: '2026-07-01', hour: 18 })
  })
})

describe('decide', () => {
  it('avvisa se oggi non ti sei allenato e mancano allenamenti', () => {
    const m = decide(week({ lastDate: '2026-11-14' }), '2026-11-17', now)
    expect(m.title).toBe('Stasera ti alleni?')
    expect(m.body).toBe('Ne mancano 3 questa settimana, restano 6 giorni. La fiamma è a 5.')
  })
  it('tace se oggi ti sei già allenato', () => {
    expect(decide(week({ doneDates: ['2026-11-17'], lastDate: '2026-11-17' }), '2026-11-17', now)).toBeNull()
  })
  it('tace il giorno dopo un allenamento, finché c’è margine', () => {
    expect(decide(week({ doneDates: ['2026-11-17'], lastDate: '2026-11-17' }), '2026-11-18', now)).toBeNull()
    // sabato: ne mancano 2 e restano 2 giorni, quindi avvisa anche se ieri ti sei allenato
    const tight = decide(week({ doneDates: ['2026-11-20'], lastDate: '2026-11-20' }), '2026-11-21', now)
    expect(tight.title).toBe('Oggi serve')
    expect(tight.body).toContain('Ne mancano 2 e restano 2 giorni: niente margine.')
  })
  it('tace a obiettivo raggiunto, anche grazie al freeze', () => {
    expect(decide(week({ doneDates: ['2026-11-16', '2026-11-18', '2026-11-19'] }), '2026-11-21', now)).toBeNull()
    expect(decide(week({ doneDates: ['2026-11-16', '2026-11-18'], freezeUsed: true }), '2026-11-21', now)).toBeNull()
  })
  it('tace se oggi hai detto che non riesci', () => {
    expect(decide(week({ offDates: ['2026-11-18'], lastDate: '2026-11-14' }), '2026-11-18', now)).toBeNull()
  })
  it('l’ultimo giorno lo dice', () => {
    const m = decide(week({ doneDates: ['2026-11-17', '2026-11-19'], lastDate: '2026-11-19' }), '2026-11-22', now)
    expect(m.body).toContain('Ne manca 1 e oggi è l’ultimo giorno: niente margine.')
  })
  it('in una settimana nuova riparte da zero con il nuovo obiettivo', () => {
    const m = decide(week({ doneDates: ['2026-11-16', '2026-11-18', '2026-11-20'], lastDate: '2026-11-20', nextTarget: 4 }), '2026-11-24', Date.parse('2026-11-21T12:00:00Z'))
    expect(m.body).toContain('Ne mancano 4 questa settimana, restano 6 giorni.')
  })
  it('smette dopo 10 giorni senza aprire l’app', () => {
    expect(decide(week({ lastDate: '2026-11-14' }), '2026-12-05', now)).toBeNull()
  })
})

describe('pulizia dei dati in arrivo', () => {
  it('scarta stati senza settimana e valori strani', () => {
    expect(cleanState({})).toBeNull()
    expect(cleanState({ weekStart: '2026-11-16', target: 999, doneDates: ['x', '2026-11-17'], extra: 1 })).toEqual({
      weekStart: '2026-11-16', target: 0, nextTarget: 0, doneDates: ['2026-11-17'], offDates: [], freezeUsed: false, lastDate: null, streak: 0,
    })
  })
  it('accetta solo i servizi di notifica dei browser', () => {
    const keys = { p256dh: 'a', auth: 'b' }
    expect(cleanSubscription({ endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys })).not.toBeNull()
    expect(cleanSubscription({ endpoint: 'https://esempio.it/x', keys })).toBeNull()
    expect(cleanSubscription({ endpoint: 'http://fcm.googleapis.com/x', keys })).toBeNull()
    expect(cleanSubscription(null)).toBeNull()
  })
})
