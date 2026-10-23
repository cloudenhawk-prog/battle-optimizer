/**
 * Golden-master tests for static game data and startup resolution: character definitions,
 * gear resolution, stat breakdowns, catalogs and table config must not drift during refactors.
 */

import type { Character } from '../../src/types/character'
import { baseCharacters, characters } from '../../src/data/characters'
import { cartethyia } from '../../src/data/characters/cartethyia'
import { ciaccona } from '../../src/data/characters/ciaccona'
import { roverAero } from '../../src/data/characters/roverAero'
import { enemies } from '../../src/data/enemies'
import { negativeStatuses } from '../../src/data/negativeStatuses'
import { weaponCatalog, buildWeapon } from '../../src/data/gear/weaponCatalog'
import { echoCatalog } from '../../src/data/gear/echoCatalog'
import { echoSetRegistry } from '../../src/data/gear/echoSets'
import { MAIN_STAT_OPTIONS, SUBSTAT_OPTIONS } from '../../src/data/gear/echoStats'
import { ECHO_COST_BASE_DATA, ECHO_SUBSTAT_VALUES } from '../../src/data/gear/echoes'
import { resolveCharacter } from '../../src/engine/gear/resolveCharacter'
import { computeGearStatBreakdown, computeActiveModifierBreakdown, computeFinalStats } from '../../src/engine/gear/computeStatBreakdown'
import { buildTableConfig } from '../../src/tableConfig/buildTableConfig'
import { flattenTableColumns } from '../../src/tableConfig/helpers'
import { verifyData } from '../../src/data/validation/verifyData'
import { runImportSteps } from '../../src/engine/simulation/runRotation'
import { expectGolden, withSeededRandom } from './goldenHarness'
import { buildAppSetup, DEFAULT_SETTINGS, loadDocRotations } from './appSetup'

const legacy: Character[] = [cartethyia, ciaccona, roverAero]

describe('golden: character definitions', () => {
  test.each(baseCharacters.concat(legacy).map(c => [c.name, c] as const))('%s (base + resolved)', (name, base) => {
    const resolved = resolveCharacter(base)
    expectGolden(`data__character_${name}`, { base, resolved }, { fnMarkers: true })
  })

  test('characters roster resolves the same as resolveCharacter(base)', () => {
    expectGolden('data__roster', characters.map(c => ({ name: c.name, stats: c.stats, actions: c.actions.map(a => a.name) })))
  })

  test('sequence levels resolve (S0..S6)', () => {
    const out = baseCharacters.map(c => ({
      name: c.name,
      bySequence: ([0, 1, 2, 3, 4, 5, 6] as const).map(seq => {
        const r = resolveCharacter({ ...c, sequence: seq })
        return { seq, stats: r.stats, modifiers: (r.damageModifiers ?? []).map(m => m.displayName), actions: r.actions.length }
      }),
    }))
    expectGolden('data__sequences', out)
  })
})

describe('golden: catalogs and registries', () => {
  test('weapons (every entry at every rank)', () => {
    const out = weaponCatalog.map(entry => ({ entry, ranks: ([1, 2, 3, 4, 5] as const).map(rank => buildWeapon(entry, rank, 'Hiyuki')) }))
    expectGolden('data__weapons', out, { fnMarkers: true })
  })

  test('echoes, sets, stat options, enemies, negative statuses', () => {
    expectGolden('data__echo_and_misc', { echoCatalog, echoSetRegistry, MAIN_STAT_OPTIONS, SUBSTAT_OPTIONS, ECHO_COST_BASE_DATA, ECHO_SUBSTAT_VALUES, enemies, negativeStatuses }, { fnMarkers: true })
  })
})

describe('golden: stat breakdowns', () => {
  test('gear + active-modifier breakdown at several points of a rotation', () => {
    const setup = buildAppSetup()
    const { rotation } = loadDocRotations()[0]
    const run = withSeededRandom(1, () => runImportSteps({ steps: rotation.steps, initialSnapshot: setup.emptySnapshot(DEFAULT_SETTINGS), charactersMap: setup.charactersMap, characterColumnsMap: setup.importColumnsMap, globalColumns: setup.globalColumns, enemy: setup.enemy, settings: { ...DEFAULT_SETTINGS, sandboxMode: true }, ignoreCastConditions: true }))
    const out = characters.map(c => ({
      name: c.name,
      gear: computeGearStatBreakdown(c),
      atRows: [0, 3, 8, 14].filter(i => i < run.snapshots.length).map(i => ({
        row: i,
        active: computeActiveModifierBreakdown(c, run.snapshots[i], characters),
        final: computeFinalStats(c, run.snapshots[i], characters),
      })),
      noSnapshot: computeFinalStats(c, null, characters),
    }))
    expectGolden('data__stat_breakdowns', out)
  })
})

describe('golden: table config', () => {
  test('buildTableConfig + flattened columns', () => {
    const config = buildTableConfig(characters)
    expectGolden('data__table_config', { config, flat: flattenTableColumns(config).map(c => c.key) }, { fnMarkers: true })
  })
})

describe('golden: verifyData', () => {
  test('console output', () => {
    const lines: string[] = []
    const capture = (...args: unknown[]) => { lines.push(args.map(String).join(' ')) }
    const spies = (['log', 'warn', 'error', 'info', 'group', 'groupCollapsed', 'groupEnd'] as const).map(m => jest.spyOn(console, m).mockImplementation(capture))
    try {
      verifyData()
    } finally {
      spies.forEach(s => s.mockRestore())
    }
    expectGolden('data__verify', lines)
  })
})
