import '../../styles/rotation-editor/RotationEditor.css'
import { useState } from 'react'
import { useRotationEditor } from '../../hooks/rotation-editor/useRotationEditor'
import { RotationTable } from './RotationTable'
import DataOverlay from './DataOverlay'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { DamageEvent } from '../../types/events'
import type { Snapshot } from '../../types/snapshot'
import type { Gear } from '../../types/gear'

// ========== Component: Rotation Editor =======================================================================================

type RotationEditorProps = {
  charactersInBattle: ResolvedCharacter[]
  enemy: Enemy
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
  onSnapshotsChange?: (snapshots: Snapshot[], damageEvents: DamageEvent[]) => void
  onGearChange?: (characterName: string, newGear: Gear) => void
}

export default function RotationEditor({ charactersInBattle, enemy, tableConfig, columnVisibility, setColumnVisibility, onSnapshotsChange, onGearChange }: RotationEditorProps) {
  const { snapshots, damageEvents, handleCharacterSelect, handleActionSelect } = useRotationEditor({ charactersInBattle, tableConfig, enemy, onSnapshotsChange })
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayData, setOverlayData] = useState<null | { snapshot: Snapshot; damageEvents: DamageEvent[] }>(null)

  function handleRowClick(snapshot: Snapshot) {
    if (!snapshot.action) return
    const filtered = (damageEvents ?? []).filter(e => Number(e.snapshotId) === Number(snapshot.id))
    setOverlayData({ snapshot, damageEvents: filtered })
    setOverlayOpen(true)
  }

  return (
    <div className="pageWrapper">
      <h1 className="heading"></h1>
      <RotationTable snapshots={snapshots} charactersInBattle={charactersInBattle} tableConfig={tableConfig} onSelectCharacter={handleCharacterSelect} onSelectAction={handleActionSelect} columnVisibility={columnVisibility} setColumnVisibility={setColumnVisibility} onRowClick={handleRowClick} onGearChange={onGearChange} />
      <DataOverlay snapshot={overlayData?.snapshot ?? null} damageEvents={overlayData?.damageEvents ?? []} open={overlayOpen} onClose={() => setOverlayOpen(false)} />
    </div>
  )
}
