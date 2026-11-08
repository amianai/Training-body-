import { useEffect, useRef } from 'react'

import { FLAME_STAGE_STARTS } from '@/lib/flame'

/*
 * La fiamma della streak: stessa forma dell'icona Lucide, disegnata a strati con un viso.
 * Cresce con gli allenamenti di fila e a certe soglie cambia stadio (colore, scintille, orbite…).
 * Lo stadio arriva da fuori (src/lib/flame.ts): se la streak si spezza la fiamma scende di uno stadio.
 */

type RGB = [number, number, number]
type Eyes = 'closed' | 'open' | 'happy' | 'fierce'
type Mouth = 'dot' | 'smile' | 'grin' | 'open'

interface Stage {
  name: string
  size: number
  outer: string
  mid: string
  core: string
  line: string
  /** Scintille al secondo. */
  spark: number
  tongues: boolean
  orbs: number
  ring: boolean
  arcs: boolean
  glow: number
  eyes: Eyes
  mouth: Mouth
}

const WARM = { outer: '#ff7a1a', mid: '#ffb020', core: '#fff0b0', line: '#3a1400' }
const VIOLET = { outer: '#8b3dff', mid: '#c47bff', core: '#f6e3ff', line: '#1c0b38' }

const STAGES: Stage[] = [
  { name: 'Brace', size: 0.34, outer: '#6b5548', mid: '#9a7a66', core: '#d8c2ae', line: '#1d1410', spark: 0, tongues: false, orbs: 0, ring: false, arcs: false, glow: 0, eyes: 'closed', mouth: 'dot' },
  { name: 'Scintilla', size: 0.5, ...WARM, spark: 0, tongues: false, orbs: 0, ring: false, arcs: false, glow: 0.06, eyes: 'open', mouth: 'dot' },
  { name: 'Fiamma', size: 0.7, ...WARM, spark: 0, tongues: false, orbs: 0, ring: false, arcs: false, glow: 0.12, eyes: 'open', mouth: 'smile' },
  { name: 'Fiamma viva', size: 0.82, ...WARM, spark: 5, tongues: false, orbs: 0, ring: false, arcs: false, glow: 0.18, eyes: 'happy', mouth: 'smile' },
  { name: 'Falò', size: 0.95, ...WARM, core: '#fff4c0', spark: 9, tongues: true, orbs: 0, ring: false, arcs: false, glow: 0.24, eyes: 'happy', mouth: 'grin' },
  { name: 'Fuoco viola', size: 1, ...VIOLET, spark: 11, tongues: true, orbs: 0, ring: false, arcs: false, glow: 0.3, eyes: 'open', mouth: 'grin' },
  { name: 'Orbite', size: 1.06, ...VIOLET, spark: 13, tongues: true, orbs: 3, ring: false, arcs: false, glow: 0.34, eyes: 'fierce', mouth: 'grin' },
  { name: 'Evoluzione', size: 1.16, outer: '#5b3cff', mid: '#35d0ff', core: '#ffffff', line: '#0f0a38', spark: 17, tongues: true, orbs: 5, ring: true, arcs: false, glow: 0.45, eyes: 'fierce', mouth: 'grin' },
  { name: 'Overpower', size: 1.3, outer: '#7a2cff', mid: '#3ae0ff', core: '#ffffff', line: '#0f0a38', spark: 26, tongues: true, orbs: 6, ring: true, arcs: true, glow: 0.7, eyes: 'fierce', mouth: 'open' },
]

if (STAGES.length !== FLAME_STAGE_STARTS.length) throw new Error('Gli stadi della fiamma non corrispondono alle soglie')

const SHAPE = new Path2D('M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4Z')
/** Il disegno è pensato su un quadrato di 420 punti; si mostra solo la parte centrale. */
const CX = 210
const BASE = 318
const VIEW = { x: 30, y: 20, size: 360 }

const rgb = (hex: string): RGB => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16)) as RGB
const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]
const css = (c: RGB, alpha = 1) => `rgba(${c.map(Math.round).join(',')},${alpha})`

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  r: number
  k: number
}

export function StreakFlame({ stage, className }: { stage: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef(stage)

  useEffect(() => {
    stageRef.current = stage
  }, [stage])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const px = canvas.width / VIEW.size

    let st = stageRef.current
    const first = STAGES[st]
    let size = first.size
    let glow = first.glow
    const col = { outer: rgb(first.outer), mid: rgb(first.mid), core: rgb(first.core), line: rgb(first.line) }
    let particles: Particle[] = []
    let arcs: [number, number][][] = []
    let arcTimer = 0
    let spawnAcc = 0
    let t = 0
    let last = performance.now()
    let raf = 0

    const spawn = (count: number, burst: boolean) => {
      const w = 126 * size
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        particles.push(
          burst
            ? { x: CX, y: BASE - 80 * size, vx: Math.cos(a) * (60 + Math.random() * 120), vy: Math.sin(a) * (60 + Math.random() * 120) - 30, life: 0, max: 0.9 + Math.random() * 0.7, r: 5 + Math.random() * 7, k: Math.random() }
            : { x: CX + (Math.random() - 0.5) * w * 0.8, y: BASE - Math.random() * 120 * size, vx: (Math.random() - 0.5) * 30, vy: -(50 + Math.random() * 70), life: 0, max: 0.8 + Math.random() * 0.9, r: 4 + Math.random() * 6, k: Math.random() },
        )
      }
    }

    const transform = (cx: number, by: number, scale: number, seed: number) => {
      const sway = Math.sin(t * 2.5 + seed) * 0.07
      ctx.translate(cx, by)
      ctx.transform(1, 0, sway, 1, 0, 0)
      ctx.scale(scale * (1 + Math.sin(t * 4 + seed) * 0.025), scale * (1 + Math.sin(t * 5.3 + seed) * 0.04))
      ctx.translate(-12, -22)
    }

    const flame = (cx: number, by: number, scale: number, seed: number, fill: string, lineWidth = 0) => {
      ctx.save()
      transform(cx, by, scale, seed)
      ctx.fillStyle = fill
      ctx.fill(SHAPE)
      if (lineWidth) {
        ctx.lineWidth = lineWidth / scale
        ctx.lineJoin = 'round'
        ctx.strokeStyle = css(col.line)
        ctx.stroke(SHAPE)
      }
      ctx.restore()
    }

    const star = (x: number, y: number, r: number, rot: number) => {
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const a = rot + (i * Math.PI) / 4
        const rr = i % 2 ? r * 0.32 : r
        ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
      }
      ctx.closePath()
    }

    const face = (scale: number) => {
      const { eyes, mouth } = STAGES[st]
      const blink = t % 3.8 > 3.66
      const ink = css(col.line)
      ctx.save()
      transform(CX, BASE, scale, 0)
      ctx.fillStyle = ink
      ctx.strokeStyle = ink
      ctx.lineWidth = 0.55
      ctx.lineCap = 'round'
      if (st > 1) {
        ctx.fillStyle = 'rgba(255,110,150,.55)'
        for (const x of [8.4, 15.6]) {
          ctx.beginPath()
          ctx.ellipse(x, 17.2, 0.9, 0.6, 0, 0, 7)
          ctx.fill()
        }
        ctx.fillStyle = ink
      }
      for (const ex of [9.7, 14.3]) {
        ctx.beginPath()
        if (eyes === 'closed' || blink) {
          ctx.moveTo(ex - 0.9, 15.3)
          ctx.quadraticCurveTo(ex, 16.2, ex + 0.9, 15.3)
          ctx.stroke()
        } else if (eyes === 'happy') {
          ctx.moveTo(ex - 0.9, 15.8)
          ctx.quadraticCurveTo(ex, 14.3, ex + 0.9, 15.8)
          ctx.stroke()
        } else {
          ctx.ellipse(ex, 15.3, 0.75, 1.05, 0, 0, 7)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.beginPath()
          ctx.arc(ex + 0.25, 14.9, 0.28, 0, 7)
          ctx.fill()
          ctx.fillStyle = ink
          if (eyes === 'fierce') {
            const d = ex < 12 ? 1 : -1
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(ex - d * 1.2, 13.4)
            ctx.lineTo(ex + d * 1.2, 14.1)
            ctx.stroke()
            ctx.lineWidth = 0.55
          }
        }
      }
      ctx.beginPath()
      if (mouth === 'dot') {
        ctx.ellipse(12, 17.6, 0.4, 0.3, 0, 0, 7)
        ctx.fill()
      } else if (mouth === 'smile') {
        ctx.moveTo(11, 17.3)
        ctx.quadraticCurveTo(12, 18.5, 13, 17.3)
        ctx.stroke()
      } else if (mouth === 'grin') {
        ctx.moveTo(10.7, 17.1)
        ctx.quadraticCurveTo(12, 19.6, 13.3, 17.1)
        ctx.closePath()
        ctx.fill()
      } else {
        ctx.ellipse(12, 18.1, 0.95, 1.15, 0, 0, 7)
        ctx.fill()
      }
      ctx.restore()
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      t += dt * (reduce ? 0.4 : 1)

      const next = stageRef.current
      if (next !== st) {
        if (next > st) spawn(reduce ? 8 : 34, true)
        st = next
      }
      const S = STAGES[st]
      const ease = (rate: number) => Math.min(1, dt * rate)
      col.outer = mix(col.outer, rgb(S.outer), ease(5))
      col.mid = mix(col.mid, rgb(S.mid), ease(5))
      col.core = mix(col.core, rgb(S.core), ease(5))
      col.line = mix(col.line, rgb(S.line), ease(5))
      size += (S.size - size) * ease(4)
      glow += (S.glow - glow) * ease(3)

      ctx.setTransform(px, 0, 0, px, -VIEW.x * px, -VIEW.y * px)
      ctx.clearRect(VIEW.x, VIEW.y, VIEW.size, VIEW.size)
      const s = 9 * size
      const w = 14 * s
      const h = 19 * s
      const cy = BASE - h * 0.42
      const R = w * 0.95 + 22

      if (glow > 0.01) {
        const radius = Math.min((w + h) * 0.62, 180)
        const g = ctx.createRadialGradient(CX, cy, 5, CX, cy, radius)
        g.addColorStop(0, css(col.mid, glow * (S.arcs ? 1 + Math.sin(t * 4) * 0.15 : 1)))
        g.addColorStop(1, css(col.mid, 0))
        ctx.fillStyle = g
        ctx.fillRect(VIEW.x, VIEW.y, VIEW.size, VIEW.size)
      }
      ctx.fillStyle = 'rgba(0,0,0,.45)'
      ctx.beginPath()
      ctx.ellipse(CX, BASE + 14, w * 0.55, 9, 0, 0, 7)
      ctx.fill()

      const orbs = Array.from({ length: S.orbs }, (_, i) => {
        const a = t * 1.5 * (i % 2 ? -0.8 : 1) + (i * Math.PI * 2) / S.orbs
        return { x: CX + Math.cos(a) * R, y: cy + Math.sin(a) * R * 0.34, back: Math.sin(a) < 0, i }
      })
      const drawOrb = (p: { x: number; y: number; i: number }) => {
        ctx.fillStyle = css(col.line)
        star(p.x, p.y, 13, t * 2 + p.i)
        ctx.fill()
        ctx.fillStyle = css(p.i % 2 ? col.core : col.mid)
        star(p.x, p.y, 9, t * 2 + p.i)
        ctx.fill()
      }

      if (S.ring) {
        ctx.save()
        ctx.setLineDash([7, 11])
        ctx.lineDashOffset = -t * 26
        ctx.lineWidth = 3
        ctx.strokeStyle = css(col.mid, 0.75)
        ctx.beginPath()
        ctx.ellipse(CX, cy, R * 1.18, R * 0.4, 0, 0, 7)
        ctx.stroke()
        ctx.restore()
      }
      orbs.filter((p) => p.back).forEach(drawOrb)

      if (S.tongues) {
        flame(CX - 0.72 * w, BASE - 4, s * 0.5, 1.7, css(col.outer), 5)
        flame(CX + 0.72 * w, BASE - 4, s * 0.5, 4.1, css(col.outer), 5)
      }
      flame(CX, BASE, s, 0, css(col.outer), 7)
      flame(CX, BASE - 4, s * 0.64, 2.2, css(col.mid))
      flame(CX, BASE - 7, s * 0.34, 4.4, css(col.core))
      face(s)

      orbs.filter((p) => !p.back).forEach(drawOrb)

      if (S.arcs && !reduce) {
        arcTimer -= dt
        if (arcTimer <= 0) {
          arcTimer = 0.14
          arcs = [0, 1, 2].map(() => {
            const a = Math.random() * Math.PI * 2
            return Array.from({ length: 6 }, (_, k): [number, number] => {
              const r = w * 0.45 + k * (w * 0.16)
              const jitter = a + (Math.random() - 0.5) * 0.5
              return [CX + Math.cos(jitter) * r, cy + Math.sin(jitter) * r * 0.9]
            })
          })
        }
        ctx.lineJoin = 'round'
        for (const [width, alpha] of [[6, 0.22], [2, 0.95]]) {
          ctx.lineWidth = width
          ctx.strokeStyle = css(col.core, alpha)
          for (const points of arcs) {
            ctx.beginPath()
            points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
            ctx.stroke()
          }
        }
      }

      spawnAcc += dt * S.spark * (reduce ? 0.4 : 1)
      while (spawnAcc >= 1) {
        spawnAcc -= 1
        spawn(1, false)
      }
      particles = particles.filter((p) => (p.life += dt) < p.max)
      for (const p of particles) {
        p.x += p.vx * dt + Math.sin(t * 6 + p.k * 9) * 0.4
        p.y += p.vy * dt
        p.vy += 20 * dt
        const k = 1 - p.life / p.max
        ctx.fillStyle = css(p.k > 0.5 ? col.core : col.mid, Math.min(1, k * 1.6))
        star(p.x, p.y, p.r * (0.4 + k * 0.6), p.life * 4)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={256}
      role="img"
      aria-label={`Fiamma della streak: ${STAGES[stage].name}`}
      className={className ?? 'size-28'}
    />
  )
}
