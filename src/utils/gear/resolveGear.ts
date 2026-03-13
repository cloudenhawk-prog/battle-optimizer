import type { Action } from '../../types/action'
import type { CoordinatedAttack } from '../../types/coordinatedAttack'
import type { DamageModifier } from '../../types/modifiers'
import type { InjectedModifier, InjectedSideEffect, Gear } from '../../types/gear'

// ========== Gear Modifier Injection ==========================================================================================

/**
 * Injects modifiers from gear into character actions and/or character-level modifier list.
 * Called by resolveCharacter — use that instead of calling this directly.
 *
 * Sources injected:
 *  - Weapon `injectedModifiers`
 *  - Slot-1 echo `injectedModifiers` and `injectedSideEffects`
 *  - Set bonus `injectedModifiers` (only when all 5 slots are filled)
 *
 * Each InjectedModifier target can be `'character'` or an Action object reference.
 * Each InjectedSideEffect target is an Action object reference (actions only).
 */
export function resolveGear(
  characterActions: Action[],
  characterDamageModifiers: DamageModifier[],
  gear: Gear,
): void {
  // Weapon modifier injection
  if (gear.weapon.injectedModifiers?.length) {
    applyInjectedModifiers(gear.weapon.injectedModifiers, characterActions, characterDamageModifiers)
  }

  // Slot-1 echo modifier and side-effect injection
  const slot1Echo = gear.echoSlots[1]
  if (slot1Echo?.injectedModifiers?.length) {
    applyInjectedModifiers(slot1Echo.injectedModifiers, characterActions, characterDamageModifiers)
  }
  if (slot1Echo?.injectedSideEffects?.length) {
    applyInjectedSideEffects(slot1Echo.injectedSideEffects, characterActions)
  }

  // Set bonus modifier injection (requires all 5 slots filled)
  const slots = gear.echoSlots
  const allFilled = slots[1] && slots[2] && slots[3] && slots[4] && slots[5]
  if (allFilled && gear.setBonus?.injectedModifiers?.length) {
    applyInjectedModifiers(gear.setBonus.injectedModifiers, characterActions, characterDamageModifiers)
  }
}

function applyInjectedModifiers(
  injectedModifiers: InjectedModifier[],
  characterActions: Action[],
  characterDamageModifiers: DamageModifier[],
): void {
  for (const { targets, modifiers } of injectedModifiers) {
    for (const target of targets) {
      if (target === 'character') {
        characterDamageModifiers.push(...modifiers)
      } else if (isCoordinatedAttack(target)) {
        // Search for the coordinated attack nested inside any action
        for (const action of characterActions) {
          const found = action.coordinatedAttacks?.find(ca => ca === target)
          if (found) {
            found.damageModifiers ??= []
            found.damageModifiers.push(...modifiers)
            break
          }
        }
      } else {
        const found = characterActions.find(a => a === target)
        if (found) {
          found.damageModifiers.push(...modifiers)
        }
      }
    }
  }
}

/** Type guard distinguishing a CoordinatedAttack from an Action (by presence of `frequency`). */
function isCoordinatedAttack(target: Action | CoordinatedAttack): target is CoordinatedAttack {
  return 'frequency' in target
}

function applyInjectedSideEffects(
  injectedSideEffects: InjectedSideEffect[],
  characterActions: Action[],
): void {
  for (const { targets, sideEffects } of injectedSideEffects) {
    for (const target of targets) {
      const found = characterActions.find(a => a === target)
      if (found) {
        found.sideEffects.push(...sideEffects)
      }
    }
  }
}
