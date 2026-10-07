// Data overlay "Combat Metrics" block: row total damage, DPS, duration and cast window
import type { Snapshot } from '../../../types/snapshot'
import { DataRow } from './DataRow'

export function CombatMetricsSection({ totalDamage, duration, snapshot }: { totalDamage: number; duration: number; snapshot: Snapshot }) {
  const dps = duration > 0 ? totalDamage / duration : 0
  const castTime = `${snapshot.fromTime.toFixed(2)}s – ${snapshot.toTime.toFixed(2)}s`

  return (
    <div className="dataSectionGroup">
      <div className="dataPanelHeader cyan">
        <div className="dataPanelHeaderDot cyan" />
        <span className="dataPanelHeaderLabel">Combat Metrics</span>
        <div className="dataPanelHeaderLine" />
      </div>
      <DataRow label="Total Damage" value={totalDamage.toFixed(0)} />
      <DataRow label="DPS" value={dps > 0 ? dps.toFixed(1) : 'N/A'} />
      <DataRow label="Duration" value={`${duration.toFixed(2)}s`} />
      <DataRow label="Cast Window" value={castTime} />
    </div>
  )
}
