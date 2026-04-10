import type { Character, ResolvedCharacter } from '../../types/character'
import type { Action } from '../../types/action'
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { DamageModifier } from '../../types/modifiers'
import type { Gear } from '../../types/gear'
import { getDefaultCharacterStats } from '../../types/stats'
import { mergeStats } from '../calculators/damageCalculator'
import { isAlwaysCondition } from '../conditions/damageModifierConditions'
import { resolveGear } from './resolveGear'
import { echoSetRegistry, computeEchoSetCounts } from '../../data/gear/echoSets'

// ========== Character Resolution ============================================================================================

/**
 * Resolves a character's total stats, injects gear contributions, and returns a
 * new ResolvedCharacter WITHOUT mutating the original. Safe to call multiple times
 * (e.g. when the player swaps gear at runtime).
 *
 * Pass `overrideGear` to resolve with different gear than the character's default.
 *
 * Resolution order:
 *  0. Default stats (all multipliers = 1, critRate = 0.05, critDamage = 1.5, rest = 0)
 *  1. Base stats (`character.stats`)
 *  2. Inherent stats (`character.inherentStats`)
 *  3. Weapon stats (`gear.weapon.stats`)
 *  4. Per-slot echo stats (baseStats + subStats + firstSlotStats + conditionalStats)
 *  5. Echo set milestone stats from global EchoSet registry (2-piece, 5-piece, etc.)
 *  6. Echo skill from slot 1 — replaces the placeholder ECHO action in the working copy
 *  7. Modifier injection via resolveGear (weapon, slot-1 echo, set bonus injectedModifiers)
 *  8. Flatten self/always/permanent modifiers into stats (removed from live pipeline)
 */
export function resolveCharacter(character: Character, overrideGear?: Gear): ResolvedCharacter {
  const gear = overrideGear ?? character.gear
  const { name, inherentStats } = character
  const slots = gear.echoSlots

  // ---- Create working copies of all mutable parts so the original stays pristine ----
  // Actions: shallow-spread each action but give it a fresh damageModifiers array so
  // resolveGear can push into it without touching the original action objects.
  // Modifiers with healProc also get a fresh procModifiers array so gear injection
  // into healProc.procModifiers doesn't mutate the shared original modifier object.
  const workingActions: Action[] = character.actions.map(a => ({
    ...a,
    damageModifiers: a.damageModifiers.map(m =>
      m.healProc ? { ...m, healProc: { ...m.healProc, procModifiers: [...m.healProc.procModifiers] } } : m
    ),
    coordinatedAttacks: a.coordinatedAttacks?.map(ca => ({
      ...ca,
      damageModifiers: [...(ca.damageModifiers ?? [])],
    })),
  }))

  const workingDamageModifiers: DamageModifier[] = character.damageModifiers.map(m =>
    m.healProc ? { ...m, healProc: { ...m.healProc, procModifiers: [...m.healProc.procModifiers] } } : m
  )

  // Build original → clone maps so resolveGear can find the right working copy when
  // gear injection targets are stored as original object references.
  const originalToClone = new Map<Action | CoordinatedAttack, Action | CoordinatedAttack>()
  character.actions.forEach((orig, i) => {
    originalToClone.set(orig, workingActions[i])
    orig.coordinatedAttacks?.forEach((ca, j) => {
      originalToClone.set(ca, workingActions[i].coordinatedAttacks![j])
    })
  })

  // ---- 0: Start with defaults, then 1 & 2: Base stats + inherent stats ----
  let resolved = mergeStats(getDefaultCharacterStats(), character.stats)
  resolved = mergeStats(resolved, inherentStats)

  // ---- 3: Weapon stats ----
  resolved = mergeStats(resolved, gear.weapon.stats)

  // ---- 4: Echo stats per slot ----
  for (const slotNum of [1, 2, 3, 4, 5] as const) {
    const echo = slots[slotNum]
    if (!echo) continue

    resolved = mergeStats(resolved, echo.baseStats)
    resolved = mergeStats(resolved, echo.subStats)

    if (slotNum === 1 && echo.firstSlotStats) {
      resolved = mergeStats(resolved, echo.firstSlotStats)
    }

    if (echo.conditionalStats?.condition(name)) {
      resolved = mergeStats(resolved, echo.conditionalStats.stats)
    }
  }

  // ---- 5: Echo set milestone stats from global registry ----
  // Counts echoes per set, then applies stats for each reached milestone (2-piece, 5-piece).
  // Character-specific injected modifier effects are handled below via gear.setBonus.
  const setCounts = computeEchoSetCounts(slots)
  for (const [setName, count] of Object.entries(setCounts)) {
    const echoSet = echoSetRegistry[setName]
    if (!echoSet) continue
    for (const [milestoneStr, milestone] of Object.entries(echoSet.milestones)) {
      if (count >= Number(milestoneStr) && milestone.stats) {
        resolved = mergeStats(resolved, milestone.stats)
      }
    }
  }

  // ---- 6: Inject echo skill from slot 1 into working actions ----
  // Replaces the placeholder ECHO action (identified by dmgTypes containing 'ECHO').
  // If no placeholder exists, the echo skill is appended.
  const slot1Echo = slots[1]
  if (slot1Echo?.echoSkill) {
    // Clone the echo skill so any future injection into it doesn't mutate the echo definition
    const echoSkillClone: Action = {
      ...slot1Echo.echoSkill,
      damageModifiers: [...(slot1Echo.echoSkill.damageModifiers ?? [])],
    }
    const placeholderIndex = workingActions.findIndex(a => (a.dmgTypes as string[]).includes('ECHO'))
    if (placeholderIndex !== -1) {
      workingActions[placeholderIndex] = echoSkillClone
    } else {
      workingActions.push(echoSkillClone)
    }
  }

  // ---- 7: Inject gear modifiers into working copies ----
  resolveGear(workingActions, workingDamageModifiers, gear, originalToClone, character.name)

  // ---- 8: Flatten self/always/permanent modifiers into resolved stats ----
  // Modifiers that are always active for this character and never change can be folded
  // directly into stats, removing them from the live modifier pipeline.
  // They are preserved in flattenedPassiveModifiers for breakdown reference.
  const stillActive: DamageModifier[] = []
  const flattened: DamageModifier[] = []
  for (const modifier of workingDamageModifiers) {
    if (isPassiveModifier(modifier)) {
      if (modifier.characterStats) {
        resolved = mergeStats(resolved, modifier.characterStats)
      }
      flattened.push(modifier)
    } else {
      stillActive.push(modifier)
    }
  }

  // Return a new ResolvedCharacter — originals are untouched
  return {
    ...character,
    gear,
    stats: resolved,
    actions: workingActions,
    damageModifiers: stillActive,
    ...(flattened.length > 0 ? { flattenedPassiveModifiers: flattened } : { flattenedPassiveModifiers: undefined }),
  } as ResolvedCharacter
}

/**
 * Returns true if a modifier qualifies as a passive flat stat contribution:
 *  - targets only the owner character ('self')
 *  - is always active (always() condition)
 *  - is permanent (never expires)
 *  - carries only characterStats (no enemyStats, no negativeStatusEffects)
 */
function isPassiveModifier(modifier: DamageModifier): boolean {
  return (
    modifier.targetStrategy === 'self' &&
    modifier.durationStrategy.type === 'permanent' &&
    isAlwaysCondition(modifier.condition) &&
    !modifier.enemyStats &&
    !modifier.negativeStatusEffects?.length
  )
}

