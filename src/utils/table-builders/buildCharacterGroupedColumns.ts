import type { Character } from '../../types/character'
import type { ColumnDef } from '../../types/tableDefinitions'
import type { ColumnGroup } from '../../types/tableDefinitions'
import type { EnergyType } from '../../types/baseTypes'
import type { Snapshot } from '../../types/snapshot'

// ========== Build Character Column Groups ====================================================================================

export function buildCharacterGroupsColumns(selectedCharacters: Character[]): ColumnGroup[] {
  return selectedCharacters.map(c => {
    const allEnergyKeys = Object.keys(c.maxEnergies) as EnergyType[]

    // Group multiple forte_* sub-keys into a single combined column
    const forteSubKeys = allEnergyKeys.filter(key => key.startsWith('forte_'))
    const shouldGroupForte = forteSubKeys.length > 1

    const columns: ColumnDef[] = []
    let forteGroupAdded = false

    for (const key of allEnergyKeys) {
      if (key.startsWith('forte_')) {
        if (shouldGroupForte && !forteGroupAdded) {
          columns.push({
            key: `${c.name}_forte`,
            label: 'Forte',
            icon: '/assets/forte.png',
            render: (snapshot: Snapshot) => {
              const energies = snapshot.charactersEnergies[c.name] ?? {}
              const filled = forteSubKeys.filter(k => (energies[k] ?? 0) >= 1).length
              return `${filled}/${forteSubKeys.length}`
            },
            energyMetadata: forteSubKeys.map(k => ({
              key: k,
              label: k.slice('forte_'.length).charAt(0).toUpperCase() + k.slice('forte_'.length + 1),
              icon: `/assets/${k}.png`,
            })),
          })
          forteGroupAdded = true
        } else if (!shouldGroupForte) {
          columns.push({
            key: `${c.name}_${key}`,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            icon: `/assets/${key}.png`,
            render: (snapshot: Snapshot) => {
              const energy = snapshot.charactersEnergies[c.name]?.[key]
              return energy != null ? Math.floor(energy) : energy
            },
          })
        }
        continue
      }

      columns.push({
        key: `${c.name}_${key}`,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        icon: `/assets/${key}.png`,
        render: (snapshot: Snapshot) => {
          const energy = snapshot.charactersEnergies[c.name]?.[key]
          return energy != null ? Math.floor(energy) : energy
        },
      })
    }

    return {
      label: c.name,
      icon: `/assets/character_${c.name.toLowerCase()}.png`,
      nametag: `/assets/nametag_${c.name.toLowerCase()}.png`,
      columns,
    }
  })
}
