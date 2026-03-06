import type { Character } from '../../types/character'
import type { ColumnGroup, StatusMetadata } from '../../types/tableDefinitions'
import { createOptionalGroup } from './helpers'
import { COORDINATED_ATTACK_COLOR } from './coordinatedAttackColors'

// ========== Build Other Column Group =========================================================================================

export function buildOtherColumns(selectedCharacters: Character[]): ColumnGroup | null {
  const columns = []

  // Build Coordinated Attacks Column
  const coordAttacksMeta: StatusMetadata[] = selectedCharacters.flatMap(c =>
    c.actions.flatMap(a =>
      (a.coordinatedAttacks ?? []).map(ca => ({
        key: `${c.name}: ${ca.name}`,
        label: `${c.name}: ${ca.displayName ?? ca.name}`,
        icon: '/assets/coordinated_attack.png',
        maxStacks: 1,
        color: ca.color ?? COORDINATED_ATTACK_COLOR,
      })),
    ),
  )

  // Deduplicate by key
  const seenKeys = new Set<string>()
  const uniqueCoordAttacksMeta = coordAttacksMeta.filter(m => {
    if (seenKeys.has(m.key)) return false
    seenKeys.add(m.key)
    return true
  })

  if (uniqueCoordAttacksMeta.length > 0) {
    columns.push({
      key: 'coordinatedAttacks',
      label: 'Coordinated Attacks',
      icon: 'assets/coordinated_attack.png',
      statusMetadata: uniqueCoordAttacksMeta,
      render: () => null,
    })
  }

  return createOptionalGroup(
    {
      label: 'Other',
      icon: 'assets/other.png',
    },
    columns,
  )
}
