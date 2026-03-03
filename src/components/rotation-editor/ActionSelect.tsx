import '../../styles/rotation-editor/ActionSelect.css'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Action } from '../../types/action'
import type { Character } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import type { EnergyType } from '../../types/baseTypes'

// ========== Component: Action Select =========================================================================================

type ActionSelectProps = {
  value: string
  actions: Action[]
  character?: Character
  currentEnergies?: Partial<Record<EnergyType, number>>
  snapshot?: Snapshot
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
}

export function ActionSelect({ value, actions, character, currentEnergies, snapshot, onChange, disabled = false }: ActionSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('🖱️ Click detected, checking if outside dropdown')
      const clickedButton = buttonRef.current && buttonRef.current.contains(event.target as Node)
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(event.target as Node)

      if (!clickedButton && !clickedDropdown) {
        console.log('✅ Click was outside, closing dropdown')
        setIsOpen(false)
      } else {
        console.log('❌ Click was inside dropdown or button, keeping it open')
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
    if (character && snapshot && snapshot.charactersCooldowns) {
      const characterCooldowns = snapshot.charactersCooldowns[character.name] ?? {}
      cooldownRemaining = characterCooldowns[action.name] ?? 0
    }

    const isOnCooldown = cooldownRemaining > 0

    return {
      action,
      isSpecial,
      isCurrent,
      isUnaffordable,
      isOnCooldown,
      cooldownRemaining,
      missingEnergy,
    }
  }

  const actionStates = actions.map(getActionState)
  const selectedAction = actionStates.find(s => s.isCurrent)
  const displayText = selectedAction ? selectedAction.action.name : '-- Select Action --'

  console.log('🔧 ActionSelect render:', {
    value,
    actionsCount: actions.length,
    disabled,
    actionStates: actionStates.map(s => ({
      name: s.action.name,
      isCurrent: s.isCurrent,
      isUnaffordable: s.isUnaffordable,
      isOnCooldown: s.isOnCooldown,
      isSpecial: s.isSpecial,
    })),
  })

  const handleSelect = (actionName: string) => {
    console.log('🎯 ActionSelect - handleSelect called:', actionName)
    onChange(actionName)
    setIsOpen(false)
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
              minWidth: `${Math.max(dropdownPosition.width, 300)}px`,
            }}>
            <div className="actionSelectTable">
              {/* Header */}
              <div className="actionSelectHeader">
                <div className="actionSelectCell actionNameCell">Action</div>
                <div className="actionSelectCell actionCooldownCell">Cooldown</div>
                <div className="actionSelectCell actionEnergyCell">Energy</div>
              </div>

              {/* Rows */}
              {actionStates.length === 0 ? (
                <div className="actionSelectRow">
                  <div className="actionSelectCell" style={{ gridColumn: '1 / -1', justifyContent: 'center' }}>
                    No actions available
                  </div>
                </div>
              ) : (
                actionStates.map(state => {
                  const { action, isSpecial, isCurrent, isUnaffordable, isOnCooldown, cooldownRemaining, missingEnergy } = state

                  // Hide special actions unless they're currently selected
                  if (isSpecial && !isCurrent) return null

                  const isDisabled = (isUnaffordable || isOnCooldown) && !isCurrent
                  const canSelect = !isDisabled

                  return (
                    <div
                      key={action.name}
                      className={`actionSelectRow ${isDisabled ? 'disabled' : ''} ${isCurrent ? 'selected' : ''} ${canSelect ? 'selectable' : ''}`}
                      onClick={() => {
                        console.log('🖱️ Action row clicked:', {
                          actionName: action.name,
                          canSelect,
                          isDisabled,
                          isUnaffordable,
                          isOnCooldown,
                          isCurrent,
                        })
                        if (canSelect) {
                          handleSelect(action.name)
                        } else {
                          console.log('⚠️ Action not selectable!')
                        }
                      }}>
                      <div className="actionSelectCell actionNameCell">{action.name}</div>
                      <div className="actionSelectCell actionCooldownCell">{isOnCooldown ? `${cooldownRemaining.toFixed(1)}s` : ''}</div>
                      <div className="actionSelectCell actionEnergyCell">{missingEnergy.length > 0 ? <span className="energyMissing">{missingEnergy.map(e => `${e.current}/${e.needed} ${e.type}`).join(', ')}</span> : action.energyCost.length > 0 ? <span className="energyOk">✓</span> : ''}</div>
                    </div>
                  )
                })
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
