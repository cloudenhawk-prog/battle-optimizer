// checkAssets(): HEAD-requests every icon path the data and table builders reference; logs missing ones (never throws).
import { characters } from '../../characters'
import { negativeStatuses } from '../../negativeStatuses'

export async function checkAssets(): Promise<void> {
  const paths = collectAssetPaths()

  const results = await Promise.all(
    paths.map(async path => {
      const url = new URL(path, window.location.href).href
      try {
        const res = await fetch(url, { method: 'HEAD' })
        const contentType = res.headers.get('content-type') ?? ''
        return { path: url, ok: res.ok && !contentType.startsWith('text/html') }
      } catch {
        return { path: url, ok: false }
      }
    }),
  )

  const found = results.filter(r => r.ok)
  const missing = results.filter(r => !r.ok)

  if (missing.length > 0) {
    console.groupCollapsed(`%c[Asset Check] ✓ ${found.length} resolved  %c✗ ${missing.length} missing`, 'color: #4caf50', 'color: #f44336')
  } else {
    console.groupCollapsed(`%c[Asset Check] ✓ ${results.length} / ${results.length} resolved`, 'color: #4caf50')
  }

  for (const r of found) console.log(`%c✓ ${r.path}`, 'color: #4caf50')
  for (const r of missing) console.log(`%c✗ ${r.path}`, 'color: #f44336')

  console.groupEnd()
}

function collectAssetPaths(): string[] {
  const paths = new Set<string>()

  // Fixed icons used directly by table builder files (buildBasicColumns, buildOtherColumns, etc.)
  // and rotation-editor components (HeaderRow).
  const fixedAssets = [
    'assets/table/basic.png',
    'assets/table/fromTime.png',
    'assets/table/toTime.png',
    'assets/table/damage.png',
    'assets/table/dps.png',
    'assets/table/other.png',
    'assets/table/negativeStatuses.png',
    'assets/table/buffs.png',
    'assets/table/debuffs.png',
    'assets/table/statuses.png', // buildStatusEffectsColumns — Status Effects group icon
    'assets/table/coordinated_attack.png',
    'assets/table/action.png', // HeaderRow
    'assets/table/character.png', // HeaderRow
    'assets/table/selector.png', // HeaderRow
  ]
  for (const p of fixedAssets) paths.add(p)

  for (const character of characters) {
    // Character portrait and nametag (buildCharacterGroupedColumns)
    paths.add(`/assets/characters/nametag_${character.name.toLowerCase()}.png`)

    // Energy type icons (buildCharacterGroupedColumns)
    for (const key of Object.keys(character.maxEnergies)) {
      paths.add(`/assets/energy/${key}.png`)
    }

    // Character-level damage modifier icons (buildStatusEffectsColumns / buildBuffColumns)
    for (const mod of character.damageModifiers) {
      paths.add(`/assets/modifiers/${mod.displayName.toLowerCase().replace(/\s+/g, '_')}.png`)
    }

    for (const action of character.actions) {
      // Action-level damage modifier icons
      for (const mod of action.damageModifiers) {
        paths.add(`/assets/modifiers/${mod.displayName.toLowerCase().replace(/\s+/g, '_')}.png`)
      }

      // Buff/debuff statusModification target icons (buildStatusEffectsColumns)
      for (const mod of action.statusModifications) {
        if (mod.type === 'buff' || mod.type === 'debuff') {
          paths.add(`/assets/modifiers/${mod.targetName.toLowerCase().replace(/\s+/g, '_')}.png`)
        }
      }

      // Coordinated attack icons (buildCoordinatedAttackColumns)
      for (const ca of action.coordinatedAttacks ?? []) {
        paths.add(ca.icon ?? `/assets/coordinated-attacks/${ca.name.toLowerCase().replace(/\s+/g, '_')}.png`)
      }
    }
  }

  // Negative status icons and their modifier icons (buildStatusEffectsColumns)
  for (const ns of Object.values(negativeStatuses)) {
    paths.add(`/assets/negative-statuses/${ns.name.toLowerCase().replace(/\s+/g, '_')}.png`)
    for (const mod of ns.damageModifiers ?? []) {
      paths.add(`/assets/modifiers/${mod.displayName.toLowerCase().replace(/\s+/g, '_')}.png`)
    }
  }

  return Array.from(paths)
}
