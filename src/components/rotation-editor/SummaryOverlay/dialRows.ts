// Pure rows for the summary resonance dial: damage dealt vs. damage enabled (Shapley) per resonator, plus "Other"
import type { RotationSummary } from './computeSummary'
import type { CharColor } from './theme'
import { getElementColor } from './theme'

export const OTHER_KEY = '__OTHER__'
const OTHER_RAW = '220 15% 60%'

export type DialRow = {
  key: string
  name: string
  image?: string
  raw: string
  /** Damage the resonator dealt (direct + coordinated). */
  dealt: number
  /** Damage attributed to the resonator as enabler (Shapley, buffs credited to the buffer). */
  enabled: number
}

/** Resonators sorted by damage dealt, then the pooled "Other" row; `scale` turns damage into DPS. */
export function buildDialRows(summary: RotationSummary, charColorMap: Map<string, CharColor>, scale: number): DialRow[] {
  const enabledBy = new Map(summary.contributionEntries.map(c => [c.name, c.attributedDamage]))

  const rows: DialRow[] = summary.characterSummaries
    .map(c => ({
      key: c.name,
      name: c.name,
      image: c.image,
      raw: (charColorMap.get(c.name) ?? getElementColor(c.element)).raw,
      dealt: c.totalCharacterDamage * scale,
      enabled: (enabledBy.get(c.name) ?? 0) * scale,
    }))
    .filter(r => r.dealt > 0 || r.enabled > 0)
    .sort((a, b) => b.dealt - a.dealt)

  const otherDealt = summary.totalPassiveDamage * scale
  const otherEnabled = (enabledBy.get(OTHER_KEY) ?? 0) * scale
  if (otherDealt > 0 || otherEnabled > 0) {
    rows.push({ key: OTHER_KEY, name: 'Other Sources', raw: OTHER_RAW, dealt: otherDealt, enabled: otherEnabled })
  }
  return rows
}
