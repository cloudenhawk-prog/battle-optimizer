import type { Snapshot } from "../types/snapshots"

type ColumnDef = {
  key: string
  label: string
  render: (snapshot: Snapshot) => React.ReactNode
};

export type { ColumnDef }