import type { ColumnGroup, ColumnDef } from "../../types/tableDefinitions"
import type { Snapshot } from "../../types/snapshot"

// ========== Build Basic Column Group =========================================================================================

export function buildBasicColumns(): ColumnGroup {
  const basicColumns: ColumnDef[] = [
    {
      key: "fromTime",
      label: "From Time",
      icon: "assets/fromTime.png",
      render: (snapshot: Snapshot) =>
        `${(snapshot.fromTime as number).toFixed(1)}s`
    },
    {
      key: "toTime",
      label: "To Time",
      icon: "assets/toTime.png",
      render: (snapshot: Snapshot) =>
        `${(snapshot.toTime as number).toFixed(1)}s`
    },
    {
      key: "damage",
      label: "Damage",
      icon: "assets/damage.png",
      render: (snapshot: Snapshot) =>
        (snapshot.damage as number).toFixed(0)
    },
    {
      key: "dps",
      label: "DPS",
      icon: "assets/dps.png",
      render: (snapshot: Snapshot) =>
        (snapshot.dps as number).toFixed(0)
    },
  ]

  return {
    label: "Basic",
    columns: basicColumns,
    icon: "assets/basic.png"
  }
}
