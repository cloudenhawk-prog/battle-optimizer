import type { ColumnGroup, ColumnDef } from "../../../types/tableDefinitions"

export function buildBasicColumns(): ColumnGroup {
  const basicColumns: ColumnDef[] = [
    {
      key: "fromTime",
      label: "From Time",
      render: (snapshot: Record<string, number | string | Record<string, Record<string, number>> | Record<string, number>>) =>
        `${(snapshot.fromTime as number).toFixed(1)}s`
    },
    {
      key: "toTime",
      label: "To Time",
      render: (snapshot: Record<string, number | string | Record<string, Record<string, number>> | Record<string, number>>) =>
        `${(snapshot.toTime as number).toFixed(1)}s`
    },
    {
      key: "damage",
      label: "Damage",
      render: (snapshot: Record<string, number | string | Record<string, Record<string, number>> | Record<string, number>>) =>
        snapshot.damage as number
    },
    {
      key: "dps",
      label: "DPS",
      render: (snapshot: Record<string, number | string | Record<string, Record<string, number>> | Record<string, number>>) =>
        (snapshot.dps as number).toFixed(1)
    },
  ]

  return {
    label: "Basic",
    columns: basicColumns,
  }
}
