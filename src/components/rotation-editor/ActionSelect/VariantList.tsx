// Contents of the variant popup: header + one row per variant with its blocking reasons.
import type { ActionGroup } from './actionGroups'
import { formatMissingEnergy } from './actionGroups'
import { isActionBlocked } from './actionAvailability'

// ========== Component: Variant List ==========================================================================================

type VariantListProps = {
  group: ActionGroup | undefined
  onSelect: (actionName: string) => void
}

export function VariantList({ group, onSelect }: VariantListProps) {
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
        const { action, isCurrent, isOnCooldown, cooldownRemaining, stacksInfo, missingEnergy, isOnSwapCooldown, swapCooldownRemaining, isComboWindowExpired, isComboTagMismatch } = variant

        // The current selection always stays selectable, even if it is no longer castable
        const isDisabled = isActionBlocked(variant) && !isCurrent
        const canSelect = !isDisabled

        return (
          <div
            key={action.name}
            className={`actionSelectVariantRow ${isDisabled ? 'disabled' : ''} ${isCurrent ? 'selected' : ''} ${canSelect ? 'selectable' : ''}`}
            onClick={e => {
              e.stopPropagation()
              if (canSelect) {
                onSelect(action.name)
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
                {missingEnergy.length > 0 ? <span className="energyMissing">{formatMissingEnergy(missingEnergy)}</span> : action.energyCost.length > 0 ? <span className="energyOk">✓</span> : null}
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
