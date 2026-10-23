// Pure geometry for the Tacet Mark crest: a seed picks curated variations, the result is always mirror-symmetric

// ========== Seeded RNG ========================================================================================================

function hashSeed(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return h >>> 0
}

/** mulberry32 — small deterministic PRNG so a name always yields the same crest. */
function rng(seed: string) {
  let a = hashSeed(seed)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ========== Geometry ==========================================================================================================

// viewBox is -100..100; angles in degrees, 0° = right, growing clockwise (SVG y points down)
const OUTER_R = 86
const SPINE = 94

const rad = (deg: number) => (deg * Math.PI) / 180
const pt = (r: number, deg: number) => ({ x: +(r * Math.cos(rad(deg))).toFixed(2), y: +(r * Math.sin(rad(deg))).toFixed(2) })

function arc(r: number, from: number, to: number): string {
  const a = pt(r, from)
  const b = pt(r, to)
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${b.x} ${b.y}`
}

export type TacetMarkShape = {
  outerArcs: string[]
  ringDots: { x: number; y: number }[]
  innerR: number
  innerTicks: { x1: number; y1: number; x2: number; y2: number }[]
  spine: number
  /** Right-hand half only; the component mirrors them. */
  wings: string[]
  crown: string[]
  core: number
}

export function tacetMarkShape(seed: string): TacetMarkShape {
  const r = rng(seed)
  const gap = 12 + Math.round(r() * 10)          // half-width of the spine gaps in the outer ring
  const splitSides = r() > 0.5                   // extra small gaps at 3 and 9 o'clock
  const feathers = r() > 0.45 ? 3 : 2
  const lift = Math.round((r() - 0.5) * 24)      // raises / lowers the wing tips
  const hasCrown = r() > 0.4
  const hasTail = r() > 0.35
  const tickCount = r() > 0.5 ? 12 : 8
  const innerR = 54 + Math.round(r() * 8)
  const core = 9 + Math.round(r() * 4)

  // Outer ring: right and left halves between the top/bottom spine gaps
  const halves: [number, number][] = [[-90 + gap, 90 - gap], [90 + gap, 270 - gap]]
  const outerArcs = halves.flatMap(([from, to]) => {
    if (!splitSides) return [arc(OUTER_R, from, to)]
    const mid = (from + to) / 2
    return [arc(OUTER_R, from, mid - 4), arc(OUTER_R, mid + 4, to)]
  })
  const ringDots = [pt(OUTER_R, -90 + gap), pt(OUTER_R, -90 - gap), pt(OUTER_R, 90 - gap), pt(OUTER_R, 90 + gap)]

  // Inner ticks, skipping the ones that would cross the spine
  const innerTicks = Array.from({ length: tickCount }, (_, i) => (i * 360) / tickCount)
    .filter(deg => Math.abs(((deg + 90) % 180)) > 1)
    .map(deg => {
      const a = pt(innerR - 4, deg)
      const b = pt(innerR + 4, deg)
      return { x1: a.x, y1: a.y, x2: b.x, y2: b.y }
    })

  // Wings: each feather leaves the core and sweeps out and up, the lower ones shorter and flatter
  const wings = Array.from({ length: feathers }, (_, i) => {
    const y0 = 2 + i * 7
    const tipX = 78 - i * 13
    const tipY = -42 + i * 24 + lift
    return `M ${core + 2} ${y0} C ${core + 26} ${y0 + 4}, ${tipX - 30} ${tipY + 26}, ${tipX} ${tipY}`
  })
  if (hasTail) wings.push(`M 5 ${core + 6} C 18 ${core + 22}, 30 ${core + 34}, 24 ${core + 52}`)

  const crown = hasCrown
    ? [`M 5 ${-core - 6} L 16 -44`, 'M 16 -44 L 26 -36']
    : [`M 4 ${-core - 8} C 14 -26, 22 -34, 20 -48`]

  return { outerArcs, ringDots, innerR, innerTicks, spine: SPINE, wings, crown, core }
}
