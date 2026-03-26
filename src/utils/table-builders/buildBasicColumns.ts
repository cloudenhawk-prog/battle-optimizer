import type { ColumnGroup, ColumnDef } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'

// ========== Build Basic Column Group =========================================================================================

export function buildBasicColumns(): ColumnGroup {
  const basicColumns: ColumnDef[] = [
    {
      key: 'fromTime',
      label: 'From Time',
      icon: 'assets/table/fromTime.png',
      render: (snapshot: Snapshot) => `${(snapshot.fromTime as number).toFixed(1)}s`,
    },
    {
      key: 'toTime',
      label: 'To Time',
      icon: 'assets/table/toTime.png',
      render: (snapshot: Snapshot) => `${(snapshot.toTime as number).toFixed(1)}s`,
    },
    {
      key: 'damage',
      label: 'Damage',
      icon: 'assets/table/damage.png',
      render: (snapshot: Snapshot) => (snapshot.damage as number).toFixed(0),
    },
    {
      key: 'dps',
      label: 'DPS',
      icon: 'assets/table/dps.png',
      render: (snapshot: Snapshot) => (snapshot.dps as number).toFixed(0),
    },
  ]

  return {
    label: 'General Information',
    columns: basicColumns,
    icon: 'assets/table/basic.png',
  }
}
