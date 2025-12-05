import type { Snapshot } from "../types/snapshots"
import type { ColumnDef } from "../types/tables"

const sharedColumns: ColumnDef[] = [
  { key: "character", label: "Character", render: (snapshot: Snapshot) => snapshot.character },
  { key: "action", label: "Action", render: (snapshot: Snapshot) => snapshot.action },
  { key: "fromTime", label: "From Time", render: (snapshot: Snapshot) => `${snapshot.fromTime.toFixed(1)}s` },
  { key: "toTime", label: "To Time", render: (snapshot: Snapshot) => `${snapshot.toTime.toFixed(1)}s` },
  { key: "damage", label: "Damage", render: (snapshot: Snapshot) => snapshot.damage },
  { key: "dps", label: "DPS", render: (snapshot: Snapshot) => snapshot.dps.toFixed(1) },
]

export { sharedColumns }
