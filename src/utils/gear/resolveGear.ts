import type { Action } from '../../types/action'
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { DamageModifier } from '../../types/modifiers'
import type { InjectedModifier, InjectedSideEffect, Gear } from '../../types/gear'

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
 *
 * Each InjectedModifier target can be `'character'` or an Action/CoordinatedAttack reference.
 * Each InjectedSideEffect target is an Action reference (actions only).
 */
export function resolveGear(
  characterActions: Action[],
  characterDamageModifiers: DamageModifier[],
  gear: Gear,
  originalToClone: Map<Action | CoordinatedAttack, Action | CoordinatedAttack>,
): void {
  // Weapon modifier injection
  if (gear.weapon.injectedModifiers?.length) {
    applyInjectedModifiers(gear.weapon.injectedModifiers, characterActions, characterDamageModifiers, originalToClone)
  }

  // Slot-1 echo modifier and side-effect injection
  const slot1Echo = gear.echoSlots[1]
  if (slot1Echo?.injectedModifiers?.length) {
    applyInjectedModifiers(slot1Echo.injectedModifiers, characterActions, characterDamageModifiers, originalToClone)
  }
  if (slot1Echo?.injectedSideEffects?.length) {
    applyInjectedSideEffects(slot1Echo.injectedSideEffects, characterActions, originalToClone)
  }

  // Set bonus modifier injection (requires all 5 slots filled)
  const slots = gear.echoSlots
  const allFilled = slots[1] && slots[2] && slots[3] && slots[4] && slots[5]
  if (allFilled && gear.setBonus?.injectedModifiers?.length) {
    applyInjectedModifiers(gear.setBonus.injectedModifiers, characterActions, characterDamageModifiers, originalToClone)
  }
}

function applyInjectedModifiers(
  injectedModifiers: InjectedModifier[],
  characterActions: Action[],
  characterDamageModifiers: DamageModifier[],
  originalToClone: Map<Action | CoordinatedAttack, Action | CoordinatedAttack>,
): void {
  for (const { targets, modifiers } of injectedModifiers) {
    for (const target of targets) {
      if (target === 'character') {
        characterDamageModifiers.push(...modifiers)
      } else if (isCoordinatedAttack(target)) {
        const clone = originalToClone.get(target) as CoordinatedAttack | undefined
        if (clone) {
          clone.damageModifiers ??= []
          clone.damageModifiers.push(...modifiers)
        }
      } else {
        const clone = originalToClone.get(target) as Action | undefined
        if (clone) {
          clone.damageModifiers.push(...modifiers)
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
      const clone = originalToClone.get(target) as Action | undefined
      if (clone) {
        clone.sideEffects = [...clone.sideEffects, ...sideEffects]
      }
    }
  }
}

/** Type guard distinguishing a CoordinatedAttack from an Action (by presence of `frequency`). */
function isCoordinatedAttack(target: Action | CoordinatedAttack): target is CoordinatedAttack {
  return 'frequency' in target
}
