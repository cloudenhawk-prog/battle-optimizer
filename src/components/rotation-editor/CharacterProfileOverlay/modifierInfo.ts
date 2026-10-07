// Lookup from snapshot buff keys (display names with spaces stripped) back to modifier display name + description
import type { Character } from '../../../types/character'

export type ModInfo = { originalName: string; description?: string }

// snapshot.buffs keys are space-stripped display names; this map recovers the original name (for icon paths and
// labels) and description. First registration wins when two modifiers share a name.
export function buildModInfoMap(allCharacters: Character[]): Map<string, ModInfo> {
  const modInfoMap = new Map<string, ModInfo>()
  for (const char of allCharacters) {
    const registerMod = (mod: { displayName: string; description?: string }) => {
      const stripped = mod.displayName.replace(/\s+/g, '')
      if (!modInfoMap.has(stripped)) {
        modInfoMap.set(stripped, { originalName: mod.displayName, description: mod.description })
      }
    }
    for (const mod of char.flattenedPassiveModifiers ?? []) registerMod(mod)
    for (const mod of char.damageModifiers ?? []) registerMod(mod)
    for (const milestone of char.resourceMilestones ?? []) registerMod(milestone.modifier)
    for (const action of char.actions ?? []) {
      for (const mod of action.damageModifiers ?? []) registerMod(mod)
      for (const ca of action.coordinatedAttacks ?? []) {
        for (const mod of ca.damageModifiers ?? []) registerMod(mod)
      }
    }
  }
  return modInfoMap
}
