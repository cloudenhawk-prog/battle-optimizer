// Action dropdown for a rotation row: portaled table of castable/blocked actions plus a variant side-popup.
import '../../../styles/rotation-editor/ActionSelect.css'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Action } from '../../../types/action'
import type { Character } from '../../../types/character'
import type { Snapshot } from '../../../types/snapshot'
import type { EnergyType } from '../../../types/baseTypes'
import { getActionState, isActionBlocked } from './actionAvailability'
import { buildActionGroups, groupByCategory, type ActionGroup } from './actionGroups'
import { ActionGroupRow } from './ActionGroupRow'
import { VariantList } from './VariantList'

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

export function ActionSelect({ value, actions, character, currentEnergies, previousSnapshot, onChange, disabled = false, sandboxMode = false }: ActionSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [variantPopupPosition, setVariantPopupPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const variantPopupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const groupRowRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false, bottomPos: 0 })

  // Close dropdown when clicking outside (button, dropdown and variant popup count as inside)
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

  // Position the portaled dropdown under the button, or above it when there is < 300px below
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

  // ---------- Derived dropdown content ----------

  // Filter out intro/outro actions - they're automatically triggered, not user-selectable
  const selectableActions = actions.filter(action => {
    const isIntroOutro = action.tags?.includes('INTRO_ACTION') || action.tags?.includes('OUTRO_ACTION')
    return !isIntroOutro
  })

  const availabilityCtx = { value, actions, character, currentEnergies, previousSnapshot, sandboxMode }
  // Wrong-form actions are hidden entirely; hideWhenNotCastable actions only while blocked (current one always shows)
  const actionStates = selectableActions.map(action => getActionState(action, availabilityCtx))
    .filter(s => !s.isWrongForm || s.isCurrent)
    .filter(s => {
      if (!s.action.hideWhenNotCastable || s.isCurrent) return true
      const isNotCastable = isActionBlocked(s)
      return !isNotCastable
    })
  const selectedAction = actionStates.find(s => s.isCurrent)
  const displayText = selectedAction ? selectedAction.action.name : '-- Select Action --'

  const actionGroups = buildActionGroups(actionStates)
  const groupsByCategory = groupByCategory(actionGroups)

  // ---------- Handlers ----------

  const handleSelect = (actionName: string) => {
    onChange(actionName)
    setIsOpen(false)
    setExpandedGroup(null)
  }

  // Ref callback target: remembers each group row's element (used to anchor the variant popup)
  const registerGroupRow = (groupKey: string, el: HTMLDivElement) => {
    groupRowRefs.current.set(groupKey, el)
  }

  // Groups toggle the variant popup (anchored right of the dropdown, level with the row); single actions select
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

  // ---------- Render ----------

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
                    {groups.map(group => (
                      <ActionGroupRow key={group.groupKey} group={group} isExpanded={expandedGroup === group.groupKey} registerRow={registerGroupRow} onGroupClick={handleGroupClick} />
                    ))}
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
              <VariantList group={actionGroups.find(g => g.groupKey === expandedGroup)} onSelect={handleSelect} />
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
