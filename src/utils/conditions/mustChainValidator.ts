import type { Action } from '../../types/action'
import type { Character } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import type { EnergyType } from '../../types/baseTypes'
import { getActionCooldownKey } from '../hooks/cooldownHelpers'

// ========== Simulated State ==================================================================================================

type SimulatedState = {
  position: 'GROUND' | 'AIR'
  form: string
  energies: Partial<Record<EnergyType, number>>
}

// ========== State Projection Helpers =========================================================================================

function projectPositionAfterAction(action: Action, currentPosition: 'GROUND' | 'AIR'): 'GROUND' | 'AIR' {
  const endState = action.castConditions.endState
  if (endState === 'PRESERVE' || endState === 'ANY') return currentPosition
  return endState as 'GROUND' | 'AIR'
}

function projectFormAfterAction(action: Action, currentForm: string): string {
  return action.formChange ?? currentForm
}

function projectEnergiesAfterAction(
  action: Action,
  currentEnergies: Partial<Record<EnergyType, number>>,
  stats: Partial<Record<string, number>>,
  maxEnergies: Partial<Record<EnergyType, number>>,
): Partial<Record<EnergyType, number>> {
  const result: Partial<Record<EnergyType, number>> = { ...currentEnergies }

  // Subtract costs first (matches resolver order)
  for (const cost of action.energyCost) {
    const prev = result[cost.energyType] ?? 0
    result[cost.energyType] = Math.max(0, prev - cost.amount)
  }

  // Add generation
  for (const gen of action.energyGenerated) {
    let amount = gen.amount
    if (gen.scalingStat) {
      amount *= stats[gen.scalingStat] ?? 1
    }
    const prev = result[gen.energyType] ?? 0
    const max = maxEnergies[gen.energyType] ?? Infinity
    result[gen.energyType] = Math.min(max, (prev + amount))
  }

  return result
}

// ========== Castability in a Simulated State =================================================================================

function isActionCastableInState(action: Action, state: SimulatedState): boolean {
  // Position
  const startState = action.castConditions.startState
  if (startState !== 'ANY' && startState !== state.position) return false

  // Form
  if (action.castConditions.requiredForms !== undefined) {
    if (action.castConditions.requiredForms.length === 0) return false
    if (!action.castConditions.requiredForms.includes(state.form)) return false
  }

  // Energy
  for (const cost of action.energyCost) {
    if ((state.energies[cost.energyType] ?? 0) < cost.amount) return false
  }

  return true
}

// ========== Public: Immediate follow-up castability ==========================================================================

/**
 * Returns true when `followUpAction` can be cast in the given snapshot state.
 * Checks position, form, energy, and cooldown.
 * Used for "if possible" follow-ups to decide whether to lock the action selector.
 */
export function isFollowUpCastableNow(
  followUpAction: Action,
  snapshot: Snapshot,
  character: Character,
): boolean {
  const charName = character.name

  const position = snapshot.charactersPositions?.[charName] ?? 'GROUND'

  const storedForm = snapshot.charactersForms?.[charName] ?? ''
  const form =
    storedForm ||
    character.forms?.find(f => f.name === character.defaultForm)?.name ||
    character.forms?.[0]?.name ||
    ''

  const energies = snapshot.charactersEnergies?.[charName] ?? {}

  // Cooldown check
  const cooldownKey = getActionCooldownKey(followUpAction)
  const cooldownRemaining = snapshot.charactersCooldowns?.[charName]?.[cooldownKey] ?? 0
  if (cooldownRemaining > 0) return false

  return isActionCastableInState(followUpAction, { position, form, energies })
}

// ========== Public: MUST chain validation ====================================================================================

/**
 * Validates whether the MUST follow-up chain that starts from `startingAction` can be
 * satisfied given the state BEFORE `startingAction` is cast (`previousSnapshot`).
 *
 * Simulates position, form, and energy through each MUST step in the chain.
 * A step is part of the MUST chain when its `requiredFollowUp.must` is true (or undefined,
 * which defaults to true).
 *
 * Returns true if every MUST step would be castable; false otherwise.
 */
export function validateMustChain(
  startingAction: Action,
  previousSnapshot: Snapshot,
  character: Character,
  allActions: Action[],
): boolean {
  const charName = character.name
  const stats = character.stats as Partial<Record<string, number>>

  // Resolve initial form (same logic as ActionSelect Goal 4)
  const storedForm = previousSnapshot.charactersForms?.[charName] ?? ''
  const initialForm =
    storedForm ||
    character.forms?.find(f => f.name === character.defaultForm)?.name ||
    character.forms?.[0]?.name ||
    ''

  // Project state after the starting action
  let state: SimulatedState = {
    position: projectPositionAfterAction(
      startingAction,
      previousSnapshot.charactersPositions?.[charName] ?? 'GROUND',
    ),
    form: projectFormAfterAction(startingAction, initialForm),
    energies: projectEnergiesAfterAction(
      startingAction,
      { ...(previousSnapshot.charactersEnergies?.[charName] ?? {}) },
      stats,
      character.maxEnergies,
    ),
  }

  let action = startingAction

  while (true) {
    const followUp = action.requiredFollowUp
    // Stop walking when there is no follow-up, or when the follow-up is not explicitly MUST.
    // Only explicit must: true links are part of the MUST chain.
    if (!followUp || !followUp.must) break

    const followUpAction = allActions.find(
      a => a.name === followUp.actionName || a.groupName === followUp.actionName,
    )
    if (!followUpAction) return false // Action not found in character's move list

    if (!isActionCastableInState(followUpAction, state)) return false

    state = {
      position: projectPositionAfterAction(followUpAction, state.position),
      form: projectFormAfterAction(followUpAction, state.form),
      energies: projectEnergiesAfterAction(followUpAction, state.energies, stats, character.maxEnergies),
    }

    action = followUpAction
  }

  return true
}
