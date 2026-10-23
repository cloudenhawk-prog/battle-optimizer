// Stat breakdown modal: per-source contribution tables for one stat (scaling stats show % and flat parts)
import { Fragment } from 'react'
import type { CharacterStats } from '../../../types/stats'
import type { ActiveModifierBreakdown, GearStatBreakdown } from '../../../engine/gear/computeStatBreakdown'
import { formatFlat, formatStatValue, type StatDisplay } from './statDisplay'
import { getBreakdownData, type BreakdownGroup } from './statBreakdown'

// ========== Sub-component: Breakdown Modal ===================================================================================

type BreakdownModalProps = {
  statDisplay: StatDisplay
  finalStats: CharacterStats
  gearBreakdown: GearStatBreakdown
  activeBreakdown: ActiveModifierBreakdown
  baseStat: CharacterStats
  onClose: () => void
}

export function BreakdownModal({ statDisplay, finalStats, gearBreakdown, activeBreakdown, baseStat, onClose }: BreakdownModalProps) {
  const data = getBreakdownData(statDisplay.key, statDisplay.label, statDisplay.format, finalStats, gearBreakdown, activeBreakdown, baseStat)

  // formatEquiv (optional) adds a parenthesised equivalent, e.g. the flat ATK a bonusATK% amounts to
  function renderGroupsTable(groups: BreakdownGroup[], formatValue: (v: number) => string, formatEquiv?: (v: number) => string) {
    const overallTotal = groups.reduce((sum, g) => sum + g.total, 0)

    return (
      <table className="charStatBreakdownTable">
        <tbody>
          {groups.map((group, groupIndex) => {
            const visibleItems = group.items.filter(i => i.value !== 0)
            return (
              <Fragment key={group.key}>
                <tr className={`charStatBreakdownGroupRow${groupIndex > 0 ? ' charStatBreakdownGroupRow--separator' : ''}`}>
                  <td className="charStatBreakdownSource">{group.groupName}</td>
                  <td className="charStatBreakdownValue">
                    {formatEquiv && <span className="charStatBreakdownEquiv">({formatEquiv(group.total)})</span>}
                    {formatValue(group.total)}
                  </td>
                </tr>
                {visibleItems.map(item => (
                  <tr key={item.name} className="charStatBreakdownItemRow">
                    <td className="charStatBreakdownSource">{item.name}</td>
                    <td className="charStatBreakdownValue">
                      {formatEquiv && <span className="charStatBreakdownEquiv">({formatEquiv(item.value)})</span>}
                      {formatValue(item.value)}
                    </td>
                  </tr>
                ))}
              </Fragment>
            )
          })}
          <tr className="charStatBreakdownRow charStatBreakdownRow--total">
            <td className="charStatBreakdownSource">Total</td>
            <td className="charStatBreakdownValue">
              {formatEquiv && <span className="charStatBreakdownEquiv">({formatEquiv(overallTotal)})</span>}
              {formatValue(overallTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <div className="charStatBreakdown" role="dialog" aria-modal="true">
      <div className="charStatBreakdownHeader">
        <span className="charStatBreakdownTitle">{statDisplay.label}</span>
        <button className="overlayCloseButton" onClick={onClose} aria-label="Close breakdown">
          ✕
        </button>
      </div>

      <div className="charStatBreakdownBody">
        {data.variant === 'scaling' && (
          <>
            <div className="charStatBreakdownTotal">
              Total {statDisplay.label}: {formatFlat(data.finalValue)}
            </div>
            <div className="charStatBreakdownTotal">
              Base {statDisplay.label}: {formatFlat(data.baseValue)}
            </div>

            <div className="charStatBreakdownSection">
              <div className="charStatBreakdownSectionTitle">{statDisplay.label}%</div>
              {renderGroupsTable(
                data.percentGroups,
                v => `${(v * 100).toFixed(1)}%`,
                v => formatFlat(data.baseValue * v),
              )}
            </div>

            <div className="charStatBreakdownSection">
              <div className="charStatBreakdownSectionTitle">{statDisplay.label} Flat</div>
              {renderGroupsTable(data.flatGroups, v => formatFlat(v))}
            </div>
          </>
        )}

        {data.variant === 'additive' && (
          <>
            <div className="charStatBreakdownTotal">
              Total {statDisplay.label}: {formatStatValue(data.key, data.finalValue, data.format)}
            </div>
            <div className="charStatBreakdownSection">{renderGroupsTable(data.groups, v => formatStatValue(data.key, v, data.format))}</div>
          </>
        )}
      </div>
    </div>
  )
}
