import { useState } from "react"
import { characters } from "../data/characters"
import type { Snapshot } from "../types/snapshots"
import { calculateDamage } from "../engine/damageCalculator"

/* =========================
   Internal Helper Functions
   ========================= */

const getPreviousSnapshotDamage = (snapshots: Snapshot[], id: number) =>
  id === 1 ? 0 : snapshots.find((s) => s.id === id - 1)?.damage ?? 0

const calculateCumulativeDamage = (previousDamage: number, actionDamage: number) =>
  previousDamage + actionDamage

const calculateRowDPS = (cumulativeDamage: number, elapsedTime: number) =>
  elapsedTime > 0 ? cumulativeDamage / elapsedTime : 0

const createNewSnapshot = (prev: Snapshot[], fromTime: number, damage: number): Snapshot => ({
  id: prev.length + 1,
  character: "",
  action: "",
  fromTime,
  toTime: fromTime,
  damage,
  dps: 0,
  energy: 0,
  concerto: 0,
  forte: 0,
  specialEnergy: {},
})

const findCharacterAction = (characterName: string, actionName: string) => {
  const character = characters.find((c) => c.name === characterName)
  if (!character) return null
  return character.actions.find((a) => a.name === actionName) || null
}

/* =========================
   External Hook
   ========================= */

export function useRotationEditor(
  initialSnapshots: Snapshot[] = [
    {
      id: 1,
      character: "",
      action: "",
      fromTime: 0,
      toTime: 0,
      damage: 0,
      dps: 0,
      energy: 0,
      concerto: 0,
      forte: 0,
      specialEnergy: {},
    },
  ]
) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>(initialSnapshots)

  const handleCharacterSelect = (snapshotId: number, characterName: string) => {
    setSnapshots((prev) =>
      prev.map((s) =>
        s.id === snapshotId ? { ...s, character: characterName, action: "" } : s
      )
    )
  }

  const handleActionSelect = (snapshotId: number, actionName: string) => {
    setSnapshots((prev) => {
      const snapshot = prev.find((s) => s.id === snapshotId)
      if (!snapshot || !snapshot.character) return prev

      const action = findCharacterAction(snapshot.character, actionName)
      if (!action) return prev

      const previousDamage = getPreviousSnapshotDamage(prev, snapshotId)
      const actionDamage = calculateDamage(action.damage)
      const cumulativeDamage = calculateCumulativeDamage(previousDamage, actionDamage)
      const toTime = snapshot.fromTime + action.duration

      const updatedSnapshots = prev.map((s) =>
        s.id === snapshotId
          ? {
              ...s,
              action: action.name,
              toTime,
              damage: cumulativeDamage,
              dps: calculateRowDPS(cumulativeDamage, toTime),
            }
          : s
      )

      if (snapshotId === prev[prev.length - 1].id) {
        updatedSnapshots.push(createNewSnapshot(prev, toTime, cumulativeDamage))
      }

      return updatedSnapshots
    })
  }

  const recalcTimeline = () => {
    // Placeholder for future timeline recalculation logic
    // TODO: Implement timeline recalculation when editing previous rows
  }

  return { snapshots, handleCharacterSelect, handleActionSelect, recalcTimeline }
}
