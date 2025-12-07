import { useState, useEffect } from "react"
import { HeaderRow } from "./HeaderRow"
import { BodyRow } from "./BodyRows"
import type { TableConfig } from "../../../types/tableDefinitions"
import type { Character } from "../../../types/characters"
import type { Snapshot } from "../../../types/snapshot"

type RotationTableProps = {
  snapshots: Array<Snapshot>
  charactersInBattle: Character[]
  tableConfig: TableConfig
  onSelectCharacter: (snapshotId: number, characterName: string) => void
  onSelectAction: (snapshotId: number, actionName: string) => void
}

export function RotationTable({
  snapshots,
  charactersInBattle,
  tableConfig,
  onSelectCharacter,
  onSelectAction,
}: RotationTableProps) {
  const [highlightIds, setHighlightIds] = useState<Set<number>>(new Set())

  // TODO: Use util function or helper function? To not make our components ugly?
  // Check and clean up the RotationEditor CSS which makes the animation
  // Check and clean up BodyRows in case our new implementation is ugly - although it SHOULD just be a new prop and classname?

  useEffect(() => {
    if (!snapshots.length) return

    const last4 = snapshots.slice(-4)
    const idsToHighlight: number[] = []

    if (last4.length >= 2) {
      const secondLast = last4[last4.length - 2]
      idsToHighlight.push(Number(secondLast.id))
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
  }, [snapshots.length])

  return (
    <div className="tableWrapper">
      <table className="tableBase">
        <HeaderRow tableConfig={tableConfig} />
        <tbody className="tableBody">
          {snapshots.map((s, idx) => (
            <BodyRow
              key={s.id as number}
              snapshot={s}
              charactersInBattle={charactersInBattle}
              tableConfig={tableConfig}
              onSelectCharacter={onSelectCharacter}
              onSelectAction={onSelectAction}
              isLastRow={idx === snapshots.length - 1}
              isNewRow={highlightIds.has(s.id as number)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
