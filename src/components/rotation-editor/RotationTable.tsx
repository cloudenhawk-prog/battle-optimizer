import '../../styles/rotation-editor/RotationTable.css'
import { useState, useEffect, useRef } from 'react'
import { HeaderRow } from './HeaderRow'
import { BodyRow } from './BodyRows'
import { CurrentStateRow } from './CurrentStateRow'
import { CharacterStateTracker } from './CharacterStateTracker'
import { OptimizerRow } from './OptimizerRow'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { Character } from '../../types/character'
import type { Snapshot } from '../../types/snapshot'
import type { Gear } from '../../types/gear'
import type { OptimizerBlock } from '../../types/optimizerBlock'
import { InsertRow } from './InsertRow'
import { useRotationPageContext } from '../../contexts/RotationPageContext'

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
  optimizerBlocks?: OptimizerBlock[]
  onOptimizerBlockConfigure?: (blockId: string) => void
  onOptimizerBlockRemove?: (blockId: string) => void
  onAddOptimizerBlock?: (insertAfterStepCount: number) => void
}

export function RotationTable({ snapshots, charactersInBattle, tableConfig, onSelectCharacter, onSelectAction, columnVisibility, setColumnVisibility, onRowClick, onGearChange, onSequenceChange, sandboxMode = false, rowDeletionMode = false, onDeleteRow, optimizerBlocks = [], onOptimizerBlockConfigure, onOptimizerBlockRemove, onAddOptimizerBlock }: RotationTableProps) {
  const [highlightIds, setHighlightIds] = useState<Set<number>>(new Set())
  const lastMaxId = useRef(0)
  const rotationCtx = useRotationPageContext()

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

  useEffect(() => {
    rotationCtx?.setSelectedCharacterName(activeCharacterName)
  }, [activeCharacterName])

  return (
    <>
      <CharacterStateTracker snapshot={currentSnapshot || null} charactersInBattle={charactersInBattle} tableConfig={tableConfig} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} activeCharacterName={activeCharacterName} onGearChange={onGearChange} onSequenceChange={onSequenceChange} />
      <div className="tableWrapper">
        <table className="tableBase">
          <thead className="tableHeader">
            <HeaderRow tableConfig={tableConfig} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} />
            <CurrentStateRow snapshot={currentSnapshot || null} firstFromTime={firstFromTime} tableConfig={tableConfig} columnVisibility={columnVisibility} />
          </thead>
          <tbody>
          {(() => {
            const rows: React.ReactNode[] = []
            let stepCount = 0
            const addInsert = onAddOptimizerBlock

            // Insert slot at position 0 (before any user steps)
            if (addInsert) rows.push(<InsertRow key="insert-0" onInsert={() => addInsert(0)} />)

            // Flex blocks at step 0 (before any user steps)
            optimizerBlocks
              .filter(b => b.insertAfterStepCount === 0)
              .forEach(b => {
                rows.push(
                  <OptimizerRow key={`opt-${b.id}`} block={b} onConfigure={onOptimizerBlockConfigure ?? (() => {})} onRemove={onOptimizerBlockRemove ?? (() => {})} />
                )
                if (addInsert) rows.push(<InsertRow key={`insert-0-after-${b.id}`} onInsert={() => addInsert(0)} />)
              })

            for (let idx = 0; idx < snapshots.length; idx++) {
              const snapshot = snapshots[idx]
              const previousSnapshot = idx > 0 ? snapshots[idx - 1] : null
              rows.push(
                <BodyRow
                  key={Number(snapshot.id)}
                  snapshot={snapshot}
                  previousSnapshot={previousSnapshot}
                  charactersInBattle={charactersInBattle}
                  tableConfig={tableConfig}
                  onSelectCharacter={onSelectCharacter}
                  onSelectAction={onSelectAction}
                  onRowClick={onRowClick}
                  isLastRow={idx === snapshots.length - 1}
                  isNewRow={highlightIds.has(Number(snapshot.id))}
                  columnVisibility={columnVisibility}
                  sandboxMode={sandboxMode}
                  rowDeletionMode={rowDeletionMode}
                  onDeleteRow={onDeleteRow}
                />
              )

              // Count user-visible steps (non-autocast rows with an action)
              if (snapshot.action && snapshot.action !== '' && snapshot.character && !snapshot.isAutocast) {
                stepCount++
                const capturedStep = stepCount
                // Insert any flex blocks that belong after this step
                optimizerBlocks
                  .filter(b => b.insertAfterStepCount === capturedStep)
                  .forEach(b => {
                    rows.push(
                      <OptimizerRow key={`opt-${b.id}`} block={b} onConfigure={onOptimizerBlockConfigure ?? (() => {})} onRemove={onOptimizerBlockRemove ?? (() => {})} />
                    )
                    if (addInsert) rows.push(<InsertRow key={`insert-${capturedStep}-after-${b.id}`} onInsert={() => addInsert(capturedStep)} />)
                  })
                // Insert slot after this step (when no flex blocks, this is the only slot)
                if (addInsert) rows.push(<InsertRow key={`insert-${capturedStep}`} onInsert={() => addInsert(capturedStep)} />)
              }
            }

            return rows
          })()}
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
