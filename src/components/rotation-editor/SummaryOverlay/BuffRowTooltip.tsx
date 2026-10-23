// Fixed-position hover tooltip for a buff coverage row, portalled to <body> so panel overflow can't clip it
import { createPortal } from 'react-dom'
import type { BuffUptimeEntry, ModifierDisplayInfo } from './summaryTypes'
import { getElementColor } from './theme'
import type { CharColor } from './theme'
import { buffIconPath, formatDamage, formatTime } from './format'
import { accentVar } from '../../shared/ui'

// DamageModifier.targetStrategy → readable label
const STRATEGY_LABELS: Record<string, string> = {
  self: 'Self',
  active: 'Active Character',
  all: 'All Resonators',
  nextSwap: 'Swap In Character',
  activeAlly: 'Active Ally',
}

export function renderBuffRowTooltip(
  entry: BuffUptimeEntry,
  rect: DOMRect,
  modifierInfoMap: Map<string, ModifierDisplayInfo>,
  charColorMap: Map<string, CharColor>,
) {
  const ownerTheme = (entry.ownerCharacter ? charColorMap.get(entry.ownerCharacter) : null) ?? getElementColor(entry.ownerElement)
  const iconPath = buffIconPath(entry.displayName)
  const info = modifierInfoMap.get(entry.displayName)

  // Open upward when the row is in the bottom 40% of the viewport to stay visible
  const openUpward = rect.bottom > window.innerHeight * 0.6
  const posStyle: React.CSSProperties = openUpward
    ? { bottom: `${window.innerHeight - rect.top + 6}px`, top: 'auto' }
    : { top: `${rect.bottom + 6}px`, bottom: 'auto' }

  return createPortal(
    <div className="ui-tooltip" style={{ position: 'fixed', right: `${window.innerWidth - rect.right}px`, zIndex: 9999, ...accentVar(ownerTheme.raw), ...posStyle }}>
      <div className="summaryBuffRowTooltipHeader">
        <img key={entry.key} src={iconPath} alt="" className="summaryBuffRowTooltipIcon" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
        <span className="ui-tooltip-title">{entry.displayName}</span>
      </div>
      <div className="summaryBuffRowTooltipCoverage">
        {entry.ownerCharacter && (
          <div className="summaryBuffRowTooltipStat">
            <span className="summaryBuffRowTooltipStatKey">Source</span>
            <span className="summaryBuffRowTooltipStatVal">{entry.ownerCharacter}</span>
          </div>
        )}
        {info?.targetStrategy && (
          <div className="summaryBuffRowTooltipStat">
            <span className="summaryBuffRowTooltipStatKey">Targets</span>
            <span className="summaryBuffRowTooltipStatVal">{STRATEGY_LABELS[info.targetStrategy] ?? info.targetStrategy}</span>
          </div>
        )}
        <div className="summaryBuffRowTooltipStat">
          <span className="summaryBuffRowTooltipStatKey">Damage covered</span>
          <span className="summaryBuffRowTooltipStatVal">{formatDamage(entry.coveredDamage)}</span>
        </div>
        <div className="summaryBuffRowTooltipStat">
          <span className="summaryBuffRowTooltipStatKey">First applied</span>
          <span className="summaryBuffRowTooltipStatVal">{formatTime(entry.firstAppliedAt)}</span>
        </div>
      </div>
      <div className="summaryBuffRowTooltipDivider" />
      <div className="summaryBuffRowTooltipStats">
        <div className="summaryBuffRowTooltipStat">
          <span className="summaryBuffRowTooltipStatKey">Coverage</span>
          <span className="summaryBuffRowTooltipStatVal">{entry.coveragePct.toFixed(1)}%</span>
        </div>
        <div className="summaryBuffRowTooltipStat">
          <span className="summaryBuffRowTooltipStatKey">Uptime</span>
          <span className="summaryBuffRowTooltipStatVal">{entry.timeUptimePct.toFixed(1)}%</span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
