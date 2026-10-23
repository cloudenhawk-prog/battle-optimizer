// Per-action data validation: returns every problem found on one action (incl. its coordinated attacks).
import type { Action } from '../../../types/action'

/** Collects all logical errors for one action; an empty array means the action is valid. */
export function collectActionErrors(action: Action, negativeStatusNames: Set<string>): string[] {
  const errors: string[] = []
  if (action.castTime < 0) errors.push(`castTime ${action.castTime}`)
  if (action.multiplier < 0) errors.push(`multiplier ${action.multiplier}`)
  if (action.cooldown < 0) errors.push(`cooldown ${action.cooldown}`)
  if (action.offtune < 0) errors.push(`offtune ${action.offtune}`)
  for (const eg of action.energyGenerated) if (eg.amount < 0) errors.push(`energyGenerated "${eg.energyType}" ${eg.amount}`)
  for (const ec of action.energyCost) if (ec.amount < 0) errors.push(`energyCost "${ec.energyType}" ${ec.amount}`)
  for (const mod of action.statusModifications) if (mod.type === 'negativeStatus' && !negativeStatusNames.has(mod.targetName)) errors.push(`unknown negative status "${mod.targetName}"`)
  for (const ca of action.coordinatedAttacks ?? []) {
    if (ca.multiplier < 0) errors.push(`[CA "${ca.name}"] multiplier ${ca.multiplier}`)
    if (ca.frequency <= 0) errors.push(`[CA "${ca.name}"] frequency ${ca.frequency}`)
    if (ca.duration <= 0) errors.push(`[CA "${ca.name}"] duration ${ca.duration}`)
    for (const eg of ca.energyGenerated) if (eg.amount < 0) errors.push(`[CA "${ca.name}"] energyGenerated "${eg.energyType}" ${eg.amount}`)
    for (const mod of ca.statusModifications) if (mod.type === 'negativeStatus' && !negativeStatusNames.has(mod.targetName)) errors.push(`[CA "${ca.name}"] unknown negative status "${mod.targetName}"`)
  }
  errors.push(...collectSwapCancelErrors(action))
  errors.push(...collectCastConditionErrors(action))
  return errors
}

/**
 * variantName drives the intent; requiresSwapOut is the runtime flag.
 * Cross-validating both catches: (a) forgetting requiresSwapOut on a swap variant,
 * and (b) setting swapOutState/persistenceTime without the runtime flag being set.
 */
function collectSwapCancelErrors(action: Action): string[] {
  const errors: string[] = []
  const cc = action.castConditions
  const isSwapCancelByName = action.variantName?.startsWith('Cancel With Swap') ?? false
  const isSwapCancelByFlag = cc.requiresSwapOut === true
  // variantName declares swap-cancel intent → requiresSwapOut must be set
  if (isSwapCancelByName && !isSwapCancelByFlag) errors.push('Cancel With Swap variant missing castConditions.requiresSwapOut: true')
  // requiresSwapOut set → must also declare swapOutState and persistenceTime
  if (isSwapCancelByFlag) {
    if (cc.persistenceTime == null) errors.push('swap-cancel action missing castConditions.persistenceTime')
    if (cc.swapOutState == null) errors.push('swap-cancel action missing castConditions.swapOutState')
  }
  // Neither flag nor name → must NOT define persistenceTime or swapOutState
  if (!isSwapCancelByFlag && !isSwapCancelByName) {
    if (cc.persistenceTime != null) errors.push('non-swap-cancel action must not define castConditions.persistenceTime')
    if (cc.swapOutState != null) errors.push('non-swap-cancel action must not define castConditions.swapOutState')
  }
  return errors
}

/** castConditions state constraints (positions, persistence, previous-action lists, combo windows). */
function collectCastConditionErrors(action: Action): string[] {
  const errors: string[] = []
  const cc = action.castConditions
  if (cc.startState === 'PRESERVE') errors.push('castConditions.startState must not be "PRESERVE"')
  if (cc.endState === 'ANY') errors.push('castConditions.endState must not be "ANY"')
  if (cc.swapOutState === 'ANY') errors.push('castConditions.swapOutState must not be "ANY"')
  if (cc.persistenceTime != null && cc.persistenceTime < action.castTime) errors.push(`castConditions.persistenceTime (${cc.persistenceTime}) must be >= castTime (${action.castTime})`)
  if (cc.previousActions != null && cc.previousActions.length === 0) errors.push('castConditions.previousActions must not be an empty array')
  if (cc.comboWindow != null) {
    if (cc.comboWindow.previousActions.length === 0) errors.push('castConditions.comboWindow.previousActions must not be an empty array')
    if (cc.comboWindow.maxTimeSincePrevious <= 0) errors.push(`castConditions.comboWindow.maxTimeSincePrevious must be > 0 (got ${cc.comboWindow.maxTimeSincePrevious})`)
    if (cc.comboWindow.timerStartsAt !== 'cast' && cc.comboWindow.timerStartsAt !== 'afterCast') errors.push(`castConditions.comboWindow.timerStartsAt must be 'cast' or 'afterCast' (got ${cc.comboWindow.timerStartsAt})`)
  }
  return errors
}
