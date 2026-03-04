import type { Character } from '../../types/character'
import type { ColumnDef } from '../../types/tableDefinitions'
import type { ColumnGroup } from '../../types/tableDefinitions'
import type { EnergyType } from '../../types/baseTypes'
import type { Snapshot } from '../../types/snapshot'

// ========== Constants ========================================================================================================

const MANDATORY_ENERGY_TYPES = ['energy', 'concerto', 'forte'] as const

// ========== Build Character Column Groups ====================================================================================

export function buildCharacterGroupsColumns(selectedCharacters: Character[]): ColumnGroup[] {
  return selectedCharacters.map(c => {
    const allEnergyKeys = Object.keys(c.maxEnergies) as EnergyType[]
    const mandatoryEnergies = allEnergyKeys.filter(k => MANDATORY_ENERGY_TYPES.includes(k as any)) as EnergyType[]
    const specialEnergies = allEnergyKeys.filter(k => !MANDATORY_ENERGY_TYPES.includes(k as any)) as EnergyType[]

    const columns: ColumnDef[] = []

    // Create one grouped column for mandatory energies
    if (mandatoryEnergies.length > 0) {
      columns.push({
        key: `${c.name}_mandatoryEnergies`,
        label: 'Energies',
        icon: '/assets/energy.png',
        render: (snapshot: Snapshot) => {
          const energies = snapshot.charactersEnergies[c.name]
          return energies != null ? mandatoryEnergies.map(k => Math.floor(energies[k] ?? 0)).join('/') : '-'
        },
        energyMetadata: mandatoryEnergies.map(key => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          icon: `/assets/${key}.png`,
        })),
      })
    }

    // Create separate columns for special energies
    specialEnergies.forEach(key => {
      columns.push({
        key: `${c.name}_${key}`,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        icon: `/assets/${key}.png`,
        render: (snapshot: Snapshot) => {
          const energy = snapshot.charactersEnergies[c.name]?.[key]
          return energy != null ? Math.floor(energy) : energy
        },
      })
    })

    return {
      label: c.name,
      icon: `/assets/character_${c.name.toLowerCase()}.png`,
      columns,
    }
  })
}
