import "../../styles/rotation-editor/RotationTable.css"
import { useState, useEffect, useRef } from "react"
import { HeaderRow } from "./HeaderRow"
import { BodyRow } from "./BodyRows"
import type { TableConfig, ColumnVisibility } from "../../types/tableDefinitions"
import type { Character } from "../../types/character"
import type { Snapshot } from "../../types/snapshot"

type RotationTableProps = {
  snapshots: Array<Snapshot>
  charactersInBattle: Character[]
  tableConfig: TableConfig
  onSelectCharacter: (snapshotId: number, characterName: string) => void
  onSelectAction: (snapshotId: number, actionName: string) => void
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export function RotationTable({
  snapshots,
  charactersInBattle,
  tableConfig,
  onSelectCharacter,
  onSelectAction,
  columnVisibility,
  setColumnVisibility
}: RotationTableProps) {
  // TODO: Use util function or helper function? To not make our components ugly?
  // Check and clean up the RotationEditor CSS which makes the animation
  // Check and clean up BodyRows in case our new implementation is ugly - although it SHOULD just be a new prop and classname?

  const [highlightIds, setHighlightIds] = useState<Set<number>>(new Set())
  const lastMaxId = useRef(0)

  // Highlight latest rows
  useEffect(() => {
    if (!snapshots.length) return

    const currentMaxId = Math.max(...snapshots.map(s => Number(s.id)))
    if (currentMaxId <= lastMaxId.current) {
      lastMaxId.current = currentMaxId
      return
    }
    lastMaxId.current = currentMaxId

    const last4 = snapshots.slice(-4)
    const idsToHighlight: number[] = []

    if (last4.length >= 2) {
      idsToHighlight.push(Number(last4[last4.length - 2].id))
    }

    const outroRow = [...last4].reverse().find(s => s.action === "Outro")
    const introRow = [...last4].reverse().find(s => s.action === "Intro")

    if (outroRow && introRow) {
      idsToHighlight.push(Number(outroRow.id))
      idsToHighlight.push(Number(introRow.id))
    }

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
              setColumnVisibility={setColumnVisibility}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
