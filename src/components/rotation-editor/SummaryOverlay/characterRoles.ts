// Pure role tagging for the summary character cards (Main Carry / Sub DPS / Buffer)
import type { CharacterSummary, ContributionEntry } from './summaryTypes'

export type CharacterRole = 'Main Carry' | 'Sub DPS' | 'Buffer'

/**
 * Main Carry: top damage dealer with > 50% of character damage.
 * Buffer: lowest damage dealer whose Shapley contribution exceeds 15%.
 * Sub DPS: anyone strictly between the top and bottom damage. Others get no tag.
 */
export function computeRoleMap(
  characterSummaries: CharacterSummary[],
  contributionEntries: ContributionEntry[],
): Map<string, CharacterRole> {
  const pie2Total = contributionEntries.reduce((s, c) => s + c.attributedDamage, 0)

  const activeCharsForRole = characterSummaries.filter(c => c.totalCharacterDamage > 0 || c.fieldTime > 0)
  const charDamages = activeCharsForRole.map(c => c.totalCharacterDamage)
  const maxDamage = charDamages.length > 0 ? Math.max(...charDamages) : 0
  const minDamage = charDamages.length > 0 ? Math.min(...charDamages) : 0
  const totalCharDamage = charDamages.reduce((s, v) => s + v, 0)
  const contribMap = new Map(contributionEntries.map(c => [c.name, c.attributedDamage]))
  const roleMap = new Map<string, CharacterRole>()
  for (const c of activeCharsForRole) {
    const contribPct = pie2Total > 0 ? ((contribMap.get(c.name) ?? 0) / pie2Total) * 100 : 0
    if (c.totalCharacterDamage === maxDamage && totalCharDamage > 0 && c.totalCharacterDamage / totalCharDamage > 0.5) {
      roleMap.set(c.name, 'Main Carry')
    } else if (c.totalCharacterDamage === minDamage && contribPct > 15) {
      roleMap.set(c.name, 'Buffer')
    } else if (c.totalCharacterDamage !== maxDamage && c.totalCharacterDamage !== minDamage) {
      roleMap.set(c.name, 'Sub DPS')
    }
  }
  return roleMap
}
