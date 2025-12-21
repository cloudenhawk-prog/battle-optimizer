import type { Character } from "../../types/character"
import type { ColumnDef } from "../../types/tableDefinitions"
import type { ColumnGroup } from "../../types/tableDefinitions"
import type { EnergyType } from "../../types/baseTypes"
import type { Snapshot } from "../../types/snapshot"

// ========== Build Character Column Groups ====================================================================================

export function buildCharacterGroupsColumns(selectedCharacters: Character[]): ColumnGroup[] {
  return selectedCharacters.map(c => {
    const allEnergyKeys = Object.keys(c.maxEnergies) as EnergyType[]

    const columns: ColumnDef[] = allEnergyKeys.map(key => ({
      key: `${c.name}_${key}`,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      icon: `/assets/${key}.png`,
      render: (snapshot: Snapshot) => snapshot.charactersEnergies[c.name]?.[key]
    }))

    return {
      label: c.name,
      icon: `/assets/character_${c.name.toLowerCase()}.png`,
      columns,
    }
  })
}
