import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"
import type { Snapshot } from "../../../types/snapshot"

export function buildBasicColumns(): ColumnGroup {
  const basicColumns: ColumnDef[] = [
    {
      key: "fromTime",
      label: "From Time",
      render: (snapshot: Snapshot) =>
        `${(snapshot.fromTime as number).toFixed(1)}s`
    },
    {
      key: "toTime",
      label: "To Time",
      render: (snapshot: Snapshot) =>
        `${(snapshot.toTime as number).toFixed(1)}s`
    },
    {
      key: "damage",
      label: "Damage",
      render: (snapshot: Snapshot) =>
        (snapshot.damage as number).toFixed(0)
    },
    {
      key: "dps",
      label: "DPS",
      render: (snapshot: Snapshot) =>
        (snapshot.dps as number).toFixed(0)
    },
  ]

  return {
    label: "Basic",
    columns: basicColumns,
  }
}
