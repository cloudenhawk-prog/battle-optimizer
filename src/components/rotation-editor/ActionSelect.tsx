import '../../styles/rotation-editor/ActionSelect.css'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Action, ActionCategory } from '../../types/action'
import type { Character } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import type { EnergyType } from '../../types/baseTypes'
import { getActionCooldownKey } from '../../utils/hooks/cooldownHelpers'
import { validateMustChain } from '../../utils/conditions/mustChainValidator'

// ========== Component: Action Select =========================================================================================

type ActionSelectProps = {
  value: string
  actions: Action[]
  character?: Character
  currentEnergies?: Partial<Record<EnergyType, number>>
  previousSnapshot?: Snapshot | null
  onChange: (actionName: string) => void
  disabled?: boolean
  sandboxMode?: boolean
}

type ActionState = {
  action: Action
  isSpecial: boolean
  isCurrent: boolean
  isUnaffordable: boolean
  isOnCooldown: boolean
  cooldownRemaining: number
  stacksInfo?: { current: number; max: number; rechargeTime: number }
  missingEnergy: Array<{ type: EnergyType; needed: number; current: number }>
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

export function ActionSelect({ value, actions, character, currentEnergies, previousSnapshot, onChange, disabled = false, sandboxMode = false }: ActionSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [variantPopupPosition, setVariantPopupPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const variantPopupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const groupRowRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false, bottomPos: 0 })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedButton = buttonRef.current && buttonRef.current.contains(event.target as Node)
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(event.target as Node)
      const clickedVariantPopup = variantPopupRef.current && variantPopupRef.current.contains(event.target as Node)

      if (!clickedButton && !clickedDropdown && !clickedVariantPopup) {
        setIsOpen(false)
        setExpandedGroup(null)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const DROPDOWN_GAP = 4
      const spaceBelow = window.innerHeight - rect.bottom
      const openUpward = spaceBelow < 300
      setDropdownPosition({
        top: rect.bottom + DROPDOWN_GAP,
        left: rect.left,
        width: rect.width,
        openUpward,
        bottomPos: window.innerHeight - rect.top + DROPDOWN_GAP,
      })
    }
  }, [isOpen])

  // Get the current state of an action
  const getActionState = (action: Action): ActionState => {
    const isSpecial = action.name === 'Intro' || action.name === 'Outro'
    const isCurrent = action.name === value

    if (sandboxMode) {
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

    let isUnaffordable = false
    let cooldownRemaining = 0
    const missingEnergy: Array<{ type: EnergyType; needed: number; current: number }> = []

    if (character && currentEnergies) {
      for (const cost of action.energyCost) {
        const { energyType, amount } = cost
        const current = currentEnergies[energyType] ?? 0
        if (current < amount) {
          isUnaffordable = true
          missingEnergy.push({ type: energyType, needed: amount, current })
        }
      }
    }

    // Check if action is on cooldown
    // Variants (actions with same groupName) share cooldowns
    let stacksInfo: { current: number; max: number; rechargeTime: number } | undefined
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

    const isOnCooldown = cooldownRemaining > 0

    // Determine character's effective position and last action
    // - If same character as previous snapshot: use stored position/lastAction directly
    // - If swapping back: use stored state only when within the persistence window
    // - Otherwise (outside persistence or no persistence): mirror the active character's position, combo breaks
    let charPosition: 'GROUND' | 'AIR' = 'GROUND'
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

    // Resolve the character's current form from the snapshot (needed for intro simulation and form checks).
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

    // When the active character has full concerto (100) and this is a different character,
    // the swap will automatically trigger this character's Intro skill before the user's action.
    // Pre-simulate the Intro's position and form changes so that action availability is evaluated
    // against the correct post-intro state rather than the raw snapshot state.
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
              effectivePosition = introEndState as 'GROUND' | 'AIR'
            }
            if (introAction.formChange) {
              effectiveForm = introAction.formChange
            }
            effectiveLastAction = introAction.name
          }
        }
      }
    }

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

    // Goal 4: form check
    // Check if action requires a specific form and if character is in that form.
    // Uses effectiveForm which already accounts for any intro skill form change that
    // would occur when swapping in with the active character at full concerto.
    let isWrongForm = false
    if (character && action.castConditions.requiredForms !== undefined) {
      // If requiredForms is empty array, action can't be cast
      if (action.castConditions.requiredForms.length === 0) {
        isWrongForm = true
      } else {
        isWrongForm = !action.castConditions.requiredForms.includes(effectiveForm)
      }
    }

    // Goal 5: customCanCast check
    // Check if action has a custom validation function
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

      // When the current character is swapping IN (differs from the previous on-field character),
      // the character they're replacing will receive a 1-second swap cooldown starting at
      // previousSnapshot.toTime during resolution. That cooldown doesn't exist in the snapshot
      // yet, so we must account for it proactively to avoid allowing a chain that deadlocks.
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
    // If the previous action set a follow-up, only allow that specific action when must: true.
    // must: true  → always lock; parent was only castable if the chain could be satisfied.
    // must: false → never lock; the follow-up is attempted automatically if castable, but
    //               the user is free to choose any action regardless.
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

    // Goal 9: combo starter validation
    // For MUST follow-ups: ensure the follow-up will be off cooldown when the parent
    // completes, and validate the entire MUST chain for position/form/energy.
    // For "if possible" follow-ups: no restriction on the parent action itself;
    // whether the follow-up is locked is handled by Goal 8.
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

        // Chain validation: simulate position/form/energy through the entire MUST chain
        if (!isFollowUpNotReady) {
          isMustChainUnsatisfiable = !validateMustChain(action, previousSnapshot, character, actions)
        }
      }
    }

    // Goal 11: requiredComboTags / blockedComboTags check
    // requiredComboTags: ALL listed tags must be present on the character's last personal action.
    // blockedComboTags: NONE of the listed tags may be present on the character's last personal action.
    // Both honour the same persistence window used for charLastAction above.
    const requiredComboTagsConstraint = action.castConditions.requiredComboTags
    const blockedComboTagsConstraint = action.castConditions.blockedComboTags
    const isRequiredTagsMissing = !!requiredComboTagsConstraint?.length && !requiredComboTagsConstraint.every(tag => charComboChainTags.includes(tag))
    const isBlockedTagPresent = !!blockedComboTagsConstraint?.length && blockedComboTagsConstraint.some(tag => charComboChainTags.includes(tag))
    const isComboTagMismatch = isRequiredTagsMissing || isBlockedTagPresent

    // Goal 10: comboWindow check
    // Check if this action can only be cast within a time window after specific previous actions
    let isComboWindowExpired = false
    if (action.castConditions.comboWindow && character && previousSnapshot) {
      const comboWindow = action.castConditions.comboWindow
      const charName = character.name
      const currentTime = previousSnapshot.toTime

      // Get the combo window tracking for this character
      const comboTracking = previousSnapshot.charactersComboWindows?.[charName]

      if (!comboTracking) {
        // No combo action was ever cast
        isComboWindowExpired = true
      } else {
        // Check if the tracked action is one of the required previous actions
        const matchingAction = comboWindow.previousActions.find(a => a.name === comboTracking.actionName)

        if (!matchingAction) {
          // The last action cast was not one of the combo starters
          isComboWindowExpired = true
        } else {
          // Calculate the actual combo window start time based on timerStartsAt
          // comboTracking.startTime is when the action started casting
          // We need to add castTime if timerStartsAt is 'afterCast'
          let windowStartTime = comboTracking.startTime
          if (comboWindow.timerStartsAt === 'afterCast') {
            // Find the action to get its cast time
            windowStartTime += matchingAction.castTime
          }

          const timeSinceCombo = currentTime - windowStartTime
          const windowExpired = timeSinceCombo > comboWindow.maxTimeSincePrevious
          const swapBroke = comboWindow.crashesOnSwap && comboTracking.wasSwapped
          const formChangeBroke = comboWindow.crashesOnFormChange && comboTracking.formChanged

          isComboWindowExpired = windowExpired || swapBroke || formChangeBroke
        }
      }
    }

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

  // Filter out intro/outro actions - they're automatically triggered, not user-selectable
  const selectableActions = actions.filter(action => {
    const isIntroOutro = action.tags?.includes('INTRO_ACTION') || action.tags?.includes('OUTRO_ACTION')
    return !isIntroOutro
  })

  const actionStates = selectableActions.map(getActionState)
    .filter(s => !s.isWrongForm || s.isCurrent)
    .filter(s => {
      if (!s.action.hideWhenNotCastable || s.isCurrent) return true
      const isNotCastable = s.isUnaffordable || s.isOnCooldown || s.isWrongPosition || s.isPreviousActionMismatch || s.isRequiresSwapIn || s.isWrongForm || s.isCustomCanCastFailed || s.isOnSwapCooldown || s.isNoSwapTarget || s.isNotRequiredFollowUp || s.isFollowUpNotReady || s.isMustChainUnsatisfiable || s.isComboWindowExpired || s.isComboTagMismatch
      return !isNotCastable
    })
  const selectedAction = actionStates.find(s => s.isCurrent)
  const displayText = selectedAction ? selectedAction.action.name : '-- Select Action --'

  // Group actions by groupName or show individually
  type ActionGroup = {
    groupKey: string // The key used for grouping (groupName or action.name)
    displayName: string // What to show in the UI
    isGroup: boolean // Whether this represents multiple actions
    variants: ActionState[] // All action states in this group
    isSelectable: boolean // Whether any variant is selectable
    isCurrent: boolean // Whether any variant is current
  }

  const actionGroups: ActionGroup[] = []
  const groupMap = new Map<string, ActionState[]>()

  // First, organize actions into groups
  for (const actionState of actionStates) {
    const groupKey = actionState.action.groupName || actionState.action.name
    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, [])
    }
    groupMap.get(groupKey)!.push(actionState)
  }

  // Then create ActionGroup objects
  for (const [groupKey, variants] of groupMap.entries()) {
    const isGroup = variants.length > 1 || variants[0].action.groupName !== undefined
    const isSelectable = variants.some(v => !v.isOnCooldown && !v.isUnaffordable && !v.isWrongPosition && !v.isPreviousActionMismatch && !v.isRequiresSwapIn && !v.isWrongForm && !v.isCustomCanCastFailed && !v.isOnSwapCooldown && !v.isNoSwapTarget && !v.isNotRequiredFollowUp && !v.isFollowUpNotReady && !v.isMustChainUnsatisfiable && !v.isComboWindowExpired && !v.isComboTagMismatch)
    const isCurrent = variants.some(v => v.isCurrent)

    actionGroups.push({
      groupKey,
      displayName: isGroup ? variants[0].action.groupName || variants[0].action.name : variants[0].action.name,
      isGroup,
      variants,
      isSelectable,
      isCurrent,
    })
  }

  // Group actions by category and sort alphabetically within each category.
  // Categories are derived dynamically from present actions so that any ActionCategory value
  // (e.g. 'Echo Skill') is always included without requiring a code change here.
  const preferredCategoryOrder = ['Basics', 'Skills', 'Echo Skill', 'Other', 'Testing'] satisfies ActionCategory[] // This is simply a desired order for categories to appear in the UI, if present. Any categories not in this list will be appended at the end.
  const presentCategories = [...new Set(actionGroups.map(g => g.variants[0].action.category))]
  const orderedCategories = [...preferredCategoryOrder.filter(c => presentCategories.includes(c)), ...presentCategories.filter(c => !preferredCategoryOrder.includes(c))]
  const groupsByCategory = orderedCategories
    .map(category => ({
      category,
      groups: actionGroups.filter(g => g.variants[0].action.category === category).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    }))
    .filter(categoryGroup => categoryGroup.groups.length > 0)

  const handleSelect = (actionName: string) => {
    onChange(actionName)
    setIsOpen(false)
    setExpandedGroup(null)
  }

  const handleGroupClick = (groupKey: string, group: ActionGroup) => {
    if (group.isGroup) {
      if (expandedGroup === groupKey) {
        setExpandedGroup(null)
      } else {
        setExpandedGroup(groupKey)
        const groupRow = groupRowRefs.current.get(groupKey)
        if (groupRow && dropdownRef.current) {
          const rowRect = groupRow.getBoundingClientRect()
          const dropdownRect = dropdownRef.current.getBoundingClientRect()
          setVariantPopupPosition({
            top: rowRect.top,
            left: dropdownRect.right + 8,
          })
        }
      }
    } else {
      handleSelect(group.variants[0].action.name)
    }
  }

  return (
    <div className="actionSelectWrapper">
      <button ref={buttonRef} className="actionSelectButton" onClick={() => !disabled && setIsOpen(!isOpen)} disabled={disabled} type="button">
        <span>{displayText}</span>
        <span className="actionSelectArrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="actionSelectDropdown"
            style={
              dropdownPosition.openUpward
                ? { bottom: `${dropdownPosition.bottomPos}px`, left: `${dropdownPosition.left}px` }
                : { top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }
            }>
            <div className="actionSelectTable">
              {/* Header */}
              <div className="actionSelectHeader">
                <div className="actionSelectCell actionNameCell">Action</div>
                <div className="actionSelectCell actionCooldownCell">Cooldown</div>
                <div className="actionSelectCell actionEnergyCell">Energy</div>
              </div>

              {/* Rows */}
              {actionGroups.length === 0 ? (
                <div className="actionSelectRow">
                  <div className="actionSelectCell" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
                    No actions available
                  </div>
                </div>
              ) : (
                groupsByCategory.map(({ category, groups }) => (
                  <div key={category}>
                    {/* Category Header */}
                    <div className="actionSelectCategoryHeader">
                      <div className="actionSelectCell" style={{ gridColumn: '1 / -1', fontWeight: 'bold', fontSize: '0.9em' }}>
                        {category}
                      </div>
                    </div>

                    {/* Groups in this category */}
                    {groups.map(group => {
                      const isExpanded = expandedGroup === group.groupKey
                      const hasMultipleVariants = group.variants.length > 1

                      // Check if any variant in this group is special and not current
                      const hasSpecialNotCurrent = group.variants.some(v => v.isSpecial && !v.isCurrent)
                      if (hasSpecialNotCurrent && !group.isCurrent) return null

                      // For groups, check if any variant is available
                      const groupIsDisabled = !group.isSelectable && !group.isCurrent
                      const groupCanSelect = !groupIsDisabled || hasMultipleVariants

                      return (
                        <div key={group.groupKey}>
                          {/* Group Row */}
                          <div
                            ref={el => {
                              if (el) groupRowRefs.current.set(group.groupKey, el)
                            }}
                            className={`actionSelectRow ${groupIsDisabled ? 'disabled' : ''} ${group.isCurrent ? 'selected' : ''} ${groupCanSelect ? 'selectable' : ''} ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => {
                              if (groupCanSelect) {
                                handleGroupClick(group.groupKey, group)
                              }
                            }}>
                            <div className="actionSelectCell actionNameCell">
                              {group.displayName}
                              {hasMultipleVariants && <span style={{ marginLeft: '8px', opacity: 0.6 }}>{isExpanded ? '▼' : '▶'}</span>}
                            </div>
                            <div className="actionSelectCell actionCooldownCell">
                              {(() => {
                                const rep = group.variants[0]
                                if (rep.stacksInfo) {
                                  const { current, max, rechargeTime } = rep.stacksInfo
                                  return `${current}/${max}${rechargeTime > 0 ? ` | ${rechargeTime.toFixed(1)}s` : ''}`
                                }
                                if (group.variants.every(v => v.isOnCooldown && v.cooldownRemaining === rep.cooldownRemaining)) {
                                  return `${rep.cooldownRemaining.toFixed(2)}s`
                                }
                                return null
                              })()}
                            </div>
                            <div className="actionSelectCell actionEnergyCell">
                              {/* Show energy status for the group */}
                              {(() => {
                                const representative = group.variants.find(v => v.isCurrent) ?? group.variants.find(v => v.missingEnergy.length > 0) ?? group.variants[0]
                                if (representative.missingEnergy.length > 0) {
                                  return <span className="energyMissing">{representative.missingEnergy.map(e => `${e.current.toFixed(2)}/${e.needed} ${e.type}`).join(', ')}</span>
                                }
                                return representative.action.energyCost.length > 0 ? <span className="energyOk">✓</span> : ''
                              })()}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}

      {/* Variant Popup (shown to the right when a group is expanded) */}
      {isOpen &&
        expandedGroup &&
        createPortal(
          <div
            ref={variantPopupRef}
            className="actionSelectVariantPopup"
            style={{
              top: `${variantPopupPosition.top}px`,
              left: `${variantPopupPosition.left}px`,
            }}>
            <div className="actionSelectVariantTable">
              {(() => {
                const group = actionGroups.find(g => g.groupKey === expandedGroup)
                if (!group) return null

                return (
                  <>
                    {/* Variant Header */}
                    <div className="actionSelectVariantHeader">
                      <div className="actionSelectCell" style={{ fontWeight: 'bold', fontSize: '0.9em' }}>
                        {group.displayName}
                      </div>
                    </div>

                    {/* Variant Rows */}
                    {group.variants.map(variant => {
const { action, isCurrent, isUnaffordable, isOnCooldown, cooldownRemaining, stacksInfo, missingEnergy, isWrongPosition, isPreviousActionMismatch, isRequiresSwapIn, isWrongForm, isCustomCanCastFailed, isOnSwapCooldown, swapCooldownRemaining, isNoSwapTarget, isNotRequiredFollowUp, isFollowUpNotReady, isMustChainUnsatisfiable, isComboWindowExpired, isComboTagMismatch } = variant

                      const isDisabled = (isUnaffordable || isOnCooldown || isWrongPosition || isPreviousActionMismatch || isRequiresSwapIn || isWrongForm || isCustomCanCastFailed || isOnSwapCooldown || isNoSwapTarget || isNotRequiredFollowUp || isFollowUpNotReady || isMustChainUnsatisfiable || isComboWindowExpired || isComboTagMismatch) && !isCurrent
                      const canSelect = !isDisabled

                      return (
                        <div
                          key={action.name}
                          className={`actionSelectVariantRow ${isDisabled ? 'disabled' : ''} ${isCurrent ? 'selected' : ''} ${canSelect ? 'selectable' : ''}`}
                          onClick={e => {
                            e.stopPropagation()
                            if (canSelect) {
                              handleSelect(action.name)
                            }
                          }}>
                          <div className="actionSelectVariantCell">
                            <div className="variantName">{action.variantName || action.name}</div>
                            <div className="variantDetails">
                              {stacksInfo && <span className="variantCooldown">{stacksInfo.current}/{stacksInfo.max}{stacksInfo.rechargeTime > 0 ? ` | ${stacksInfo.rechargeTime.toFixed(1)}s` : ''}</span>}
                              {!stacksInfo && isOnCooldown && <span className="variantCooldown">CD: {cooldownRemaining.toFixed(2)}s</span>}
                              {isOnSwapCooldown && <span className="variantCooldown">Swap CD: {swapCooldownRemaining.toFixed(2)}s</span>}
                              {isComboWindowExpired && <span className="variantBlockedReason">Combo window expired</span>}
                              {isComboTagMismatch && <span className="variantBlockedReason">Wrong combo position</span>}
                              {missingEnergy.length > 0 ? <span className="energyMissing">{missingEnergy.map(e => `${e.current.toFixed(2)}/${e.needed} ${e.type}`).join(', ')}</span> : action.energyCost.length > 0 ? <span className="energyOk">✓</span> : null}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )
              })()}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
