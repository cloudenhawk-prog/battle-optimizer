import type { Character } from "../../types/character"
import type { ColumnGroup, ColumnDef } from "../../types/tableDefinitions"
import type { Snapshot } from "../../types/snapshot"
import { createOptionalGroup } from "./helpers"

// ========== Build Buff Column Group ==========================================================================================

export function buildBuffColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const inherentBuffs = selectedCharacters.flatMap(c => c.buffs.map(b => b.name))
  const actionBuffs = selectedCharacters.flatMap(c =>
    c.actions.flatMap(a => a.buffsApplied.map(b => b.name))
  )
  const activeBuffs = Array.from(new Set([...inherentBuffs, ...actionBuffs]))

  const columns: ColumnDef[] = activeBuffs.map(buff => {
    const key = buff.replace(/\s+/g, "")
    return {
      key,
      label: buff,
      icon: `/assets/${key}.png`,
      render: (snapshot: Snapshot) => {
        const buffs = snapshot.buffs as Record<string, number> | undefined
        return buffs?.[key]
      },
    }
  })

  return createOptionalGroup({ label: "Buffs", icon: "assets/buffs.png" }, columns)
}
