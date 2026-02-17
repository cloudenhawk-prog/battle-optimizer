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
          <MainActionSection mainAction={mainAction} duration={duration} />
          <OtherDamageSection otherDamage={otherDamage} totalDamage={totalDamage} />
          <ContributionsSection />
          <PieChartCapsule damageEvents={damageEvents} totalDamage={totalDamage} />
        </div>
      </div>
    </div>
  )
}

// ========== Components =========================================================================================================

function OverlayHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="dataOverlayHeader">
      <h2 className="overlayTitle">Damage Breakdown</h2>
      <button className="overlayCloseButton" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}

function MainActionSection({ mainAction, duration }: { mainAction: DamageEvent | null; duration: number }) {
  if (!mainAction) {
    return (
      <section className="overlaySection topLeft">
        <h3 className="sectionTitle">Main Action</h3>
        <p className="emptyMessage">No main action found</p>
      </section>
    )
  }

  return (
    <section className="overlaySection topLeft">
      <h3 className="sectionTitle">Main Action</h3>
      <div className="mainActionDetails">
        <DetailRow label="Dealer" value={mainAction.dealer} />
        <DetailRow label="Action" value={mainAction.actionName} />
        <DetailRow label="Target" value={mainAction.target} />
        <DetailRow label="Average Damage" value={mainAction.average.toFixed(0)} />
        <DetailRow label="Min (Normal)" value={mainAction.normalStrike.toFixed(0)} />
        <DetailRow label="Max (Critical)" value={mainAction.criticalStrike.toFixed(0)} />
        <DetailRow label="DPS" value={duration > 0 ? (mainAction.average / duration).toFixed(1) : 'N/A'} />
        <DetailRow label="Elements" value={mainAction.elements.join(', ')} />
        <DetailRow label="Damage Types" value={mainAction.dmgTypes.join(', ')} />
        <DetailRow label="Scaling" value={mainAction.scaling} />
      </div>
    </section>
  )
}

function OtherDamageSection({ otherDamage, totalDamage }: { otherDamage: DamageEvent[]; totalDamage: number }) {
  if (otherDamage.length === 0) {
    return (
      <section className="overlaySection topRight">
        <h3 className="sectionTitle">Other Damage</h3>
        <p className="emptyMessage">No additional damage sources</p>
      </section>
    )
  }

  return (
    <section className="overlaySection topRight">
      <h3 className="sectionTitle">Other Damage</h3>
      <div className="otherDamageList">
        {otherDamage.map((event, index) => (
          <div key={index} className="otherDamageItem">
            <DetailRow label="Source" value={event.actionName} />
            <DetailRow label="Dealer" value={event.dealer} />
            <DetailRow label="Damage" value={event.average.toFixed(0)} />
            <DetailRow label="% of Total" value={`${((event.average / totalDamage) * 100).toFixed(1)}%`} />
          </div>
        ))}
      </div>
    </section>
  )
}

function ContributionsSection() {
  return (
    <section className="overlaySection bottomFull">
      <h3 className="sectionTitle">Contributions</h3>
      <p className="placeholderMessage">This section will display detailed contribution breakdowns for stats, buffs, and other modifiers.</p>
    </section>
  )
}

function PieChartCapsule({ damageEvents, totalDamage }: { damageEvents: DamageEvent[]; totalDamage: number }) {
  if (damageEvents.length === 0) return null

  return (
    <div className="pieChartCapsule">
      <PieChart damageEvents={damageEvents} />
      <div className="totalDamage">
        <strong>Total Damage:</strong> {totalDamage.toFixed(0)}
      </div>
    </div>
  )
}

function PieChart({ damageEvents }: { damageEvents: DamageEvent[] }) {
  if (damageEvents.length === 0) return null

  const colors = getPieColors()

  if (damageEvents.length === 1) {
    return (
      <div className="pieChartContainer">
        <svg viewBox="0 0 200 200" className="pieChartSvg">
          <circle cx="100" cy="100" r="90" fill={colors[0]} stroke="#fff" strokeWidth="2" />
        </svg>
        <PieChartLegend damageEvents={damageEvents} colors={colors} />
      </div>
    )
  }

  const slices = calculatePieSlices(damageEvents, colors)

  return (
    <div className="pieChartContainer">
      <svg viewBox="0 0 200 200" className="pieChartSvg">
        {slices.map((slice, index) => (
          <path key={index} d={slice.path} fill={slice.color} stroke="#fff" strokeWidth="2" />
        ))}
      </svg>
      <PieChartLegend damageEvents={damageEvents} colors={colors} />
    </div>
  )
}

function PieChartLegend({ damageEvents, colors }: { damageEvents: DamageEvent[]; colors: string[] }) {
  const total = calculateTotalDamage(damageEvents)

  return (
    <div className="pieChartLegend">
      {damageEvents.map((event, index) => (
        <div key={index} className="legendItem">
          <span className="legendColor" style={{ backgroundColor: colors[index % colors.length] }} />
          <span className="legendLabel">
            {event.actionName}: {((event.average / total) * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="detailRow">
      <span className="detailLabel">{label}:</span>
      <span className="detailValue">{value}</span>
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

function getPieColors(): string[] {
  return ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4']
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
