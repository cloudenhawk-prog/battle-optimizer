import type { Character } from "../../../types/character"
import type { ColumnDef } from "../../../types/tableDefinitions"
import type { ColumnGroup } from "../../../types/tableDefinitions"

export function buildCharacterGroupsColumns(selectedCharacters: Character[]): ColumnGroup[] {
  return selectedCharacters.map(c => {
    const allEnergyKeys = Object.keys(c.maxEnergies)

    const columns: ColumnDef[] = allEnergyKeys.map(key => ({
      key: `${c.name}_${key}`,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      render: snapshot => {
        const energies = snapshot.charactersEnergies as Record<string, Record<string, number>> | undefined
        return energies?.[c.name]?.[key]
      }
    }))

    return {
      label: c.name,
      columns,
    }
  })
}

