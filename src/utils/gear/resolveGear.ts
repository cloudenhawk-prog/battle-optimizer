import type { Action } from '../../types/action'
import type { ActionTag } from '../../types/action'
import type { DamageType } from '../../types/baseTypes'
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { DamageModifier } from '../../types/modifiers'
import type { InjectedModifier, InjectedSideEffect, InjectedTarget, Gear } from '../../types/gear'
import { computeEchoSetCounts, echoSetRegistry } from '../../data/gear/echoSets'

// ========== Gear Modifier Injection ==========================================================================================

/**
 * Injects modifiers from gear into working copies of character actions and modifier list.
 * Called by resolveCharacter — use that instead of calling this directly.
 *
 * `originalToClone` maps each original Action/CoordinatedAttack to its working clone,
 * so injection targets (stored as original references in gear data) resolve correctly
 * to the clones without mutating the original character definition.
 *
 * Sources injected:
 *  - Weapon `injectedModifiers`
 *  - Slot-1 echo `injectedModifiers` and `injectedSideEffects`
 *  - Set bonus `injectedModifiers` (only when all 5 slots are filled)
 *  - Global echo set milestone `injectedModifiers` from the echo set registry (per milestone threshold)
 *
 * Each InjectedModifier target can be `'character'` or an Action/CoordinatedAttack reference.
 * Each InjectedSideEffect target is an Action reference (actions only).
 */
export function resolveGear(characterActions: Action[], characterDamageModifiers: DamageModifier[], gear: Gear, originalToClone: Map<Action | CoordinatedAttack, Action | CoordinatedAttack>, characterName: string): void {
  // Weapon modifier injection
  if (gear.weapon?.injectedModifiers?.length) {
    applyInjectedModifiers(gear.weapon.injectedModifiers, characterActions, characterDamageModifiers, originalToClone, characterName)
  }

  // Slot-1 echo modifier and side-effect injection
  const slot1Echo = gear.echoSlots[1]
  if (slot1Echo?.injectedModifiers?.length) {
    applyInjectedModifiers(slot1Echo.injectedModifiers, characterActions, characterDamageModifiers, originalToClone, characterName)
  }
  if (slot1Echo?.injectedSideEffects?.length) {
    applyInjectedSideEffects(slot1Echo.injectedSideEffects, characterActions, originalToClone)
  }

  // Set bonus modifier injection: requires 5 echoes from the matching set.
  // Using set counts rather than "all slots filled" ensures the 5-piece bonus
  // is correctly withdrawn when echoes are swapped to a different set.
  const slots = gear.echoSlots
  if (gear.setBonus?.name && gear.setBonus.injectedModifiers?.length) {
    const setCounts = computeEchoSetCounts(slots)
    if ((setCounts[gear.setBonus.name] ?? 0) >= 5) {
      applyInjectedModifiers(gear.setBonus.injectedModifiers, characterActions, characterDamageModifiers, originalToClone, characterName)
    }
  }

  // Global echo set milestone modifier injection from the registry.
  // Applies injectedModifiers defined on each milestone when the set count reaches the threshold.
  const setCounts = computeEchoSetCounts(gear.echoSlots)
  for (const [setName, count] of Object.entries(setCounts)) {
    const echoSet = echoSetRegistry[setName]
    if (!echoSet) continue
    for (const [milestoneStr, milestone] of Object.entries(echoSet.milestones)) {
      if (count >= Number(milestoneStr) && milestone.injectedModifiers?.length) {
        applyInjectedModifiers(milestone.injectedModifiers, characterActions, characterDamageModifiers, originalToClone, characterName)
      }
    }
  }
}

function applyInjectedModifiers(
  injectedModifiers: InjectedModifier[],
  characterActions: Action[],
  characterDamageModifiers: DamageModifier[],
  originalToClone: Map<Action | CoordinatedAttack, Action | CoordinatedAttack>,
  characterName: string,
): void {
  for (const { targets, modifiers, energyGeneration } of injectedModifiers) {
    // Stamp ownerCharacter on each modifier using the equipping character's name as the fallback.
    // Spread to avoid mutating shared registry/catalog objects.
    const ownedModifiers = modifiers.map(m =>
      m.ownerCharacter != null ? m : { ...m, ownerCharacter: characterName }
    )
    for (const target of targets) {
      if (target === 'character') {
        characterDamageModifiers.push(...ownedModifiers)
        // energyGeneration is not applicable to 'character' targets
      } else if (isTagTarget(target)) {
        // Tag-based: iterate working actions (and their CAs) directly — no clone map needed
        for (const action of characterActions) {
          if (hasMatchingTags(action, target)) {
            action.damageModifiers.push(...ownedModifiers)
            if (energyGeneration?.length) action.energyGenerated.push(...energyGeneration)
          }
          for (const ca of action.coordinatedAttacks ?? []) {
            if (hasMatchingTags(ca, target)) {
              ca.damageModifiers ??= []
              ca.damageModifiers.push(...ownedModifiers)
            }
          }
          // Inject into procModifiers of any heal-proc modifier whose procTag matches the target tag.
          // This allows gear targeting { tag: 'HEAL_PROC' } to fire its buffs on every heal tick
          // from a modifier-based periodic heal field (e.g. Syntony Field).
          for (const mod of action.damageModifiers) {
            if (mod.healProc && matchesProcTag(mod.healProc.procTag, target)) {
              mod.healProc.procModifiers.push(...ownedModifiers)
            }
          }
        }
        // Character-level heal-proc modifiers (rare, but handled for completeness)
        for (const mod of characterDamageModifiers) {
          if (mod.healProc && matchesProcTag(mod.healProc.procTag, target)) {
            mod.healProc.procModifiers.push(...ownedModifiers)
          }
        }
      } else if (isDmgTypeTarget(target)) {
        // DmgType-based: inject into all actions/CAs whose dmgTypes includes the specified type(s).
        // Use this when a game effect says "dealing X DMG" — it refers to the action's damage type,
        // not the action category (use tags for that, e.g. "casting Liberation").
        for (const action of characterActions) {
          if (hasMatchingDmgTypes(action, target)) {
            action.damageModifiers.push(...ownedModifiers)
            if (energyGeneration?.length) action.energyGenerated.push(...energyGeneration)
          }
          for (const ca of action.coordinatedAttacks ?? []) {
            if (hasMatchingDmgTypes(ca, target)) {
              ca.damageModifiers ??= []
              ca.damageModifiers.push(...ownedModifiers)
            }
          }
        }
      } else if (isCoordinatedAttack(target)) {
        const clone = originalToClone.get(target) as CoordinatedAttack | undefined
        if (clone) {
          clone.damageModifiers ??= []
          clone.damageModifiers.push(...ownedModifiers)
        }
      } else {
        const clone = originalToClone.get(target) as Action | undefined
        if (clone) {
          clone.damageModifiers.push(...ownedModifiers)
          if (energyGeneration?.length) clone.energyGenerated.push(...energyGeneration)
        }
      }
    }
  }
}

function applyInjectedSideEffects(
  injectedSideEffects: InjectedSideEffect[],
  characterActions: Action[],
  originalToClone: Map<Action | CoordinatedAttack, Action | CoordinatedAttack>,
): void {
  for (const { targets, sideEffects } of injectedSideEffects) {
    for (const target of targets) {
      if (isTagTarget(target)) {
        for (const action of characterActions) {
          if (hasMatchingTags(action, target)) {
            action.sideEffects = [...action.sideEffects, ...sideEffects]
          }
        }
      } else {
        const clone = originalToClone.get(target) as Action | undefined
        if (clone) {
          clone.sideEffects = [...clone.sideEffects, ...sideEffects]
        }
      }
    }
  }
}

/** Returns true if procTag matches a tag-based injection target. */
function matchesProcTag(procTag: string, target: { tag: ActionTag } | { tags: ActionTag[]; match: 'any' | 'all' }): boolean {
  if ('tag' in target) return procTag === target.tag
  return target.match === 'any'
    ? target.tags.some(t => t === procTag)
    : target.tags.every(t => t === procTag)
}

/** Returns true when a target is a tag-based descriptor `{ tag }` or `{ tags }`. */
function isTagTarget(target: InjectedTarget | Action): target is { tag: ActionTag } | { tags: ActionTag[]; match: 'any' | 'all' } {
  if (typeof target !== 'object' || target === null) return false
  return 'tag' in target || ('tags' in target && !('dmgType' in target) && !('dmgTypes' in target))
}

/** Returns true when a target is a dmgType-based descriptor `{ dmgType }` or `{ dmgTypes }`. */
function isDmgTypeTarget(target: InjectedTarget | Action): target is { dmgType: DamageType } | { dmgTypes: DamageType[]; match: 'any' | 'all' } {
  if (typeof target !== 'object' || target === null) return false
  return 'dmgType' in target || 'dmgTypes' in target
}

/** Returns true when an action or coordinated attack carries all/any of the requested tags. */
function hasMatchingTags(
  subject: { tags?: ActionTag[] },
  target: { tag: ActionTag } | { tags: ActionTag[]; match: 'any' | 'all' },
): boolean {
  const subjectTags = subject.tags ?? []
  if ('tag' in target) {
    return subjectTags.includes(target.tag)
  }
  return target.match === 'any'
    ? target.tags.some(t => subjectTags.includes(t))
    : target.tags.every(t => subjectTags.includes(t))
}

/** Returns true when an action or coordinated attack's dmgTypes includes all/any of the requested types. */
function hasMatchingDmgTypes(
  subject: { dmgTypes?: DamageType[] },
  target: { dmgType: DamageType } | { dmgTypes: DamageType[]; match: 'any' | 'all' },
): boolean {
  const subjectTypes = subject.dmgTypes ?? []
  if ('dmgType' in target) {
    return subjectTypes.includes(target.dmgType)
  }
  return target.match === 'any'
    ? target.dmgTypes.some(t => subjectTypes.includes(t))
    : target.dmgTypes.every(t => subjectTypes.includes(t))
}

/** Type guard distinguishing a CoordinatedAttack from an Action (by presence of `frequency`). */
function isCoordinatedAttack(target: Action | CoordinatedAttack): target is CoordinatedAttack {
  return 'frequency' in target
}
