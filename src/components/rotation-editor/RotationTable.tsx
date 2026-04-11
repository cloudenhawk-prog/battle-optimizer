import '../../styles/rotation-editor/RotationTable.css'
import { useState, useEffect, useRef } from 'react'
import { HeaderRow } from './HeaderRow'
import { BodyRow } from './BodyRows'
import { CurrentStateRow } from './CurrentStateRow'
import { CharacterStateTracker } from './CharacterStateTracker'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { Character } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import type { Gear } from '../../types/gear'

// ========== Component: Rotation Table ========================================================================================

type RotationTableProps = {
  snapshots: Array<Snapshot>
  charactersInBattle: Character[]
  tableConfig: TableConfig
  onSelectCharacter: (snapshotId: number, characterName: string) => void
  onSelectAction: (snapshotId: number, actionName: string) => void
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
  onRowClick?: (snapshot: Snapshot) => void
  onGearChange?: (characterName: string, newGear: Gear) => void
  onSequenceChange?: (characterName: string, sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void
  sandboxMode?: boolean
  rowDeletionMode?: boolean
  onDeleteRow?: (snapshotId: number) => void
}

export function RotationTable({ snapshots, charactersInBattle, tableConfig, onSelectCharacter, onSelectAction, columnVisibility, setColumnVisibility, onRowClick, onGearChange, onSequenceChange, sandboxMode = false, rowDeletionMode = false, onDeleteRow }: RotationTableProps) {
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

  // Get the last snapshot that has an action selected; fall back to the initial snapshot so the
  // tracker always shows the correct starting state (e.g. full Energy when that setting is on).
  const currentSnapshot = [...snapshots].reverse().find(s => s.action !== undefined && s.action !== '') ?? snapshots[0]

  // Get the first fromTime from the first snapshot with an action
  const firstSnapshot = snapshots.find(s => s.action !== undefined && s.action !== '')
  const firstFromTime = firstSnapshot?.fromTime ?? 0

  // The active character is whoever is selected in the last (current) row
  const lastSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null
  const activeCharacterName = lastSnapshot?.character || null

  return (
    <>
      <CharacterStateTracker snapshot={currentSnapshot || null} charactersInBattle={charactersInBattle} tableConfig={tableConfig} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} activeCharacterName={activeCharacterName} onGearChange={onGearChange} onSequenceChange={onSequenceChange} />
      <div className="tableWrapper">
        <table className="tableBase">
          <thead className="tableHeader">
            <HeaderRow tableConfig={tableConfig} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} rowDeletionMode={rowDeletionMode} />
            <CurrentStateRow snapshot={currentSnapshot || null} firstFromTime={firstFromTime} tableConfig={tableConfig} columnVisibility={columnVisibility} rowDeletionMode={rowDeletionMode} />
          </thead>
          <tbody>
          {snapshots.map((snapshot, idx) => {
            // For statuses, show the state from the PREVIOUS snapshot since statuses
            // are applied AFTER the action completes (not during)
            const previousSnapshot = idx > 0 ? snapshots[idx - 1] : null
            return <BodyRow key={Number(snapshot.id)} snapshot={snapshot} previousSnapshot={previousSnapshot} charactersInBattle={charactersInBattle} tableConfig={tableConfig} onSelectCharacter={onSelectCharacter} onSelectAction={onSelectAction} onRowClick={onRowClick} isLastRow={idx === snapshots.length - 1} isNewRow={highlightIds.has(Number(snapshot.id))} columnVisibility={columnVisibility} sandboxMode={sandboxMode} rowDeletionMode={rowDeletionMode} onDeleteRow={onDeleteRow} />
          })}
          </tbody>
        </table>
      </div>
    </>
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
  const outroRow = reversed.find(s => s.action === 'Outro')
  const introRow = reversed.find(s => s.action === 'Intro')

  if (outroRow && introRow) {
    idsToHighlight.push(Number(outroRow.id))
    idsToHighlight.push(Number(introRow.id))
  }

  return idsToHighlight
}
