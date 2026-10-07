/**
 * Golden-master tests for the simulation engine: every user-facing way of running a rotation
 * (live editing, import/load, delete-replay, append, replaySteps, MCTS, block optimizer) must keep
 * producing byte-identical snapshots and damage events.
 */

import type { Snapshot } from '../../src/types/snapshot'
import type { DamageEvent } from '../../src/types/events'
import type { Settings } from '../../src/types/settings'
import type { ResolvedCharacter } from '../../src/types/character'
import { runImportSteps } from '../../src/engine/simulation/runRotation'
import { engineStep } from '../../src/engine/simulation/step'
import { initEngineState, type EngineState } from '../../src/engine/simulation/engineState'
import { shouldTriggerOutroIntro, handleOutroIntroFlow } from '../../src/engine/simulation/outroIntro'
import { replaySteps } from '../../src/engine/simulation/replaySteps'
import { getAvailableActions } from '../../src/engine/castRules/availableActions'
import { getMCTSChoices } from '../../src/optimizers/mcts/choices'
import { runMCTS } from '../../src/optimizers/mcts/search'
import { extractTopRotations } from '../../src/optimizers/mcts/output'
import { enumerate } from '../../src/optimizers/blockOptimizer/enumerate'
import { scoreCandidate } from '../../src/optimizers/blockOptimizer/score'
import { extractSteps } from '../../src/engine/simulation/rotationSteps'
import { resolveCharacter } from '../../src/engine/gear/resolveCharacter'
import { cartethyia } from '../../src/data/characters/cartethyia'
import { ciaccona } from '../../src/data/characters/ciaccona'
import { roverAero } from '../../src/data/characters/roverAero'
import { createRng, expectGolden, withSeededRandom } from './goldenHarness'
import { buildAppSetup, DEFAULT_SETTINGS, loadDocRotations, summarizeDamageEvents, type AppSetup } from './appSetup'

// The optimizer logs progress to the console; keep test output readable.
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(console, 'group').mockImplementation(() => {})
  jest.spyOn(console, 'groupEnd').mockImplementation(() => {})
  jest.spyOn(console, 'warn').mockImplementation(() => {})
})

const SETTINGS_VARIANTS: Record<string, Partial<Settings> & { ignoreCastConditions?: boolean }> = {
  default: {},
  autocast: { autocastFollowUps: true },
  fullEnergy: { startWithFullEnergy: true },
  sandbox: { sandboxMode: true },
  ignoreCast: { ignoreCastConditions: true },
}

function runImport(setup: AppSetup, steps: { character: string; action: string }[], variant: Partial<Settings> & { ignoreCastConditions?: boolean }, extra: Partial<Parameters<typeof runImportSteps>[0]> = {}) {
  const { ignoreCastConditions = false, ...settingsOverrides } = variant
  const settings = { ...DEFAULT_SETTINGS, ...settingsOverrides }
  return runImportSteps({
    steps,
    initialSnapshot: setup.emptySnapshot(settings),
    charactersMap: setup.charactersMap,
    characterColumnsMap: setup.importColumnsMap,
    globalColumns: setup.globalColumns,
    enemy: setup.enemy,
    settings,
    ignoreCastConditions,
    ...extra,
  })
}

function summarizeImport(result: ReturnType<typeof runImportSteps>) {
  return {
    error: result.error,
    completedSteps: result.completedSteps,
    snapshots: result.snapshots,
    damageEvents: summarizeDamageEvents(result.damageEvents),
    finalNegativeStatuses: result.finalNegativeStatuses,
    finalModifiers: result.finalModifiers,
    finalCoordinatedAttacks: result.finalCoordinatedAttacks,
  }
}

/** createdAt is wall-clock time, so it can't be part of a golden file. */
function withoutTimestamp<T extends { createdAt: string }>(r: T): Omit<T, 'createdAt'> {
  const copy: Partial<T> = { ...r }
  delete copy.createdAt
  return copy as Omit<T, 'createdAt'>
}

// ========== Live-edit random walks ===========================================================================================

type WalkResult = {
  steps: { character: string; action: string }[]
  snapshots: Snapshot[]
  damageEvents: DamageEvent[]
  engineState: EngineState
}

/**
 * Emulates a user clicking through the editor: pick a character (handleCharacterSelect),
 * then an action (handleActionSelect → engineStep). Choices come from the same legality
 * rules MCTS uses, picked with a seeded RNG, so each seed is a different but reproducible rotation.
 */
function randomWalk(setup: AppSetup, seed: number, length: number, settings: Settings): WalkResult {
  const pick = createRng(seed * 7919)
  let snapshots: Snapshot[] = [setup.emptySnapshot(settings)]
  let engineState = initEngineState()
  let damageEvents: DamageEvent[] = []
  const steps: WalkResult['steps'] = []

  for (let i = 0; i < length; i++) {
    const lastResolved = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : snapshots[0]
    const choices = getMCTSChoices(lastResolved, setup.team)
    if (choices.length === 0) break
    const choice = choices[Math.floor(pick() * choices.length)]
    const snapshotId = Number(snapshots[snapshots.length - 1].id)

    // handleCharacterSelect
    let updated = snapshots.map(s => (Number(s.id) === snapshotId ? { ...s, character: choice.character, action: '' } : s))
    const currentIndex = updated.findIndex(s => Number(s.id) === snapshotId)
    updated = updated.slice(0, currentIndex + 2)
    if (settings.triggerOutroIntroOnCharacterSelect && shouldTriggerOutroIntro(updated, snapshotId)) {
      const r = handleOutroIntroFlow({ snapshots: updated, snapshotId, charactersMap: setup.charactersMap, characterColumnsMap: setup.liveColumnsMap, globalColumns: setup.globalColumns, enemy: setup.enemy, ...engineState })
      damageEvents = [...damageEvents, ...r.damageEvents]
      engineState = { negativeStatusesInAction: r.negativeStatusesInAction, modifiersInAction: r.modifiersInAction, coordinatedAttacksInAction: r.coordinatedAttacksInAction }
      updated = r.snapshots
    }

    // handleActionSelect
    const result = engineStep({
      snapshots: [...updated],
      snapshotId,
      actionName: choice.actionName,
      engineState,
      charactersMap: setup.charactersMap,
      characterColumnsMap: setup.liveColumnsMap,
      globalColumns: setup.globalColumns,
      enemy: setup.enemy,
      autocastFollowUps: settings.autocastFollowUps,
    })
    snapshots = result.snapshots
    engineState = result.engineState
    damageEvents = [...damageEvents, ...result.damageEvents]
    steps.push({ character: choice.character, action: choice.actionName })
  }
  return { steps, snapshots, damageEvents, engineState }
}

const WALK_SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function walkSettings(seed: number): Settings {
  return {
    ...DEFAULT_SETTINGS,
    autocastFollowUps: seed % 2 === 0,
    startWithFullEnergy: seed % 3 === 0,
    triggerOutroIntroOnCharacterSelect: seed % 4 === 1,
  }
}

// ========== Tests ============================================================================================================

describe('golden: saved rotations through the import path', () => {
  const setup = buildAppSetup()
  for (const { file, rotation } of loadDocRotations()) {
    for (const [variantName, variant] of Object.entries(SETTINGS_VARIANTS)) {
      test(`${file} [${variantName}]`, () => {
        const result = withSeededRandom(42, () => runImport(setup, rotation.steps, variant))
        expectGolden(`import__${file.replace(/\W+/g, '_')}__${variantName}`, summarizeImport(result))
      })
    }
  }
})

describe('golden: live-edit random walks (handleCharacterSelect + engineStep)', () => {
  const setup = buildAppSetup()
  for (const seed of WALK_SEEDS) {
    test(`seed ${seed}`, () => {
      const settings = walkSettings(seed)
      const walk = withSeededRandom(seed, () => randomWalk(setup, seed, 40, settings))
      expectGolden(`walk__seed${seed}`, {
        settings,
        steps: walk.steps,
        snapshots: walk.snapshots,
        damageEvents: summarizeDamageEvents(walk.damageEvents),
        engineState: walk.engineState,
      })

      // The same user steps re-run through the import path (what "save + load" does).
      const imported = withSeededRandom(seed, () => runImport(setup, extractSteps(walk.snapshots), settings))
      expectGolden(`walk__seed${seed}__reimport`, summarizeImport(imported))
    })
  }
})

describe('golden: delete-row replay and snippet append', () => {
  const setup = buildAppSetup()
  test('delete replay with capped autocasts, then append', () => {
    const settings = { ...DEFAULT_SETTINGS, autocastFollowUps: true }
    const walk = withSeededRandom(2, () => randomWalk(setup, 2, 30, settings))
    const out: Record<string, unknown> = {}

    // Delete each third row: replay steps before it, capping the trailing autocast chain like the UI does.
    for (let index = 3; index < walk.snapshots.length - 1; index += 3) {
      const stepsToKeep = extractSteps(walk.snapshots.slice(0, index))
      if (stepsToKeep.length === 0) continue
      const maxAutocasts = walk.snapshots[index].isAutocast ? 1 : undefined
      const r = withSeededRandom(index, () => runImport(setup, stepsToKeep, settings, { maxAutocasts }))
      out[`delete@${index}`] = summarizeImport(r)
    }

    // Append the first 8 steps of seed 5 on top of the full walk.
    const snippet = withSeededRandom(5, () => randomWalk(setup, 5, 8, DEFAULT_SETTINGS)).steps
    const appended = withSeededRandom(99, () => runImportSteps({
      steps: snippet,
      startingSnapshots: walk.snapshots,
      initialNegativeStatuses: walk.engineState.negativeStatusesInAction,
      initialModifiers: walk.engineState.modifiersInAction,
      initialCoordinatedAttacks: walk.engineState.coordinatedAttacksInAction,
      charactersMap: setup.charactersMap,
      characterColumnsMap: setup.importColumnsMap,
      globalColumns: setup.globalColumns,
      enemy: setup.enemy,
      settings,
      ignoreCastConditions: false,
    }))
    out.append = summarizeImport(appended)
    expectGolden('delete_and_append', out)
  })
})

describe('golden: replaySteps', () => {
  const setup = buildAppSetup()
  test.each([[1, false], [4, true], [7, false]])('seed %i autocast=%s', (seed, autocast) => {
    const walk = withSeededRandom(seed, () => randomWalk(setup, seed, 25, { ...DEFAULT_SETTINGS, autocastFollowUps: autocast }))
    const r = withSeededRandom(seed, () => replaySteps({
      steps: walk.steps,
      startingSnapshots: [setup.emptySnapshot(DEFAULT_SETTINGS)],
      charactersMap: setup.charactersMap,
      characterColumnsMap: setup.importColumnsMap,
      globalColumns: setup.globalColumns,
      enemy: setup.enemy,
      autocastFollowUps: autocast,
    }))
    expectGolden(`replaySteps__seed${seed}`, { ...r, damageEvents: summarizeDamageEvents(r.damageEvents) })
  })
})

describe('golden: available actions per state', () => {
  const setup = buildAppSetup()
  test('getAvailableActions / getMCTSChoices along a walk', () => {
    const walk = withSeededRandom(3, () => randomWalk(setup, 3, 40, { ...DEFAULT_SETTINGS, autocastFollowUps: true }))
    const out = walk.snapshots.map(s => ({
      id: s.id,
      perCharacter: Object.fromEntries(setup.team.map(c => [c.name, getAvailableActions(s, c).map(a => a.name)])),
      mcts: getMCTSChoices(s, setup.team),
    }))
    expectGolden('available_actions__seed3', out)
  })
})

describe('golden: alternate (legacy) team', () => {
  test('cartethyia / ciaccona / roverAero walks', () => {
    const team: ResolvedCharacter[] = [cartethyia, ciaccona, roverAero].map(c => resolveCharacter(c))
    const setup = buildAppSetup(team)
    const out: Record<string, unknown> = {}
    for (const seed of [21, 22, 23, 24]) {
      const settings = walkSettings(seed)
      let walk: WalkResult | { error: string }
      try {
        walk = withSeededRandom(seed, () => randomWalk(setup, seed, 35, settings))
      } catch (e) {
        walk = { error: String(e) }
      }
      out[`seed${seed}`] = 'error' in walk ? walk : { steps: walk.steps, snapshots: walk.snapshots, damageEvents: summarizeDamageEvents(walk.damageEvents), engineState: walk.engineState }
    }
    expectGolden('legacy_team_walks', out)
  })
})

describe('golden: MCTS', () => {
  test('time goal, seeded', () => {
    const setup = buildAppSetup()
    const result = withSeededRandom(1234, () => runMCTS({ team: setup.team, enemy: setup.enemy, goal: { type: 'time', seconds: 8 }, iterations: 40, topN: 3 }))
    const top = extractTopRotations(result.terminalNodes, result.rolloutRecords, 3).map(withoutTimestamp)
    expectGolden('mcts__time8', {
      top,
      rootVisits: result.root.visits,
      rootChildren: result.root.children.map(c => ({ choice: c.incomingChoice, visits: c.visits, totalScore: c.totalScore })),
      rollouts: result.rolloutRecords,
    })
  })

  test('damage goal, seeded', () => {
    const setup = buildAppSetup()
    const result = withSeededRandom(77, () => runMCTS({ team: setup.team, enemy: setup.enemy, goal: { type: 'damage', amount: 150000 }, iterations: 25, topN: 2 }))
    const top = extractTopRotations(result.terminalNodes, result.rolloutRecords, 2).map(withoutTimestamp)
    expectGolden('mcts__damage', { top, rollouts: result.rolloutRecords })
  })
})

describe('golden: block optimizer (enumerate + score)', () => {
  test('enumerate a short block mid-rotation and score with post-block steps', () => {
    const setup = buildAppSetup()
    const settings = DEFAULT_SETTINGS
    const walk = withSeededRandom(6, () => randomWalk(setup, 6, 12, settings))
    const pre = withSeededRandom(6, () => runImport(setup, walk.steps.slice(0, 6), settings))
    const lastChar = walk.steps[5].character
    const character = setup.charactersMap[lastChar]
    const candidates = withSeededRandom(8, () => enumerate({
      preBlockSnapshots: pre.snapshots,
      preBlockEngineState: { negativeStatusesInAction: pre.finalNegativeStatuses, modifiersInAction: pre.finalModifiers, coordinatedAttacksInAction: pre.finalCoordinatedAttacks },
      character,
      config: { id: 'x', character: lastChar, minDuration: 1, maxDuration: 3, requiredActions: [], bannedActions: [], insertAfterStepCount: 6 },
      charactersMap: setup.charactersMap,
      characterColumnsMap: setup.importColumnsMap,
      globalColumns: setup.globalColumns,
      enemy: setup.enemy,
      autocastFollowUps: false,
    }))
    const scored = withSeededRandom(9, () => candidates.slice(0, 40).map(candidate => scoreCandidate({
      candidate,
      postBlockSteps: walk.steps.slice(6),
      charactersMap: setup.charactersMap,
      characterColumnsMap: setup.importColumnsMap,
      globalColumns: setup.globalColumns,
      enemy: setup.enemy,
      autocastFollowUps: false,
    })))
    expectGolden('optimizer_block', {
      candidateCount: candidates.length,
      candidates: candidates.map(c => ({ steps: c.steps, blockDuration: c.blockDuration })),
      scored: scored.map(s => ({ steps: s.steps, score: s.score, valid: s.valid })),
    })
  })
})
