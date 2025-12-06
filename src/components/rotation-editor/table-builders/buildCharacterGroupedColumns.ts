import type { Character } from "../../../types/characters"
import type { ColumnDef } from "../../../types/tableDefinitions"
import type { ColumnGroup } from "../../../types/tableDefinitions"

export function buildCharacterGroupsColumns(selectedCharacters: Character[]): ColumnGroup[] {
  return selectedCharacters.map((c: Character) => {
    const base: ColumnDef[] = [
      {
        key: `${c.name}_energy`,
        label: "Energy",
        render: snapshot => {
          const energies = snapshot.charactersEnergies as Record<string, Record<string, number>> | undefined
          return energies?.[c.name]?.energy
        }
      },
      {
        key: `${c.name}_concerto`,
        label: "Concerto",
        render: snapshot => {
          const energies = snapshot.charactersEnergies as Record<string, Record<string, number>> | undefined
          return energies?.[c.name]?.concerto
        }
      },
      {
        key: `${c.name}_forte`,
        label: "Forte",
        render: snapshot => {
          const energies = snapshot.charactersEnergies as Record<string, Record<string, number>> | undefined
          return energies?.[c.name]?.forte
        }
      },
    ]

    const specialEnergyColumns: ColumnDef[] = (c.specialEnergy ?? []).map(key => ({
      key: `${c.name}_${key}`,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      render: snapshot => {
        const energies = snapshot.charactersEnergies as Record<string, Record<string, number>> | undefined
        return energies?.[c.name]?.[key]
      },
    }))

    return {
      label: c.name,
      columns: [...base, ...specialEnergyColumns],
    }
  })
}
