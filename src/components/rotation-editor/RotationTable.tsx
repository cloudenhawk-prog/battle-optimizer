import "../../styles/rotation-editor/RotationTable.css"
import { useState, useEffect, useRef } from "react"
import { HeaderRow } from "./HeaderRow"
import { BodyRow } from "./BodyRows"
import type { TableConfig, ColumnVisibility } from "../../types/tableDefinitions"
import type { Character } from "../../types/character"
import type { Snapshot } from "../../types/snapshot"

// ========== Component: Rotation Table ========================================================================================

type RotationTableProps = {
  snapshots: Array<Snapshot>
  charactersInBattle: Character[]
  tableConfig: TableConfig
  onSelectCharacter: (snapshotId: number, characterName: string) => void
  onSelectAction: (snapshotId: number, actionName: string) => void
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export function RotationTable({ snapshots, charactersInBattle, tableConfig, onSelectCharacter, onSelectAction, columnVisibility, setColumnVisibility }: RotationTableProps) {
  const [highlightIds, setHighlightIds] = useState<Set<number>>(new Set())
  const lastMaxId = useRef(0)

  useEffect(() => {
    const idsToHighlight = getHighlightIds(snapshots, lastMaxId)

    if (!idsToHighlight.length) return

    const asyncSet = setTimeout(() => setHighlightIds(new Set(idsToHighlight)), 0)
    const clearHighlight = setTimeout(() => setHighlightIds(new Set()), 1500)

    return () => {
      clearTimeout(asyncSet)
      clearTimeout(clearHighlight)
    }
  }, [snapshots])

  return (
    <div className="tableWrapper">
      <table className="tableBase">
        <HeaderRow
        tableConfig={tableConfig}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        />
        <tbody>
          {snapshots.map((snapshot, idx) => (
            <BodyRow
              key={Number(snapshot.id)}
              snapshot={snapshot}
              charactersInBattle={charactersInBattle}
              tableConfig={tableConfig}
              onSelectCharacter={onSelectCharacter}
              onSelectAction={onSelectAction}
              isLastRow={idx === snapshots.length - 1}
              isNewRow={highlightIds.has(Number(snapshot.id))}
              columnVisibility={columnVisibility}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ========== Helper Functions =================================================================================================

function getHighlightIds(snapshots: Snapshot[], lastMaxId: React.MutableRefObject<number>): number[] {
  if (!snapshots.length) return []

  const currentMaxId = Math.max(...snapshots.map(s => Number(s.id)))
  if (currentMaxId <= lastMaxId.current) {
    lastMaxId.current = currentMaxId
    return []
  }
  lastMaxId.current = currentMaxId

  const last4 = snapshots.slice(-4)
  const idsToHighlight: number[] = []

  if (last4.length >= 2) {
    idsToHighlight.push(Number(last4[last4.length - 2].id))
  }

  const reversed = [...last4].reverse()
  const outroRow = reversed.find(s => s.action === "Outro")
  const introRow = reversed.find(s => s.action === "Intro")

  if (outroRow && introRow) {
    idsToHighlight.push(Number(outroRow.id))
    idsToHighlight.push(Number(introRow.id))
  }

  return idsToHighlight
}