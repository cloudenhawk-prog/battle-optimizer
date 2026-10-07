// State for the per-row DataOverlay: which action row is open and prev/next navigation between action rows.
import { useState } from 'react'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'

// ========== Hook: useRowOverlay ==============================================================================================

type OverlayData = { snapshot: Snapshot; previousSnapshot: Snapshot | null; damageEvents: DamageEvent[] }

export function useRowOverlay(snapshots: Snapshot[], damageEvents: DamageEvent[] | undefined) {
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [overlayData, setOverlayData] = useState<null | OverlayData>(null)
  const [overlayIndex, setOverlayIndex] = useState<number>(0)

  // Action snapshots are the navigable rows (only rows with an action are shown in the overlay)
  const actionSnapshots = snapshots.filter(s => s.action)

  // Captures the row, its predecessor and its damage events at open time (not re-derived while open)
  function openOverlayAt(index: number) {
    const s = actionSnapshots[index]
    if (!s) return
    const filtered = (damageEvents ?? []).filter(e => Number(e.snapshotId) === Number(s.id))
    const fullIndex = snapshots.findIndex(snap => snap.id === s.id)
    const prevSnapshot = fullIndex > 0 ? snapshots[fullIndex - 1] : null
    setOverlayIndex(index)
    setOverlayData({ snapshot: s, previousSnapshot: prevSnapshot, damageEvents: filtered })
    setOverlayOpen(true)
  }

  function handleRowClick(snapshot: Snapshot) {
    if (!snapshot.action) return
    const index = actionSnapshots.findIndex(s => s.id === snapshot.id)
    openOverlayAt(index)
  }

  return { overlayOpen, setOverlayOpen, overlayData, overlayIndex, actionSnapshots, openOverlayAt, handleRowClick }
}
