// Rotation file I/O: download a rotation as a .rotation.json file and parse/validate an uploaded one.
import type { RotationStep, SavedRotation } from '../types/rotation'

export function downloadRotationAsJson(rotation: SavedRotation): void {
  const json = JSON.stringify(rotation, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${rotation.name.replace(/[^a-z0-9_-]/gi, '_')}.rotation.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Returns null for anything that isn't { name: string, steps: {character, action}[] }. */
export function parseRotationFromJson(content: string): SavedRotation | null {
  try {
    const parsed = JSON.parse(content)
    if (typeof parsed.name !== 'string' || !Array.isArray(parsed.steps)) return null
    if (!parsed.steps.every((s: unknown) => typeof (s as RotationStep).character === 'string' && typeof (s as RotationStep).action === 'string')) return null
    return parsed as SavedRotation
  } catch {
    return null
  }
}
