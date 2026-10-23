/**
 * Golden-master test harness: deterministic RNG, stable serialization and golden-file compare.
 *
 * Golden tests lock in the exact observable output of the simulation (snapshots, damage events,
 * optimizer results, rendered UI) so large refactors can prove they changed nothing.
 * Regenerate after an INTENTIONAL behaviour change with:  UPDATE_GOLDEN=1 npx jest tests/golden
 */

import * as fs from 'fs'
import * as path from 'path'

const GOLDEN_DIR = path.join(__dirname, '__golden__')
const UPDATE = process.env.UPDATE_GOLDEN === '1'

// ========== Deterministic RNG ================================================================================================

/** mulberry32 — tiny, fast, seedable PRNG. Same seed → same sequence on every machine. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Replaces Math.random with a seeded generator for the duration of `fn`.
 * The damage calculator samples random permutations (Shapley attribution) and MCTS picks
 * random branches, so both need a fixed seed to be comparable across runs.
 */
export function withSeededRandom<T>(seed: number, fn: () => T): T {
  const original = Math.random
  Math.random = createRng(seed)
  try {
    return fn()
  } finally {
    Math.random = original
  }
}

// ========== Stable Serialization =============================================================================================

/** Numbers are rounded to 12 significant digits so harmless float re-association doesn't fail tests. */
function normalizeNumber(n: number): number | string {
  if (Number.isNaN(n)) return 'NaN'
  if (n === Infinity) return 'Infinity'
  if (n === -Infinity) return '-Infinity'
  if (n === 0) return 0
  return Number(n.toPrecision(12))
}

/**
 * Converts any value into plain JSON-safe data with sorted keys.
 * Functions are dropped (closures can't be compared) or, with `fnMarkers`, replaced by '[Function]'
 * so static data still records *that* a callback exists. Sets/Maps become sorted arrays/objects,
 * and cycles are cut with a marker.
 */
export function normalize(value: unknown, seen = new WeakSet<object>(), fnMarkers = false): unknown {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'number') return normalizeNumber(value)
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'function') return fnMarkers ? '[Function]' : undefined
  if (typeof value === 'symbol') return undefined
  if (typeof value === 'bigint') return value.toString()

  const obj = value as object
  if (seen.has(obj)) return '[Circular]'
  seen.add(obj)
  try {
    if (Array.isArray(obj)) return obj.map(v => {
      const n = normalize(v, seen, fnMarkers)
      return n === undefined ? null : n
    })
    if (obj instanceof Set) return [...obj].map(v => normalize(v, seen, fnMarkers)).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
    if (obj instanceof Map) return normalize(Object.fromEntries(obj), seen, fnMarkers)

    const out: Record<string, unknown> = {}
    for (const key of Object.keys(obj).sort()) {
      const n = normalize((obj as Record<string, unknown>)[key], seen, fnMarkers)
      if (n !== undefined) out[key] = n
    }
    return out
  } finally {
    seen.delete(obj)
  }
}

// ========== Diff =============================================================================================================

/** Returns a human-readable description of the first difference between two normalized values. */
function firstDiff(expected: unknown, actual: unknown, at = '$'): string | null {
  if (expected === actual) return null
  if (typeof expected !== typeof actual || expected === null || actual === null || typeof expected !== 'object') {
    return `${at}: expected ${JSON.stringify(expected)?.slice(0, 300)} but got ${JSON.stringify(actual)?.slice(0, 300)}`
  }
  if (Array.isArray(expected) !== Array.isArray(actual)) return `${at}: array/object mismatch`
  if (Array.isArray(expected)) {
    const a = actual as unknown[]
    for (let i = 0; i < Math.min(expected.length, a.length); i++) {
      const d = firstDiff(expected[i], a[i], `${at}[${i}]`)
      if (d) return d
    }
    if (expected.length !== a.length) return `${at}: expected length ${expected.length} but got ${a.length}`
    return null
  }
  const e = expected as Record<string, unknown>
  const a = actual as Record<string, unknown>
  const keys = new Set([...Object.keys(e), ...Object.keys(a)])
  for (const k of keys) {
    if (!(k in e)) return `${at}.${k}: unexpected key (value ${JSON.stringify(a[k])?.slice(0, 200)})`
    if (!(k in a)) return `${at}.${k}: missing key (expected ${JSON.stringify(e[k])?.slice(0, 200)})`
    const d = firstDiff(e[k], a[k], `${at}.${k}`)
    if (d) return d
  }
  return null
}

// ========== Golden Compare ===================================================================================================

/**
 * Compares `value` against tests/golden/__golden__/<name>.json.
 * With UPDATE_GOLDEN=1 the file is (re)written instead. A missing file is always written,
 * so adding a new golden case is just "run once, commit the file".
 */
export function expectGolden(name: string, value: unknown, options: { fnMarkers?: boolean } = {}): void {
  const file = path.join(GOLDEN_DIR, `${name}.json`)
  const actual = normalize(value, new WeakSet(), options.fnMarkers ?? false)

  if (UPDATE || !fs.existsSync(file)) {
    fs.mkdirSync(GOLDEN_DIR, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(actual, null, 1))
    return
  }

  const expected = JSON.parse(fs.readFileSync(file, 'utf8'))
  const diff = firstDiff(expected, JSON.parse(JSON.stringify(actual)))
  if (diff) throw new Error(`Golden mismatch for "${name}":\n  ${diff}`)
}
