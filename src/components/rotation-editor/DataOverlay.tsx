import '../../styles/rotation-editor/DataOverlay.css'
import type { Snapshot } from '../../types/snapshot'
import type { DamageEvent } from '../../types/events'

// ========== Main Component =====================================================================================================

type DataOverlayProps = {
  snapshot: Snapshot | null
  damageEvents?: DamageEvent[]
  open: boolean
  onClose: () => void
}

export default function DataOverlay({ snapshot, damageEvents = [], open, onClose }: DataOverlayProps) {
  if (!open || !snapshot) return null

  const { mainAction, otherDamage } = categorizeDamageEvents(damageEvents)
  const totalDamage = calculateTotalDamage(damageEvents)
  const duration = calculateDuration(snapshot)

  return (
    <div className="dataOverlay" role="dialog" aria-modal="true">
      <div className="dataOverlayContent">
        <OverlayHeader onClose={onClose} />
        <div className="dataOverlayBody">
          <HudOverlay />

          {/* Central Pie Chart */}
          <PieChartCenter damageEvents={damageEvents} totalDamage={totalDamage} />

          {/* Radial Sections */}
          <CombatOverviewSection totalDamage={totalDamage} duration={duration} snapshot={snapshot} />
          <MainActionSection mainAction={mainAction} totalDamage={totalDamage} />
          <SideEffectsSection otherDamage={otherDamage} totalDamage={totalDamage} />
          <ContributionsSection />
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

function HudOverlay() {
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
          TETHER <span className="separator">//</span> v3.2.17
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
          <span className="hudLabel">Resonance Field:</span> Nominal
        </div>
      </div>
    </>
  )
}

function PieChartCenter({ damageEvents, totalDamage }: { damageEvents: DamageEvent[]; totalDamage: number }) {
  if (damageEvents.length === 0) return null

  // Subtle colors matching the table theme
  const colors = ['rgba(100, 150, 255, 0.7)', 'rgba(255, 150, 100, 0.7)', 'rgba(200, 150, 255, 0.7)']

  // Calculate main action percentage
  const mainAction = damageEvents.find(e => !e.dmgTypes.includes('NEGATIVE_STATUS'))
  const mainPercentage = mainAction && totalDamage > 0 ? Math.round((mainAction.average / totalDamage) * 100) : 0

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
      {damageEvents.length === 1 ? (
        <svg viewBox="0 0 200 200" className="pieChartSvg">
          <circle cx="100" cy="100" r="90" fill={colors[0]} stroke="rgba(30, 30, 40, 0.95)" strokeWidth="2" />
        </svg>
      ) : (
        <svg viewBox="0 0 200 200" className="pieChartSvg">
          {calculatePieSlices(damageEvents, colors).map((slice, index) => (
            <path key={index} d={slice.path} fill={slice.color} stroke="rgba(30, 30, 40, 0.95)" strokeWidth="2" />
          ))}
        </svg>
      )}

      {/* Inner circle with percentage */}
      <div className="pieInnerCircle">
        <div className="piePercentage">{mainPercentage}%</div>
        <div className="pieLabel">Total Damage</div>
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
    </div>
  )
}

function CombatOverviewSection({ totalDamage, duration, snapshot }: { totalDamage: number; duration: number; snapshot: Snapshot }) {
  const dps = duration > 0 ? totalDamage / duration : 0
  const castTime = `${snapshot.fromTime.toFixed(2)}s - ${snapshot.toTime.toFixed(2)}s`

  return (
    <div className="radialSection combatOverview">
      <div className="connectorDot" />
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
        <div className="connectorDot" />
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
      <div className="connectorDot" />
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
        <div className="connectorDot" />
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
      <div className="connectorDot" />
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

function ContributionsSection() {
  return (
    <div className="radialSection contributions">
      <div className="connectorDot" />
      <div className="sectionCard magenta">
        <div className="sectionTopAccent magenta" />
        <div className="sectionTitle magenta">
          <div className="titleDot magenta" />
          <span>Combat Statistics</span>
        </div>
        <div className="sectionContent">
          <DataRow label="ATK Rating" value="+248" barPct={62} color="magenta" />
          <DataRow label="Crit Chance" value="45.2%" barPct={45} color="magenta" />
          <DataRow label="Crit DMG" value="180.0%" barPct={90} color="magenta" />
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

function calculatePieSlices(damageEvents: DamageEvent[], colors: string[]) {
  const total = calculateTotalDamage(damageEvents)
  let cumulativePercent = 0

  return damageEvents.map((event, index) => {
    const percent = (event.average / total) * 100
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
