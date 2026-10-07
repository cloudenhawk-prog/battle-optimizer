/**
 * Golden-master tests for the UI: server-renders pages and every major panel/overlay with real
 * simulation data and compares the markup, so component splits can't silently change output.
 * Only the initial render is covered (effects and interactions don't run during SSR).
 */

import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../src/App'
import SettingsPage from '../../src/pages/SettingsPage'
import { RotationTable } from '../../src/components/rotation-editor/RotationTable'
import DataOverlay from '../../src/components/rotation-editor/DataOverlay'
import SummaryOverlay from '../../src/components/rotation-editor/SummaryOverlay'
import BuildOptimizerOverlay from '../../src/components/rotation-editor/BuildOptimizerOverlay'
import { CharacterProfileOverlay } from '../../src/components/rotation-editor/CharacterProfileOverlay'
import { CharacterStateTracker } from '../../src/components/rotation-editor/CharacterStateTracker'
import { CurrentStateRow } from '../../src/components/rotation-editor/CurrentStateRow'
import { DamageTimeline } from '../../src/components/rotation-editor/DamageTimeline'
import { ImportExportPanel } from '../../src/components/rotation-editor/ImportExportPanel'
import { ActionSelect } from '../../src/components/rotation-editor/ActionSelect'
import { EchoPickerModal } from '../../src/components/rotation-editor/EchoPickerModal'
import { WeaponPickerModal } from '../../src/components/rotation-editor/WeaponPickerModal'
import { StatusDetailPanel } from '../../src/components/rotation-editor/StatusDetailPanel'
import { flattenTableColumns } from '../../src/tableConfig/helpers'
import { getAvailableActions } from '../../src/engine/castRules/availableActions'
import { getMCTSChoices } from '../../src/optimizers/mcts/choices'
import { runImportSteps } from '../../src/engine/simulation/runRotation'
import { createRng, expectGolden, withSeededRandom } from './goldenHarness'
import { buildAppSetup, DEFAULT_SETTINGS } from './appSetup'

// Portals need a DOM container; in SSR we render their children inline instead.
jest.mock('react-dom', () => ({ ...jest.requireActual('react-dom'), createPortal: (node: unknown) => node }))

beforeAll(() => {
  ;(globalThis as any).document = { body: {} }
  jest.spyOn(console, 'error').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

const noop = () => {}

/** One element per line keeps golden diffs pointing at the exact element that changed. */
function render(el: ReactElement): string[] {
  return withSeededRandom(5, () => renderToStaticMarkup(el)).replace(/></g, '>\n<').split('\n')
}

// Build a realistic rotation via the import path using legal choices picked with a fixed seed.
const setup = buildAppSetup()
const settings = { ...DEFAULT_SETTINGS, autocastFollowUps: true }
function buildRotation() {
  const pick = createRng(2024)
  const steps: { character: string; action: string }[] = []
  let result = runImportSteps({ steps, initialSnapshot: setup.emptySnapshot(settings), charactersMap: setup.charactersMap, characterColumnsMap: setup.importColumnsMap, globalColumns: setup.globalColumns, enemy: setup.enemy, settings, ignoreCastConditions: false })
  for (let i = 0; i < 30; i++) {
    const s = result.snapshots
    const last = s.length >= 2 ? s[s.length - 2] : s[0]
    const choices = getMCTSChoices(last, setup.team)
    if (choices.length === 0) break
    const c = choices[Math.floor(pick() * choices.length)]
    const next = runImportSteps({ steps: [...steps, { character: c.character, action: c.actionName }], initialSnapshot: setup.emptySnapshot(settings), charactersMap: setup.charactersMap, characterColumnsMap: setup.importColumnsMap, globalColumns: setup.globalColumns, enemy: setup.enemy, settings, ignoreCastConditions: false })
    if (next.error) continue
    steps.push({ character: c.character, action: c.actionName })
    result = next
  }
  return { steps, result }
}
const { steps, result } = withSeededRandom(11, buildRotation)
const snapshots = result.snapshots
const damageEvents = result.damageEvents
const allColumns = flattenTableColumns(setup.tableConfig)
const columnVisibility = Object.fromEntries(allColumns.map(col => [col.key, true]))

describe('golden UI: pages', () => {
  test.each(['/', '/rotations', '/settings', '/analytics', '/nope'])('App at %s', route => {
    expectGolden(`ui__app_${route.replace(/\W/g, '') || 'home'}`, render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>))
  })

  test('SettingsPage', () => {
    expectGolden('ui__settings_page', render(<SettingsPage />))
  })
})

describe('golden UI: rotation table and rows', () => {
  test('rotation fixture is non-trivial', () => {
    expect(steps.length).toBeGreaterThan(15)
    expect(damageEvents.length).toBeGreaterThan(20)
  })

  test('RotationTable with a full rotation', () => {
    expectGolden('ui__rotation_table', render(
      <RotationTable snapshots={snapshots} charactersInBattle={setup.team} charactersMap={setup.charactersMap} tableConfig={setup.tableConfig} onSelectCharacter={noop} onSelectAction={noop} columnVisibility={columnVisibility} setColumnVisibility={noop} />,
    ))
  })

  test('RotationTable in sandbox + deletion + edit mode', () => {
    expectGolden('ui__rotation_table_modes', render(
      <RotationTable snapshots={snapshots} charactersInBattle={setup.team} charactersMap={setup.charactersMap} tableConfig={setup.tableConfig} onSelectCharacter={noop} onSelectAction={noop} columnVisibility={columnVisibility} setColumnVisibility={noop} sandboxMode rowDeletionMode onDeleteRow={noop} optimizerEditMode editModeEntries={[{ id: 'e1', character: steps[0].character, action: steps[0].action, insertAfterStepCount: 2 } as any]} onUpdateEditModeEntry={noop} onRemoveEditModeEntry={noop} onInsertEditModeEntry={noop} />,
    ))
  })

  test('CurrentStateRow + CharacterStateTracker per row', () => {
    const out = snapshots.filter((_, i) => i % 4 === 0).map(s => ({
      current: render(<CurrentStateRow snapshot={s} firstFromTime={0} tableConfig={setup.tableConfig} columnVisibility={columnVisibility} />),
      tracker: render(<CharacterStateTracker snapshot={s} charactersInBattle={setup.team} tableConfig={setup.tableConfig} columnVisibility={columnVisibility} setColumnVisibility={noop} activeCharacterName={s.character} />),
    }))
    expectGolden('ui__state_rows', out)
  })

  test('ActionSelect for each row', () => {
    const out = snapshots.slice(1).filter((_, i) => i % 3 === 0).map((s, i) => {
      const prev = snapshots[i * 3]
      const character = setup.charactersMap[s.character || setup.team[0].name]
      return render(<ActionSelect value={s.action ?? ''} actions={character.actions} character={character} currentEnergies={prev.charactersEnergies[character.name]} previousSnapshot={prev} onChange={noop} />)
    })
    expectGolden('ui__action_select', out)
  })
})

describe('golden UI: overlays', () => {
  test('DataOverlay for several rows', () => {
    const out = [1, 4, 8, 12, 16, Math.max(1, snapshots.length - 2)].filter(i => i < snapshots.length).map(i =>
      render(<DataOverlay open snapshot={snapshots[i]} previousSnapshot={snapshots[i - 1]} damageEvents={damageEvents} characters={setup.team} onClose={noop} hasPrev hasNext rowInfo={{ current: i, total: snapshots.length }} />),
    )
    expectGolden('ui__data_overlay', out)
  })

  test('SummaryOverlay', () => {
    expectGolden('ui__summary_overlay', render(<SummaryOverlay open onClose={noop} snapshots={snapshots} damageEvents={damageEvents} characters={setup.team} />))
  })

  test('BuildOptimizerOverlay', () => {
    expectGolden('ui__build_optimizer_overlay', render(<BuildOptimizerOverlay open onClose={noop} snapshots={snapshots} charactersInBattle={setup.team} enemy={setup.enemy} tableConfig={setup.tableConfig} settings={settings} />))
  })

  test('CharacterProfileOverlay per character', () => {
    const last = snapshots[snapshots.length - 2]
    const out = Object.fromEntries(setup.team.map(c => [c.name, render(<CharacterProfileOverlay characterName={c.name} character={c} snapshot={last} allCharacters={setup.team} onClose={noop} onGearChange={noop} onSequenceChange={noop} />)]))
    expectGolden('ui__character_profile', out)
  })

  test('DamageTimeline', () => {
    expectGolden('ui__damage_timeline', render(<DamageTimeline snapshots={snapshots} damageEvents={damageEvents} selectedCharacters={setup.team} />))
  })

  test('ImportExportPanel', () => {
    const saved = [{ name: 'A', createdAt: '2026-01-01T00:00:00.000Z', steps }]
    expectGolden('ui__import_export', render(<ImportExportPanel open onClose={noop} savedRotations={saved} savedSnippets={saved} hasCurrentRotation onSave={noop} onLoad={noop} onDelete={noop} onSaveSnippet={noop} onDeleteSnippet={noop} onAppend={noop} onDownload={noop} onFileUpload={noop} onClearImportStatus={noop} ignoreCastConditions={false} onToggleIgnoreCastConditions={noop} />))
  })

  test('Echo and weapon pickers', () => {
    const c = setup.team[0]
    expectGolden('ui__pickers', {
      echo: ([1, 2, 3, 4, 5] as const).map(slot => render(<EchoPickerModal slot={slot} currentGear={c.gear} characterName={c.name} elColor="#fff" onConfirm={noop} onCancel={noop} />)),
      weapon: setup.team.map(ch => render(<WeaponPickerModal weaponType={ch.gear.weapon.weaponType} characterName={ch.name} elColor="#fff" onConfirm={noop} onCancel={noop} />)),
    })
  })

  test('StatusDetailPanel', () => {
    expectGolden('ui__status_detail', [
      render(<StatusDetailPanel status={null} />),
    ])
  })

  test('available actions used by fixtures stay stable', () => {
    expectGolden('ui__fixture_steps', { steps, available: setup.team.map(c => getAvailableActions(snapshots[snapshots.length - 2], c).map(a => a.name)) })
  })
})
