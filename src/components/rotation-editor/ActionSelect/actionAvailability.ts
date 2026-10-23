// Pure cast-rule evaluation for the action dropdown: why each action is (un)castable from the previous row.
//
// NOTE: this mirrors the engine's cast rules (engine/castRules/*) for display purposes. If a rule changes
// there, update the matching "Goal" here, otherwise the dropdown and the engine disagree.
import type { Action } from '../../../types/action'
import type { Character } from '../../../types/character'
import type { Snapshot } from '../../../types/snapshot'
import type { EnergyType } from '../../../types/baseTypes'
import { getActionCooldownKey } from '../../../engine/state/cooldownHelpers'
import { validateMustChain } from '../../../engine/castRules/mustChainValidator'

// ========== Types ============================================================================================================

export type StacksInfo = { current: number; max: number; rechargeTime: number }
export type MissingEnergy = { type: EnergyType; needed: number; current: number }

export type ActionState = {
  action: Action
  isSpecial: boolean
  isCurrent: boolean
  isUnaffordable: boolean
  isOnCooldown: boolean
  cooldownRemaining: number
  stacksInfo?: StacksInfo
  missingEnergy: MissingEnergy[]
  isWrongPosition: boolean
  isPreviousActionMismatch: boolean
  isRequiresSwapIn: boolean
  isWrongForm: boolean
  isCustomCanCastFailed: boolean
  isOnSwapCooldown: boolean
  swapCooldownRemaining: number
  isNoSwapTarget: boolean
  isNotRequiredFollowUp: boolean
  isFollowUpNotReady: boolean
  isMustChainUnsatisfiable: boolean
  isComboWindowExpired: boolean
  isComboTagMismatch: boolean
}

/** Everything the rules read besides the action itself (the ActionSelect props). */
export type ActionAvailabilityContext = {
  value: string
  actions: Action[]
  character?: Character
  currentEnergies?: Partial<Record<EnergyType, number>>
  previousSnapshot?: Snapshot | null
  sandboxMode: boolean
}

type Position = 'GROUND' | 'AIR'

// ========== Blocked check ====================================================================================================

/** True when any cast rule blocks the action (ignores whether it is the current selection). */
export function isActionBlocked(s: ActionState): boolean {
  return s.isUnaffordable || s.isOnCooldown || s.isWrongPosition || s.isPreviousActionMismatch || s.isRequiresSwapIn || s.isWrongForm || s.isCustomCanCastFailed || s.isOnSwapCooldown || s.isNoSwapTarget || s.isNotRequiredFollowUp || s.isFollowUpNotReady || s.isMustChainUnsatisfiable || s.isComboWindowExpired || s.isComboTagMismatch
}

// ========== Character state before the action ================================================================================

/** Energy costs the character cannot pay right now. */
function getMissingEnergy(action: Action, ctx: ActionAvailabilityContext): MissingEnergy[] {
  const missingEnergy: MissingEnergy[] = []
  if (ctx.character && ctx.currentEnergies) {
    for (const cost of action.energyCost) {
      const { energyType, amount } = cost
      const current = ctx.currentEnergies[energyType] ?? 0
      if (current < amount) {
        missingEnergy.push({ type: energyType, needed: amount, current })
      }
    }
  }
  return missingEnergy
}

/** Remaining cooldown (variants sharing a groupName share it) and, for stacked actions, the stack counter. */
function getCooldown(action: Action, ctx: ActionAvailabilityContext): { cooldownRemaining: number; stacksInfo?: StacksInfo } {
  const { character, previousSnapshot } = ctx
  let cooldownRemaining = 0
  let stacksInfo: StacksInfo | undefined
  if (character && previousSnapshot && previousSnapshot.charactersCooldowns) {
    const characterCooldowns = previousSnapshot.charactersCooldowns[character.name] ?? {}
    const cooldownKey = getActionCooldownKey(action)
    cooldownRemaining = characterCooldowns[cooldownKey] ?? 0

    // For stacked actions, castability depends on stack count, not the recharge timer
    if (action.maxStacks && action.maxStacks > 1) {
      const storedStacks = previousSnapshot.charactersActionStacks?.[character.name]?.[cooldownKey]
      const currentStacks = storedStacks ?? action.maxStacks // absent = at max stacks
      const rechargeTime = cooldownRemaining
      stacksInfo = { current: currentStacks, max: action.maxStacks, rechargeTime }
      // Action is blocked only when stacks are empty; the recharge timer does not block it
      if (currentStacks > 0) cooldownRemaining = 0
    }
  }
  return { cooldownRemaining, stacksInfo }
}

/**
 * The character's position, last action and combo tags as seen by the next action.
 * - Same character as the previous row, or swapping back within the persistence window: stored state.
 * - Otherwise: mirror the active character's position; the combo breaks (no last action / tags).
 */
function getCharacterCarryOver(ctx: ActionAvailabilityContext): { charPosition: Position; charLastAction?: string; charComboChainTags: string[] } {
  const { character, previousSnapshot } = ctx
  let charPosition: Position = 'GROUND'
  let charLastAction: string | undefined = undefined
  let charComboChainTags: string[] = []

  if (character && previousSnapshot) {
    const charName = character.name
    const storedPosition = previousSnapshot.charactersPositions?.[charName] ?? 'GROUND'
    const persistentUntil = previousSnapshot.charactersPersistentUntil?.[charName] ?? 0
    const isPrevCharacter = previousSnapshot.character === charName
    const isWithinPersistence = persistentUntil > 0 && previousSnapshot.toTime <= persistentUntil

    if (isPrevCharacter || isWithinPersistence) {
      charPosition = storedPosition
      charLastAction = previousSnapshot.charactersLastAction?.[charName]
      charComboChainTags = previousSnapshot.charactersComboChainTags?.[charName] ?? []
    } else {
      // Mirror the active character's position — the incoming character inherits where the field left off
      const activeCharName = previousSnapshot.character
      charPosition = activeCharName
        ? (previousSnapshot.charactersPositions?.[activeCharName] ?? 'GROUND')
        : 'GROUND'
    }
  }
  return { charPosition, charLastAction, charComboChainTags }
}

/** Current form from the snapshot, falling back to the character's default (or first) form. */
function getBaseForm(ctx: ActionAvailabilityContext): string {
  const { character, previousSnapshot } = ctx
  let baseForm: string = ''
  if (character) {
    if (previousSnapshot) {
      const storedForm = previousSnapshot.charactersForms?.[character.name] ?? ''
      if (!storedForm) {
        const defaultForm = character.forms?.find(f => f.name === character.defaultForm) ?? character.forms?.[0]
        baseForm = defaultForm?.name ?? ''
      } else {
        baseForm = storedForm
      }
    } else {
      const defaultForm = character.forms?.find(f => f.name === character.defaultForm) ?? character.forms?.[0]
      baseForm = defaultForm?.name ?? ''
    }
  }
  return baseForm
}

/**
 * When the active character has full concerto (100) and this is a different character, the swap
 * auto-casts this character's Intro before the user's action. Pre-simulate the Intro's position/form/
 * last-action changes so availability is judged against the post-intro state.
 */
function applyIntroPreSimulation(ctx: ActionAvailabilityContext, charPosition: Position, baseForm: string, charLastAction: string | undefined) {
  const { character, previousSnapshot, actions } = ctx
  let effectivePosition = charPosition
  let effectiveForm = baseForm
  let effectiveLastAction = charLastAction

  if (character && previousSnapshot) {
    const activeCharName = previousSnapshot.character
    if (activeCharName && activeCharName !== character.name) {
      const activeCharConcerto = previousSnapshot.charactersEnergies?.[activeCharName]?.['concerto'] ?? 0
      if (activeCharConcerto >= 100) {
        // Prefer a form-specific intro action; fall back to the default intro in the actions list.
        let introAction: Action | undefined
        if (baseForm && character.forms) {
          const currentFormObj = character.forms.find(f => f.name === baseForm)
          if (currentFormObj?.introAction) introAction = currentFormObj.introAction
        }
        if (!introAction) {
          introAction = actions.find(a => (a.dmgTypes as string[]).includes('INTRO'))
        }

        if (introAction) {
          const introEndState = introAction.castConditions.endState
          if (introEndState !== 'PRESERVE' && introEndState !== 'ANY') {
            effectivePosition = introEndState as Position
          }
          if (introAction.formChange) {
            effectiveForm = introAction.formChange
          }
          effectiveLastAction = introAction.name
        }
      }
    }
  }
  return { effectivePosition, effectiveForm, effectiveLastAction }
}

// ========== Rule evaluation ==================================================================================================

/** Sandbox mode ignores every cast restriction. */
function unrestrictedState(action: Action, isSpecial: boolean, isCurrent: boolean): ActionState {
  return {
    action,
    isSpecial,
    isCurrent,
    isUnaffordable: false,
    isOnCooldown: false,
    cooldownRemaining: 0,
    stacksInfo: undefined,
    missingEnergy: [],
    isWrongPosition: false,
    isPreviousActionMismatch: false,
    isRequiresSwapIn: false,
    isWrongForm: false,
    isCustomCanCastFailed: false,
    isOnSwapCooldown: false,
    swapCooldownRemaining: 0,
    isNoSwapTarget: false,
    isNotRequiredFollowUp: false,
    isFollowUpNotReady: false,
    isMustChainUnsatisfiable: false,
    isComboWindowExpired: false,
    isComboTagMismatch: false,
  }
}

/** Evaluates every cast rule ("Goals") for one action against the previous row's snapshot. */
export function getActionState(action: Action, ctx: ActionAvailabilityContext): ActionState {
  const { character, previousSnapshot, actions } = ctx
  const isSpecial = action.tags?.includes('INTRO_ACTION') || action.tags?.includes('OUTRO_ACTION')
  const isCurrent = action.name === ctx.value

  if (ctx.sandboxMode) return unrestrictedState(action, isSpecial, isCurrent)

  const missingEnergy = getMissingEnergy(action, ctx)
  const isUnaffordable = missingEnergy.length > 0
  const { cooldownRemaining, stacksInfo } = getCooldown(action, ctx)
  const isOnCooldown = cooldownRemaining > 0

  const { charPosition, charLastAction, charComboChainTags } = getCharacterCarryOver(ctx)
  const baseForm = getBaseForm(ctx)
  const { effectivePosition, effectiveForm, effectiveLastAction } = applyIntroPreSimulation(ctx, charPosition, baseForm, charLastAction)

  // Goal 1: position check
  const isWrongPosition = action.castConditions.startState !== 'ANY' && action.castConditions.startState !== effectivePosition

  // Goal 2: previousActions check
  const previousActionsConstraint = action.castConditions.previousActions
  const isPreviousActionMismatch = !!previousActionsConstraint?.length && !previousActionsConstraint.some(pa => pa.name === effectiveLastAction)

  // Goal 3: requiresSwapIn check
  // Allowed if: the last timeline action was cast by a different character (justSwappedIn),
  // OR this character's last personal action was their Intro skill.
  // At game start (no previousSnapshot), no swap has occurred, so requiresSwapIn is always blocked.
  let isRequiresSwapIn = false
  if (action.castConditions.requiresSwapIn) {
    if (!previousSnapshot) {
      isRequiresSwapIn = true
    } else if (character) {
      const charName = character.name
      const justSwappedIn = previousSnapshot.character !== charName
      const lastActionName = previousSnapshot.charactersLastAction?.[charName]
      const lastActionWasIntro = lastActionName !== undefined && character.actions.some(a => a.name === lastActionName && a.dmgTypes.includes('INTRO'))
      isRequiresSwapIn = !justSwappedIn && !lastActionWasIntro
    }
  }

  // Goal 4: form check (effectiveForm already includes any intro form change).
  // An empty requiredForms array means the action can never be cast.
  let isWrongForm = false
  if (character && action.castConditions.requiredForms !== undefined) {
    if (action.castConditions.requiredForms.length === 0) {
      isWrongForm = true
    } else {
      isWrongForm = !action.castConditions.requiredForms.includes(effectiveForm)
    }
  }

  // Goal 5: customCanCast check (data-defined validation function)
  let isCustomCanCastFailed = false
  if (action.castConditions.customCanCast && character && previousSnapshot) {
    isCustomCanCastFailed = !action.castConditions.customCanCast(previousSnapshot, character.name)
  }

  // Goal 6: swap cooldown check
  // The character cannot be swapped in until their 1-second swap cooldown expires.
  let isOnSwapCooldown = false
  let swapCooldownRemaining = 0
  if (character && previousSnapshot) {
    const cooldownUntil = previousSnapshot.charactersSwapCooldownUntil?.[character.name] ?? 0
    const remaining = cooldownUntil - previousSnapshot.toTime
    if (remaining > 0) {
      isOnSwapCooldown = true
      swapCooldownRemaining = remaining
    }
  }

  // Goal 7: requiresSwapOut check
  // If this action forces a swap out, ensure at least one other character will be
  // available (swap cooldown <= 0) by the time the action completes.
  let isNoSwapTarget = false
  if (action.castConditions.requiresSwapOut && character && previousSnapshot) {
    const actionEndTime = previousSnapshot.toTime + action.castTime
    const allCharacterNames = Object.keys(previousSnapshot.charactersEnergies || {})
    const otherCharacters = allCharacterNames.filter(name => name !== character.name)

    // When this character swaps IN, the character they replace gets a 1-second swap cooldown from
    // previousSnapshot.toTime during resolution. It isn't in the snapshot yet, so account for it here
    // to avoid allowing a chain that deadlocks.
    const prevOnFieldChar = previousSnapshot.character
    const swappingIn = !!prevOnFieldChar && prevOnFieldChar !== character.name

    const hasAvailableSwapTarget = otherCharacters.some(otherCharName => {
      let swapCooldownUntil = previousSnapshot.charactersSwapCooldownUntil?.[otherCharName] ?? 0
      if (swappingIn && otherCharName === prevOnFieldChar) {
        swapCooldownUntil = Math.max(swapCooldownUntil, previousSnapshot.toTime + 1)
      }
      return swapCooldownUntil <= actionEndTime
    })

    isNoSwapTarget = !hasAvailableSwapTarget
  }

  // Goal 8: attempt follow-up check (combo system)
  // must: true  → lock to that follow-up; the parent was only castable if the chain could be satisfied.
  // must: false → never lock; the follow-up is attempted automatically if castable.
  let isNotRequiredFollowUp = false
  if (character && previousSnapshot) {
    const followUpEntry = previousSnapshot.charactersAttemptFollowUp?.[character.name]
    if (followUpEntry && followUpEntry.must) {
      const isThisTheFollowUp = action.name === followUpEntry.actionName || action.groupName === followUpEntry.actionName
      if (!isThisTheFollowUp) {
        isNotRequiredFollowUp = true
      }
    }
    // restrictNextTo: if a restriction is active, only allow actions in the list
    if (!isNotRequiredFollowUp) {
      const restrictNextTo = previousSnapshot.charactersRestrictNextTo?.[character.name]
      if (restrictNextTo?.length) {
        const isAllowed = restrictNextTo.includes(action.name) || (action.groupName !== undefined && restrictNextTo.includes(action.groupName))
        if (!isAllowed) isNotRequiredFollowUp = true
      }
    }
  }

  // Goal 9: combo starter validation (MUST follow-ups only; "if possible" ones are handled by Goal 8)
  // The follow-up must be off cooldown when this action ends, and the whole MUST chain must stay
  // valid for position/form/energy.
  let isFollowUpNotReady = false
  let isMustChainUnsatisfiable = false
  if (action.attemptFollowUp && character && previousSnapshot) {
    const must = action.attemptFollowUp.must ?? false
    if (must) {
      const followUpActionName = action.attemptFollowUp.actionName
      const followUpAction = actions.find(a => a.name === followUpActionName || a.groupName === followUpActionName)

      if (!followUpAction) {
        isFollowUpNotReady = true
      } else {
        const actionEndTime = previousSnapshot.toTime + action.castTime
        const characterCooldowns = previousSnapshot.charactersCooldowns?.[character.name] ?? {}
        const cooldownKey = getActionCooldownKey(followUpAction)
        const followUpCooldownRemaining = characterCooldowns[cooldownKey] ?? 0

        // Check if follow-up will be ready when this action completes
        if (followUpCooldownRemaining > actionEndTime - previousSnapshot.toTime) {
          isFollowUpNotReady = true
        }
      }

      if (!isFollowUpNotReady) {
        isMustChainUnsatisfiable = !validateMustChain(action, previousSnapshot, character, actions)
      }
    }
  }

  // Goal 11: requiredComboTags / blockedComboTags check
  // required: ALL listed tags must be on the character's combo chain; blocked: NONE of them may be.
  // Both honour the same persistence window used for charLastAction above.
  const requiredComboTagsConstraint = action.castConditions.requiredComboTags
  const blockedComboTagsConstraint = action.castConditions.blockedComboTags
  const isRequiredTagsMissing = !!requiredComboTagsConstraint?.length && !requiredComboTagsConstraint.every(tag => charComboChainTags.includes(tag))
  const isBlockedTagPresent = !!blockedComboTagsConstraint?.length && blockedComboTagsConstraint.some(tag => charComboChainTags.includes(tag))
  const isComboTagMismatch = isRequiredTagsMissing || isBlockedTagPresent

  // Goal 10: comboWindow check — the action is only castable within a time window after specific starters
  const isComboWindowExpired = isComboWindowExpiredFor(action, ctx)

  return {
    action,
    isSpecial,
    isCurrent,
    isUnaffordable,
    isOnCooldown,
    cooldownRemaining,
    stacksInfo,
    missingEnergy,
    isWrongPosition,
    isPreviousActionMismatch,
    isRequiresSwapIn,
    isWrongForm,
    isCustomCanCastFailed,
    isOnSwapCooldown,
    swapCooldownRemaining,
    isNoSwapTarget,
    isNotRequiredFollowUp,
    isFollowUpNotReady,
    isMustChainUnsatisfiable,
    isComboWindowExpired,
    isComboTagMismatch,
  }
}

/** Goal 10 helper: true when no valid combo starter is tracked, or its window ran out / was broken. */
function isComboWindowExpiredFor(action: Action, ctx: ActionAvailabilityContext): boolean {
  const { character, previousSnapshot } = ctx
  if (!(action.castConditions.comboWindow && character && previousSnapshot)) return false

  const comboWindow = action.castConditions.comboWindow
  const currentTime = previousSnapshot.toTime
  const comboTracking = previousSnapshot.charactersComboWindows?.[character.name]

  // No combo action was ever cast
  if (!comboTracking) return true

  // The last tracked action must be one of the combo starters
  const matchingAction = comboWindow.previousActions.find(a => a.name === comboTracking.actionName)
  if (!matchingAction) return true

  // comboTracking.startTime is when the starter began casting; 'afterCast' windows open when it ends
  let windowStartTime = comboTracking.startTime
  if (comboWindow.timerStartsAt === 'afterCast') {
    windowStartTime += matchingAction.castTime
  }

  const timeSinceCombo = currentTime - windowStartTime
  const windowExpired = timeSinceCombo > comboWindow.maxTimeSincePrevious
  const swapBroke = comboWindow.crashesOnSwap && comboTracking.wasSwapped
  const formChangeBroke = comboWindow.crashesOnFormChange && comboTracking.formChanged

  return windowExpired || swapBroke || formChangeBroke
}
