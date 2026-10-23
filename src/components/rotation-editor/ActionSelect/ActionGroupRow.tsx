// One row of the action dropdown: a standalone action or a collapsible group of variants.
import type { ActionGroup } from './actionGroups'
import { formatMissingEnergy, formatStacks } from './actionGroups'

// ========== Component: Action Group Row ======================================================================================

type ActionGroupRowProps = {
  group: ActionGroup
  isExpanded: boolean
  /** Called with the row element on every commit so the parent can position the variant popup. */
  registerRow: (groupKey: string, el: HTMLDivElement) => void
  onGroupClick: (groupKey: string, group: ActionGroup) => void
}

export function ActionGroupRow({ group, isExpanded, registerRow, onGroupClick }: ActionGroupRowProps) {
  const hasMultipleVariants = group.variants.length > 1

  // Hide groups containing a non-current special (intro/outro) variant
  const hasSpecialNotCurrent = group.variants.some(v => v.isSpecial && !v.isCurrent)
  if (hasSpecialNotCurrent && !group.isCurrent) return null

  // Multi-variant groups stay clickable even when disabled so the user can inspect why each variant is blocked
  const groupIsDisabled = !group.isSelectable && !group.isCurrent
  const groupCanSelect = !groupIsDisabled || hasMultipleVariants

  return (
    <div>
      {/* Group Row */}
      <div
        ref={el => {
          if (el) registerRow(group.groupKey, el)
        }}
        className={`actionSelectRow ${groupIsDisabled ? 'disabled' : ''} ${group.isCurrent ? 'selected' : ''} ${groupCanSelect ? 'selectable' : ''} ${isExpanded ? 'expanded' : ''}`}
        onClick={() => {
          if (groupCanSelect) {
            onGroupClick(group.groupKey, group)
          }
        }}>
        <div className="actionSelectCell actionNameCell">
          {group.displayName}
          {hasMultipleVariants && <span style={{ marginLeft: '8px', opacity: 0.6 }}>{isExpanded ? '▼' : '▶'}</span>}
        </div>
        <div className="actionSelectCell actionCooldownCell">{groupCooldownText(group)}</div>
        <div className="actionSelectCell actionEnergyCell">
          {/* Show energy status for the group */}
          {groupEnergyStatus(group)}
        </div>
      </div>
    </div>
  )
}

// ========== Helper Functions =================================================================================================

/** Stack counter of the first variant, or a shared cooldown when every variant waits the same time. */
function groupCooldownText(group: ActionGroup): string | null {
  const rep = group.variants[0]
  if (rep.stacksInfo) {
    return formatStacks(rep.stacksInfo)
  }
  if (group.variants.every(v => v.isOnCooldown && v.cooldownRemaining === rep.cooldownRemaining)) {
    return `${rep.cooldownRemaining.toFixed(2)}s`
  }
  return null
}

/** Energy shortfall of the most relevant variant (current, else first short one, else first), or a ✓. */
function groupEnergyStatus(group: ActionGroup) {
  const representative = group.variants.find(v => v.isCurrent) ?? group.variants.find(v => v.missingEnergy.length > 0) ?? group.variants[0]
  if (representative.missingEnergy.length > 0) {
    return <span className="energyMissing">{formatMissingEnergy(representative.missingEnergy)}</span>
  }
  return representative.action.energyCost.length > 0 ? <span className="energyOk">✓</span> : ''
}
