import '../../styles/rotation-editor/ActionSelect.css'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Action, ActionCategory } from '../../types/action'
import type { Character } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import type { EnergyType } from '../../types/baseTypes'
import { getActionCooldownKey } from '../../utils/hooks/cooldownHelpers'

// ========== Component: Action Select =========================================================================================

type ActionSelectProps = {
  value: string
  actions: Action[]
  character?: Character
  currentEnergies?: Partial<Record<EnergyType, number>>
  /** The resolved snapshot from the row immediately before this one.  All cast-condition
   *  checks (position, persistence, cooldowns, last action, form, requiresSwapIn) must be
   *  evaluated against the state at the END of the previous row, not the current one. */
  previousSnapshot?: Snapshot | null
  onChange: (actionName: string) => void
  disabled?: boolean
}

type ActionState = {
  action: Action
  isSpecial: boolean
  isCurrent: boolean
  isUnaffordable: boolean
  isOnCooldown: boolean
  cooldownRemaining: number
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
  isComboWindowExpired: boolean
}

export function ActionSelect({ value, actions, character, currentEnergies, previousSnapshot, onChange, disabled = false }: ActionSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [variantPopupPosition, setVariantPopupPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const variantPopupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const groupRowRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

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
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [isOpen])

  const getActionState = (action: Action): ActionState => {
    const isSpecial = action.name === 'Intro' || action.name === 'Outro'
    const isCurrent = action.name === value

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
    if (character && previousSnapshot && previousSnapshot.charactersCooldowns) {
      const characterCooldowns = previousSnapshot.charactersCooldowns[character.name] ?? {}
      const cooldownKey = getActionCooldownKey(action)
      cooldownRemaining = characterCooldowns[cooldownKey] ?? 0
    }

    const isOnCooldown = cooldownRemaining > 0

    // Determine character's effective position and last action
    // - If same character as previous snapshot: use stored position/lastAction directly
    // - If swapping back: use stored state only when within the persistence window
    // - Otherwise (outside persistence or no persistence): position resets to GROUND, combo breaks
    let charPosition: 'GROUND' | 'AIR' = 'GROUND'
    let charLastAction: string | undefined = undefined

    if (character && previousSnapshot) {
      const charName = character.name
      const storedPosition = previousSnapshot.charactersPositions?.[charName] ?? 'GROUND'
      const persistentUntil = previousSnapshot.charactersPersistentUntil?.[charName] ?? 0
      const isPrevCharacter = previousSnapshot.character === charName
      const isWithinPersistence = persistentUntil > 0 && previousSnapshot.toTime <= persistentUntil

      if (isPrevCharacter || isWithinPersistence) {
        charPosition = storedPosition
        charLastAction = previousSnapshot.charactersLastAction?.[charName]
      }
    }

    // Goal 1: position check
    const isWrongPosition = action.castConditions.startState !== 'ANY' && action.castConditions.startState !== charPosition

    // Goal 2: previousActions check
    const previousActionsConstraint = action.castConditions.previousActions
    const isPreviousActionMismatch = !!previousActionsConstraint?.length && !previousActionsConstraint.some(pa => pa.name === charLastAction)

    // Goal 3: requiresSwapIn check
    // Allowed if: the last timeline action was cast by a different character (justSwappedIn),
    // OR this character's last personal action was their Intro skill.
    let isRequiresSwapIn = false
    if (action.castConditions.requiresSwapIn && character && previousSnapshot) {
      const charName = character.name
      const justSwappedIn = previousSnapshot.character !== charName
      const lastActionName = previousSnapshot.charactersLastAction?.[charName]
      const lastActionWasIntro = lastActionName !== undefined && character.actions.some(a => a.name === lastActionName && a.dmgTypes.includes('INTRO'))
      isRequiresSwapIn = !justSwappedIn && !lastActionWasIntro
    }

    // Goal 4: form check
    // Check if action requires a specific form and if character is in that form
    let isWrongForm = false
    if (character && previousSnapshot && action.castConditions.requiredForms !== undefined) {
      const charName = character.name
      const currentForm = previousSnapshot.charactersForms?.[charName] ?? ''

      // If requiredForms is empty array, action can't be cast
      if (action.castConditions.requiredForms.length === 0) {
        isWrongForm = true
      } else if (action.castConditions.requiredForms.length > 0) {
        // Check if current form is in the required forms list
        // If current form is empty string, use default form
        if (!currentForm) {
          const defaultForm = character.forms?.find(f => f.name === character.defaultForm) ?? character.forms?.[0]
          isWrongForm = !action.castConditions.requiredForms.includes(defaultForm?.name ?? '')
        } else {
          isWrongForm = !action.castConditions.requiredForms.includes(currentForm)
        }
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

      // Check if at least one other character will be available after this action
      const hasAvailableSwapTarget = otherCharacters.some(otherCharName => {
        const swapCooldownUntil = previousSnapshot.charactersSwapCooldownUntil?.[otherCharName] ?? 0
        return swapCooldownUntil <= actionEndTime
      })

      isNoSwapTarget = !hasAvailableSwapTarget
    }

    // Goal 8: required follow-up check (combo system)
    // If the previous action set a required follow-up, only allow that specific action.
    let isNotRequiredFollowUp = false
    if (character && previousSnapshot) {
      const requiredFollowUp = previousSnapshot.charactersRequiredFollowUp?.[character.name]
      if (requiredFollowUp && requiredFollowUp !== action.name) {
        isNotRequiredFollowUp = true
      }
    }

    // Goal 9: combo starter validation
    // If this action requires a follow-up, ensure the follow-up will be off cooldown
    // by the time this action completes.
    let isFollowUpNotReady = false
    if (action.requiredFollowUp && character && previousSnapshot) {
      const followUpActionName = action.requiredFollowUp.actionName
      const followUpAction = actions.find(a => a.name === followUpActionName)

      if (followUpAction) {
        const actionEndTime = previousSnapshot.toTime + action.castTime
        const characterCooldowns = previousSnapshot.charactersCooldowns?.[character.name] ?? {}
        const cooldownKey = getActionCooldownKey(followUpAction)
        const followUpCooldownRemaining = characterCooldowns[cooldownKey] ?? 0

        // Check if follow-up will be ready when this action completes
        if (followUpCooldownRemaining > actionEndTime - previousSnapshot.toTime) {
          isFollowUpNotReady = true
        }
      } else {
        // Follow-up action doesn't exist - always block
        isFollowUpNotReady = true
      }
    }

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
      isComboWindowExpired,
    }
  }

  // Filter out intro/outro actions - they're automatically triggered, not user-selectable
  const selectableActions = actions.filter(action => {
    const isIntroOutro = action.dmgTypes.includes('INTRO') || action.dmgTypes.includes('OUTRO')
    return !isIntroOutro
  })

  const actionStates = selectableActions.map(getActionState)
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
    const isSelectable = variants.some(v => !v.isOnCooldown && !v.isUnaffordable && !v.isWrongPosition && !v.isPreviousActionMismatch && !v.isRequiresSwapIn && !v.isWrongForm && !v.isCustomCanCastFailed && !v.isOnSwapCooldown && !v.isNoSwapTarget && !v.isNotRequiredFollowUp && !v.isFollowUpNotReady && !v.isComboWindowExpired)
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
      // Toggle expansion for groups with variants and position the popup
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
            left: dropdownRect.right + 8, // 8px gap
          })
        }
      }
    } else {
      // Direct selection for non-grouped actions
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
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}>
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
                              {/* Show cooldown if all variants have the same cooldown */}
                              {group.variants.every(v => v.isOnCooldown && v.cooldownRemaining === group.variants[0].cooldownRemaining) && `${group.variants[0].cooldownRemaining.toFixed(2)}s`}
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
                      const { action, isCurrent, isUnaffordable, isOnCooldown, cooldownRemaining, missingEnergy, isWrongPosition, isPreviousActionMismatch, isRequiresSwapIn, isWrongForm, isCustomCanCastFailed, isOnSwapCooldown, swapCooldownRemaining, isNoSwapTarget, isNotRequiredFollowUp, isFollowUpNotReady, isComboWindowExpired } = variant

                      const isDisabled = (isUnaffordable || isOnCooldown || isWrongPosition || isPreviousActionMismatch || isRequiresSwapIn || isWrongForm || isCustomCanCastFailed || isOnSwapCooldown || isNoSwapTarget || isNotRequiredFollowUp || isFollowUpNotReady || isComboWindowExpired) && !isCurrent
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
                              {isOnCooldown && <span className="variantCooldown">CD: {cooldownRemaining.toFixed(2)}s</span>}
                              {isOnSwapCooldown && <span className="variantCooldown">Swap CD: {swapCooldownRemaining.toFixed(2)}s</span>}
                              {isComboWindowExpired && <span className="variantBlockedReason">Combo window expired</span>}
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
