import { useState } from 'react'
import '../../styles/rotation-editor/DataOverlay.css'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent, Contribution } from '../../types/events'

// ========== Main Component =====================================================================================================

type DataOverlayProps = {
  snapshot: Snapshot | null
  damageEvents?: DamageEvent[]
  open: boolean
  onClose: () => void
}

export default function DataOverlay({ snapshot, damageEvents = [], open, onClose }: DataOverlayProps) {
  const [mode, setMode] = useState<'average' | 'normal' | 'crit'>('average')
  const [pieChartView, setPieChartView] = useState<'events' | 'types'>('events')

  if (!open || !snapshot) return null

  console.log('Damage Events: ', damageEvents)

  const { mainAction, otherDamage } = categorizeDamageEvents(damageEvents)
  const totalDamage = calculateTotalDamage(damageEvents)
  const duration = calculateDuration(snapshot)

  return (
    <div className="dataOverlay" role="dialog" aria-modal="true">
      <div className="dataOverlayContent">
        <OverlayHeader onClose={onClose} />
        <div className="dataOverlayBody">
          <HudOverlay mode={mode} onModeChange={setMode} />

          {/* Central Pie Chart */}
          <PieChartCenter damageEvents={damageEvents} totalDamage={totalDamage} view={pieChartView} onViewChange={setPieChartView} />

          {/* Radial Sections */}
          <CombatOverviewSection totalDamage={totalDamage} duration={duration} snapshot={snapshot} />
          <MainActionSection mainAction={mainAction} totalDamage={totalDamage} />
          <SideEffectsSection otherDamage={otherDamage} totalDamage={totalDamage} />
          <ContributionsSection contributions={mainAction?.contributions || {}} mode={mode} />
        </div>
      </div>
    </div>
  )
}

// ========== Components =========================================================================================================

function OverlayHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="dataOverlayHeader">
      <h2 className="overlayTitle">RESONANCE FIELD ANALYSIS</h2>
      <button className="overlayCloseButton" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}
function HudOverlay({ mode, onModeChange }: { mode: 'average' | 'normal' | 'crit'; onModeChange: (mode: 'average' | 'normal' | 'crit') => void }) {
  return (
    <>
      {/* Scanning line */}
      <div className="hudScanLine" />

      {/* Corner brackets */}
      <div className="hudCorner topLeft" />
      <div className="hudCorner topRight" />
      <div className="hudCorner bottomLeft" />
      <div className="hudCorner bottomRight" />

      {/* Top bar */}
      <div className="hudTopBar">
        <div className="hudTopLeft">
          {/* Mode Selector */}
          <div className="modeSelectorContainer">
            <button className={`modeButton ${mode === 'average' ? 'active' : ''}`} onClick={() => onModeChange('average')}>
              Average
            </button>
            <button className={`modeButton ${mode === 'normal' ? 'active' : ''}`} onClick={() => onModeChange('normal')}>
              Normal
            </button>
            <button className={`modeButton ${mode === 'crit' ? 'active' : ''}`} onClick={() => onModeChange('crit')}>
              Critical
            </button>
          </div>
        </div>
        <div className="hudTopRight">
          <div className="liveIndicator">LIVE FEED</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="hudBottomBar">
        <div className="hudBottomLeft">
          <div>LINK: ESTABLISHED</div>
          <div>PHASE DRIFT: 0.02°</div>
        </div>
        <div className="hudBottomCenter">
          <div>SYNC INDEX: 0.998</div>
          <div>ECHO SIGNATURE: LOCKED</div>
        </div>
        <div className="hudBottomRight">
          TETHER <span className="separator">//</span> v3.2.17
        </div>
      </div>
    </>
  )
}

function PieChartCenter({ damageEvents, totalDamage, view, onViewChange }: { damageEvents: DamageEvent[]; totalDamage: number; view: 'events' | 'types'; onViewChange: (view: 'events' | 'types') => void }) {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null)

  if (damageEvents.length === 0) return null

  // Aggregate damage by type if in 'types' view
  const displayData = view === 'types' ? aggregateDamageByType(damageEvents) : damageEvents.map(e => ({ name: e.actionName, damage: e.average, event: e }))

  // Subtle colors matching the table theme
  const colors = ['rgba(100, 150, 255, 0.7)', 'rgba(255, 150, 100, 0.7)', 'rgba(200, 150, 255, 0.7)']

  // Format total damage for display
  const formattedDamage = totalDamage >= 1000 ? `${(totalDamage / 1000).toFixed(1)}k` : totalDamage.toFixed(0)

  const hoveredData = hoveredSlice !== null ? displayData[hoveredSlice] : null

  return (
    <div className="pieChartCenter">
      {/* Outer rotating rings */}
      <div className="pieOuterRing" />
      <div className="pieOuterRingDashed" />

      {/* Outer notches rotating counter-clockwise */}
      <div className="pieOuterNotchContainer">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="pieOuterNotch"
            style={{
              transform: `rotate(${i * 15}deg) translateY(-${185}px)`,
              height: i % 2 === 0 ? '10px' : '6px',
              marginLeft: '-1px',
              marginTop: i % 2 === 0 ? '-5px' : '-3px',
              backgroundColor: i % 2 === 0 ? `rgba(100, 200, 255, ${0.25})` : `rgba(100, 150, 255, ${0.12})`,
              boxShadow: i % 2 === 0 ? '0 0 4px rgba(100, 200, 255, 0.3)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Pie chart SVG */}
      {displayData.length === 1 ? (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ pointerEvents: 'auto' }}>
          <circle cx="100" cy="100" r="90" fill={colors[0]} stroke="rgba(30, 30, 40, 0.95)" strokeWidth="2" className="pieSlice" onMouseEnter={() => setHoveredSlice(0)} onMouseLeave={() => setHoveredSlice(null)} />
        </svg>
      ) : (
        <svg viewBox="0 0 200 200" className="pieChartSvg" style={{ pointerEvents: 'auto' }}>
          {calculatePieSlices(
            displayData.map(d => d.damage),
            colors,
          ).map((slice, index) => (
            <path key={index} d={slice.path} fill={slice.color} stroke="rgba(30, 30, 40, 0.95)" strokeWidth="2" className={`pieSlice ${hoveredSlice === index ? 'hovered' : ''}`} onMouseEnter={() => setHoveredSlice(index)} onMouseLeave={() => setHoveredSlice(null)} />
          ))}
        </svg>
      )}

      {/* Inner circle with total damage */}
      <div className="pieInnerCircle">
        <div className="pieLabel" style={{ pointerEvents: 'none' }}>
          Total Damage
        </div>
        <div className="piePercentage" style={{ pointerEvents: 'none' }}>
          {formattedDamage}
        </div>
        <div className="pieViewToggle">
          <button className={`pieViewButton ${view === 'events' ? 'active' : ''}`} onClick={() => onViewChange('events')}>
            Events
          </button>
          <button className={`pieViewButton ${view === 'types' ? 'active' : ''}`} onClick={() => onViewChange('types')}>
            Types
          </button>
        </div>
      </div>

      {/* Tick marks */}
      <div className="pieTickContainer">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="pieTick"
            style={{
              transform: `rotate(${i * 10}deg) translateY(-${155}px)`,
              height: i % 3 === 0 ? '6px' : '3px',
              marginLeft: '-0.5px',
              marginTop: i % 3 === 0 ? '-3px' : '-1.5px',
              backgroundColor: `rgba(255, 255, 255, ${i % 3 === 0 ? 0.15 : 0.06})`,
            }}
          />
        ))}
      </div>

      {/* Hover tooltip */}
      {hoveredData && (
        <div className="pieTooltip">
          <div className="pieTooltipAccent" />
          <div className="pieTooltipTitle">{hoveredData.name}</div>
          <div className="pieTooltipDivider" />
          {view === 'events' && hoveredData.event && (
            <>
              <div className="pieTooltipRow">
                <span className="pieTooltipLabel">Dealer</span>
                <span className="pieTooltipValue">{hoveredData.event.dealer}</span>
              </div>
              <div className="pieTooltipRow">
                <span className="pieTooltipLabel">Target</span>
                <span className="pieTooltipValue">{hoveredData.event.target}</span>
              </div>
            </>
          )}
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Damage</span>
            <span className="pieTooltipValue pieTooltipHighlight">{hoveredData.damage.toFixed(0)}</span>
          </div>
          <div className="pieTooltipRow">
            <span className="pieTooltipLabel">Share</span>
            <span className="pieTooltipValue pieTooltipHighlight">{((hoveredData.damage / totalDamage) * 100).toFixed(1)}%</span>
          </div>
          {view === 'events' && hoveredData.event && hoveredData.event.elements.length > 0 && (
            <div className="pieTooltipRow">
              <span className="pieTooltipLabel">Elements</span>
              <span className="pieTooltipValue">{hoveredData.event.elements.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CombatOverviewSection({ totalDamage, duration, snapshot }: { totalDamage: number; duration: number; snapshot: Snapshot }) {
  const dps = duration > 0 ? totalDamage / duration : 0
  const castTime = `${snapshot.fromTime.toFixed(2)}s - ${snapshot.toTime.toFixed(2)}s`

  return (
    <div className="radialSection combatOverview">
      <div className="connectorLine" />
      <div className="sectionCard purple">
        <div className="sectionTopAccent purple" />
        <div className="sectionTitle purple">
          <div className="titleDot purple" />
          <span>Combat Metrics</span>
        </div>
        <div className="sectionContent">
          <DataRow label="Total Damage" value={totalDamage.toFixed(0)} />
          <DataRow label="DPS" value={dps > 0 ? dps.toFixed(1) : 'N/A'} />
          <DataRow label="Duration" value={`${duration.toFixed(2)}s`} />
          <DataRow label="Cast Window" value={castTime} />
        </div>
        <div className="sectionBottomAccent purple" />
      </div>
    </div>
  )
}

function MainActionSection({ mainAction, totalDamage }: { mainAction: DamageEvent | null; totalDamage: number }) {
  if (!mainAction) {
    return (
      <div className="radialSection mainAction">
        <div className="connectorLine" />
        <div className="sectionCard cyan">
          <div className="sectionTopAccent cyan" />
          <div className="sectionTitle cyan">
            <div className="titleDot cyan" />
            <span>Primary Output</span>
          </div>
          <div className="sectionContent">
            <p className="emptyMessage">No primary resonance detected</p>
          </div>
          <div className="sectionBottomAccent cyan" />
        </div>
      </div>
    )
  }

  // Calculate percentages for bars
  const avgDamageBarPct = totalDamage > 0 ? (mainAction.average / totalDamage) * 100 : 0
  const normalHitBarPct = mainAction.average > 0 ? (mainAction.normalStrike / mainAction.average) * 100 : 0
  const critHitRatio = mainAction.average > 0 ? (mainAction.criticalStrike / mainAction.average) * 100 : 100
  const critExcessPct = Math.max(0, critHitRatio - 100)

  return (
    <div className="radialSection mainAction">
      <div className="connectorLine" />
      <div className="sectionCard cyan">
        <div className="sectionTopAccent cyan" />
        <div className="sectionTitle cyan">
          <div className="titleDot cyan" />
          <span>Primary Damage Output</span>
        </div>
        <div className="sectionContent">
          <DataRow label="Resonator" value={mainAction.dealer} />
          <DataRow label="Combat Event" value={mainAction.actionName} />
          <DataRow label="Target" value={mainAction.target} />
          <DataRow label="Avg Damage" value={mainAction.average.toFixed(0)} barPct={avgDamageBarPct} color="cyan" />
          <DataRow label="Normal Hit" value={mainAction.normalStrike.toFixed(0)} barPct={normalHitBarPct} color="cyan" />
          <DataRow label="Critical Hit" value={mainAction.criticalStrike.toFixed(0)} barPct={100} barExcessPct={critExcessPct} color="cyan" />
          <DataRow label="Elements" value={mainAction.elements.join(', ')} />
        </div>
        <div className="sectionBottomAccent cyan" />
      </div>
    </div>
  )
}

function SideEffectsSection({ otherDamage, totalDamage }: { otherDamage: DamageEvent[]; totalDamage: number }) {
  if (otherDamage.length === 0) {
    return (
      <div className="radialSection sideEffects">
        <div className="connectorLine" />
        <div className="sectionCard amber">
          <div className="sectionTopAccent amber" />
          <div className="sectionTitle amber">
            <div className="titleDot amber" />
            <span>Secondary Effects</span>
          </div>
          <div className="sectionContent">
            <p className="emptyMessage">No echo signatures detected</p>
          </div>
          <div className="sectionBottomAccent amber" />
        </div>
      </div>
    )
  }

  return (
    <div className="radialSection sideEffects">
      <div className="connectorLine" />
      <div className="sectionCard amber">
        <div className="sectionTopAccent amber" />
        <div className="sectionTitle amber">
          <div className="titleDot amber" />
          <span>Secondary Effects</span>
        </div>
        <div className="sectionContent">
          {otherDamage.slice(0, 5).map((event, index) => {
            const pct = totalDamage > 0 ? (event.average / totalDamage) * 100 : 0
            return <DataRow key={index} label={event.actionName} value={`${event.average.toFixed(0)} (${pct.toFixed(2)}%)`} barPct={pct} color="amber" />
          })}
        </div>
        <div className="sectionBottomAccent amber" />
      </div>
    </div>
  )
}

function ContributionsSection({ contributions, mode }: { contributions: Record<string, Contribution>; mode: 'average' | 'normal' | 'crit' }) {
  const contributionsList = Object.values(contributions)

  // Sort by contribution amount (descending) based on current mode
  contributionsList.sort((a, b) => {
    const aValue = mode === 'average' ? a.average_damage_contributed : mode === 'normal' ? a.normal_damage_contributed : a.crit_damage_contributed
    const bValue = mode === 'average' ? b.average_damage_contributed : mode === 'normal' ? b.normal_damage_contributed : b.crit_damage_contributed
    return bValue - aValue
  })

  // Find max value for scaling
  const maxValue = contributionsList.reduce((max, contrib) => {
    const value = mode === 'average' ? contrib.average_damage_contributed : mode === 'normal' ? contrib.normal_damage_contributed : contrib.crit_damage_contributed
    return Math.max(max, value)
  }, 0)

  return (
    <div className="radialSection contributions">
      <div className="connectorLine" />
      <div className="sectionCard magenta">
        <div className="sectionTopAccent magenta" />
        <div className="sectionTitle magenta">
          <div className="titleDot magenta" />
          <span>Modifier Contributions</span>
        </div>

        <div className="sectionContent">
          {contributionsList.length === 0 ? (
            <p className="emptyMessage">No modifier contributions detected</p>
          ) : (
            <div className="pillarGraphContainer">
              {contributionsList.map((contrib, index) => {
                const damageValue = mode === 'average' ? contrib.average_damage_contributed : mode === 'normal' ? contrib.normal_damage_contributed : contrib.crit_damage_contributed
                const percentValue = mode === 'average' ? contrib.average_percent_damage_contributed : mode === 'normal' ? contrib.normal_percent_damage_contributed : contrib.crit_percent_damage_contributed

                // Scale height with a minimum of 15% for visibility
                const rawHeightPercent = maxValue > 0 ? (damageValue / maxValue) * 100 : 0
                const heightPercent = Math.max(15, rawHeightPercent)

                return (
                  <div key={index} className="pillarWrapper">
                    <div className="pillarBar">
                      <div className="pillarFill magenta" style={{ height: `${heightPercent}%` }}>
                        <div className="pillarGlow" />
                      </div>
                    </div>
                    <div className="pillarLabel">
                      <div className="pillarSource">{contrib.displayName || contrib.source}</div>
                      <div className="pillarPercent">{percentValue.toFixed(1)}%</div>
                      <div className="pillarValue">{damageValue.toFixed(0)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="sectionBottomAccent magenta" />
      </div>
    </div>
  )
}

function DataRow({ label, value, barPct, barExcessPct, color = 'cyan' }: { label: string; value: string; barPct?: number; barExcessPct?: number; color?: 'cyan' | 'amber' | 'magenta' | 'purple' }) {
  return (
    <div className="dataRow">
      <div className="dataRowTop">
        <span className="dataRowLabel">{label}</span>
        <span className="dataRowValue">{value}</span>
      </div>
      {barPct !== undefined && (
        <div className="dataRowBar">
          <div className={`dataRowBarFill ${color}`} style={{ width: `${Math.min(barPct, 100)}%` }} />
          {barExcessPct !== undefined && barExcessPct > 0 && <div className={`dataRowBarFillExcess ${color}`} style={{ width: `${barExcessPct}%` }} />}
        </div>
      )}
    </div>
  )
}

// ========== Helper Functions ===================================================================================================

function categorizeDamageEvents(damageEvents: DamageEvent[]) {
  const mainAction: DamageEvent | null = damageEvents.find(e => !e.dmgTypes.includes('NEGATIVE_STATUS')) || null
  const otherDamage = damageEvents.filter(e => e !== mainAction)
  return { mainAction, otherDamage }
}

function calculateTotalDamage(damageEvents: DamageEvent[]): number {
  return damageEvents.reduce((sum, e) => sum + e.average, 0)
}

function calculateDuration(snapshot: Snapshot): number {
  return snapshot.toTime - snapshot.fromTime
}

function calculatePieSlices(damageValues: number[], colors: string[]) {
  const total = damageValues.reduce((sum, val) => sum + val, 0)
  let cumulativePercent = 0

  return damageValues.map((damage, index) => {
    const percent = (damage / total) * 100
    const angle = (percent / 100) * 360
    const startAngle = (cumulativePercent / 100) * 360
    const rad = (deg: number) => (deg * Math.PI) / 180

    const x1 = 100 + 90 * Math.cos(rad(startAngle - 90))
    const y1 = 100 + 90 * Math.sin(rad(startAngle - 90))
    const x2 = 100 + 90 * Math.cos(rad(startAngle + angle - 90))
    const y2 = 100 + 90 * Math.sin(rad(startAngle + angle - 90))
    const largeArc = angle > 180 ? 1 : 0

    const path = `M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`

    cumulativePercent += percent

    return {
      path,
      color: colors[index % colors.length],
    }
  })
}

function aggregateDamageByType(damageEvents: DamageEvent[]): Array<{ name: string; damage: number; event?: DamageEvent }> {
  const typeMap = new Map<string, number>()

  damageEvents.forEach(event => {
    event.dmgTypes.forEach(type => {
      const current = typeMap.get(type) || 0
      typeMap.set(type, current + event.average)
    })
  })

  return Array.from(typeMap.entries())
    .map(([type, damage]) => ({ name: type, damage }))
    .sort((a, b) => b.damage - a.damage)
}
