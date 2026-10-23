// Active Buffs & Current Stats panel: full live stat table (left) and active self/team buff cards (right)
import { useState, Fragment } from 'react'
import type { Character } from '../../../types/character'
import type { CharacterStats } from '../../../types/stats'
import type { ActiveModifierBreakdown, NamedStatContribution } from '../../../engine/gear/computeStatBreakdown'
import { STAT_GROUPS, formatFinalStat, formatStatKeyLabel } from './statDisplay'
import { buildModInfoMap } from './modifierInfo'
import { SectionHeader } from '../../shared/ui'
import { MUTED, FONT_MONO } from './theme'
import { colorizeText } from './colorizeText'

// ========== Sub-component: ActiveBuffsPanel ==================================================================================

export function ActiveBuffsPanel({ activeBreakdown, finalStats, allCharacters, elColor, onClose }: { activeBreakdown: ActiveModifierBreakdown; finalStats: CharacterStats; allCharacters: Character[]; elColor: string; onClose: () => void }) {
  const selfItems = activeBreakdown.selfBuffs.items
  const teamItems = activeBreakdown.teamBuffs.items
  const [hideZero, setHideZero] = useState(true)

  // TotalMultiplier stats are neutral at 1, everything else at 0
  function isZeroValue(key: string, value: number): boolean {
    return /TotalMultiplier/i.test(key) ? value === 1 : value === 0
  }

  const modInfoMap = buildModInfoMap(allCharacters)

  function renderBuffEntry(item: NamedStatContribution) {
    const info = modInfoMap.get(item.name)
    const displayName = info?.originalName ?? item.name
    const iconPath = `/assets/modifiers/${displayName.toLowerCase().replace(/:/g, '').replace(/\s+/g, '_')}.png`
    const stats = (Object.entries(item.stats) as [string, number][]).filter(([, v]) => v !== 0).map(([k, v]) => ({ label: formatStatKeyLabel(k), value: formatFinalStat(k, v) }))
    const description = info?.description
    return (
      <div key={item.name} className="abp-buff-card" style={{ background: `hsl(${elColor} / 0.05)`, border: `1px solid hsl(${elColor} / 0.14)` }}>
        <div className="abp-buff-header">
          <img
            src={iconPath}
            alt=""
            className="abp-buff-icon"
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="abp-buff-text">
            <span className="abp-buff-name" style={{ color: `hsl(${elColor})` }}>{displayName}</span>
            {description && (
              <p className="abp-buff-desc">
                {colorizeText(description, elColor)}
              </p>
            )}
          </div>
        </div>
        {stats.length > 0 && (
          <div className="abp-buff-stats" style={{ borderTop: `1px solid hsl(${elColor} / 0.1)` }}>
            {stats.map(({ label, value }) => (
              <div key={label} className="abp-buff-stat-row">
                <span className="abp-buff-stat-label">{label}</span>
                <span className="abp-buff-stat-value" style={{ color: `hsl(${elColor} / 0.9)` }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="charStatBreakdown abp" style={{ '--cpo-el-raw': elColor } as React.CSSProperties}>
      <div className="charStatBreakdownHeader">
        <span className="charStatBreakdownTitle">Active Buffs &amp; Current Stats</span>
        <button className="cpo-close-btn" onClick={onClose} aria-label="Close active buffs panel">
          <img src="/assets/ui/close.png" alt="" style={{ width: 'var(--cpo-close-btn-icon-size)', height: 'var(--cpo-close-btn-icon-size)', display: 'block' }} />
        </button>
      </div>
      <div className="abp-body">
        {/* Left: Current Stats */}
        <div className="abp-left" style={{ borderRight: `1px solid hsl(${elColor} / 0.12)` }}>
          <div className="abp-stats-header">
            <span className="ui-section-header-label" style={{ color: `hsl(${elColor} / 0.6)`, letterSpacing: '0.2em' }}>CURRENT STATS</span>
            <button
              className="abp-toggle-btn"
              onClick={() => setHideZero(p => !p)}
              style={{
                background: hideZero ? `hsl(${elColor} / 0.15)` : 'transparent',
                border: `1px solid hsl(${elColor} / ${hideZero ? 0.4 : 0.18})`,
                color: hideZero ? `hsl(${elColor})` : 'rgba(140, 155, 190, 0.55)',
              }}>
              Hide Zeros
            </button>
          </div>
          {STAT_GROUPS.map(group => {
            const visibleKeys = hideZero
              ? group.keys.filter(key => !isZeroValue(key, finalStats[key] as number))
              : group.keys
            if (visibleKeys.length === 0) return null
            return (
              <div key={group.label} className="abp-group">
                <div className="abp-group-label" style={{ color: `hsl(${elColor} / 0.55)`, borderBottom: `1px solid hsl(${elColor} / 0.15)` }}>
                  {group.label}
                </div>
                <div className="abp-grid">
                  {visibleKeys.map((key, i) => {
                    const value = finalStats[key] as number
                    // Two stats per grid row; isOdd is true for the FIRST (left) cell despite the name
                    const isOdd = i % 2 === 0
                    const isLastAlone = i === visibleKeys.length - 1 && visibleKeys.length % 2 !== 0
                    if (isLastAlone) {
                      return (
                        <div key={key} className="abp-stat-row--lone">
                          <span className="abp-stat-label">{formatStatKeyLabel(key)}</span>
                          <span className="abp-stat-value" style={{ color: `hsl(${elColor} / 0.9)` }}>{formatFinalStat(key, value)}</span>
                        </div>
                      )
                    }
                    return (
                      <Fragment key={key}>
                        <span className={`abp-stat-label${isOdd ? '' : ' abp-stat-label--right'}`}>{formatStatKeyLabel(key)}</span>
                        <span className={`abp-stat-value${isOdd ? ' abp-stat-value--left' : ''}`} style={{ color: `hsl(${elColor} / 0.9)` }}>{formatFinalStat(key, value)}</span>
                      </Fragment>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Active Buffs */}
        <div className="abp-right">
          <div>
            <SectionHeader label="Self Buffs" />
            {selfItems.length === 0 ? (
              <div style={{ color: MUTED, fontSize: '0.78rem', fontFamily: FONT_MONO, padding: '4px 0' }}>None</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{selfItems.map(item => renderBuffEntry(item))}</div>
            )}
          </div>
          <div>
            <SectionHeader label="Team Buffs" />
            {teamItems.length === 0 ? (
              <div style={{ color: MUTED, fontSize: '0.78rem', fontFamily: FONT_MONO, padding: '4px 0' }}>None</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{teamItems.map(item => renderBuffEntry(item))}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
