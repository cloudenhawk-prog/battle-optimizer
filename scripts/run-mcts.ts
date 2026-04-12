/**
 * MCTS Battle Optimizer — Entry Point
 *
 * Searches for the highest-DPS rotation for the current team vs the first enemy in enemies.ts.
 * Uses Monte Carlo Tree Search: each iteration explores one new action sequence, plays it out
 * to completion, and feeds the score back to guide future exploration.
 *
 * Run:  npm run mcts -- [options]
 *
 * Parameters:
 *   --iterations N   How many action sequences to explore. More = better results, slower run.
 *                    Start with 200 for a quick test; use 2000+ for meaningful optimization.
 *   --time N         How many seconds of in-game time to simulate per rotation (default: 20).
 *                    Shorter windows run faster but may miss burst windows that pay off later.
 *   --damage N       Alternative goal: stop when cumulative damage reaches N instead of a time cap.
 *   --topN N         How many of the best rotations to print (default: 3).
 *   --explore C      UCB1 exploration constant (default: √2). Higher = explore more broadly,
 *                    lower = exploit known-good branches more aggressively.
 *   --output path    Save the top-N rotations as a JSON file importable into the rotation editor.
 * 
 * npm run mcts -- --iterations 1000 --time 30 --topN 5
 * npm run mcts -- --iterations 1000 --time 30 --explore 2.5 --topN 10
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { characters } from '../src/data/characters'
import { enemies } from '../src/data/enemies'
import { runMCTS } from '../src/utils/mcts/search'
import { extractTopRotations } from '../src/utils/mcts/output'
import type { TerminationGoal } from '../src/utils/mcts/score'
import { getMCTSChoices } from '../src/utils/mcts/choices'
import { initEngineState, engineStep } from '../src/utils/engine/step'
import { assignCharacterToRow } from '../src/utils/hooks/snapshotHelpers'
import type { GlobalColumns } from '../src/types/tableDefinitions'
import type { ResolvedCharacter } from '../src/types/character'
import type { Enemy } from '../src/types/enemy'
import type { Snapshot } from '../src/types/snapshot'
import type { EnergyType } from '../src/types/baseTypes'

// ========== CLI Arg Parsing ==================================================================================================

// npm run mcts -- --help
function parseArgs(): {
  iterations: number
  goal: TerminationGoal
  topN: number
  output: string | null
  explorationConstant: number
} {
  const args = process.argv.slice(2)
  let iterations = 200
  let topN = 3
  let output: string | null = null
  let explorationConstant = Math.SQRT2
  let goal: TerminationGoal = { type: 'time', seconds: 20 }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--iterations':
        iterations = parseInt(args[++i], 10)
        break
      case '--time':
        goal = { type: 'time', seconds: parseFloat(args[++i]) }
        break
      case '--damage':
        goal = { type: 'damage', amount: parseFloat(args[++i]) }
        break
      case '--topN':
        topN = parseInt(args[++i], 10)
        break
      case '--output':
        output = args[++i]
        break
      case '--explore':
        explorationConstant = parseFloat(args[++i])
        break
      case '--help':
        printHelp()
        process.exit(0)
    }
  }

  return { iterations, goal, topN, output, explorationConstant }
}

function printHelp(): void {
  console.log(`
Usage: npm run mcts -- [options]

Options:
  --iterations N     Number of MCTS iterations to run (default: 200)
  --time N           Simulate until N seconds have elapsed (default: 20)
  --damage N         Simulate until N total damage is dealt (overrides --time)
  --topN N           Number of top rotations to return (default: 3)
  --explore C        UCB1 exploration constant (default: √2 ≈ 1.414)
  --output path      Save results to a JSON file at this path
  --help             Show this help message

Examples:
  npm run mcts
  npm run mcts -- --iterations 1000 --time 60 --topN 5
  npm run mcts -- --iterations 500 --damage 500000 --output results.json
`)
}

// ========== Diagnostics =====================================================================================================

const EMPTY_GLOBAL_COLUMNS: GlobalColumns = { basic: [], buffs: [], debuffs: [], negativeStatuses: [] }

function createInitialSnapshot(team: ResolvedCharacter[]): Snapshot {
  const charactersEnergies: Record<string, Partial<Record<EnergyType, number>>> = {}
  for (const char of team) {
    const energies: Partial<Record<EnergyType, number>> = {}
    const starting = char.startingEnergies?.(char.sequence) ?? {}
    for (const [key, maxVal] of Object.entries(char.maxEnergies) as [EnergyType, number][]) {
      energies[key] = Math.min(starting[key] ?? 0, maxVal)
    }
    charactersEnergies[char.name] = energies
  }
  return {
    id: '0', character: '', action: '', fromTime: 0, toTime: 0, damage: 0, dps: 0,
    charactersEnergies, buffs: {}, buffsTimeLeft: {}, buffsSwapsLeft: {}, buffsMaxStacks: {},
    buffsActivationStats: {}, buffsTargetCharacter: {}, debuffs: {}, debuffsTimeLeft: {},
    debuffsSwapsLeft: {}, debuffsMaxStacks: {}, negativeStatuses: {}, negativeStatusesTimeLeft: {},
    negativeStatusesMaxStacks: {}, coordinatedAttacks: {}, coordinatedAttacksTimeLeft: {},
    coordinatedAttacksSwapRequired: {}, charactersCooldowns: {}, charactersActionStacks: {},
    charactersActionStacksConfig: {}, charactersPositions: {}, charactersPersistentUntil: {},
    charactersLastAction: {}, charactersRequiresSwapOut: {}, charactersForms: {},
    charactersSwapCooldownUntil: {}, charactersAttemptFollowUp: {}, charactersComboWindows: {},
    charactersForteGrants: {}, charactersComboChainTags: {}, charactersOffFieldSince: {},
    offFieldTriggerEvents: {},
  }
}

/**
 * Runs a short manual rollout and prints per-step progress so we can see whether
 * game time is advancing and what choices are being made.
 */
function runDiagnostics(team: ResolvedCharacter[], enemy: Enemy, steps = 10): void {
  const charactersMap = Object.fromEntries(team.map(c => [c.name, c]))
  let snapshots: Snapshot[] = [createInitialSnapshot(team)]
  let engineState = initEngineState()

  const rootChoices = getMCTSChoices(snapshots[0], team)
  console.log(`  Root choices (${rootChoices.length}):`)
  for (const c of rootChoices) {
    console.log(`    ${c.character.padEnd(16)} ${c.actionName}`)
  }
  console.log()

  if (rootChoices.length === 0) {
    console.log('  !! No root choices — simulation cannot proceed.')
    return
  }

  console.log(`  Trial rollout (${steps} steps):`)
  console.log(`  ${'Step'.padEnd(5)} ${'Character'.padEnd(16)} ${'Action'.padEnd(28)} ${'toTime'.padEnd(8)} ${'Damage'.padEnd(12)} DPS`)
  console.log('  ' + '─'.repeat(85))

  for (let i = 0; i < steps; i++) {
    const currentSnapshot = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : snapshots[0]
    const choices = getMCTSChoices(currentSnapshot, team)
    if (choices.length === 0) {
      console.log(`  Step ${i + 1}: no choices available — rollout stuck`)
      break
    }

    const choice = choices[Math.floor(Math.random() * choices.length)]
    const snapshotId = snapshots.length - 1
    const snapshotsWithChar = [...snapshots]
    snapshotsWithChar[snapshotId] = assignCharacterToRow(snapshotsWithChar[snapshotId], choice.character)

    const result = engineStep({
      snapshots: snapshotsWithChar,
      snapshotId,
      actionName: choice.actionName,
      engineState,
      charactersMap,
      characterColumnsMap: {},
      globalColumns: EMPTY_GLOBAL_COLUMNS,
      enemy,
      autocastFollowUps: false,
    })

    snapshots = result.snapshots
    engineState = result.engineState

    const last = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : snapshots[0]
    console.log(
      `  ${String(i + 1).padEnd(5)} ${(last.character ?? '').padEnd(16)} ${(last.action ?? '').padEnd(28)} ${last.toTime.toFixed(3).padEnd(8)} ${last.damage.toFixed(0).padEnd(12)} ${last.dps.toFixed(1)}`,
    )
  }
  console.log()
}

// ========== Main =============================================================================================================

function main(): void {
  const { iterations, goal, topN, output, explorationConstant } = parseArgs()
  const team = characters
  const enemy = enemies[0]

  const goalDesc =
    goal.type === 'time' ? `${goal.seconds}s budget` : `${goal.amount.toLocaleString()} damage target`

  console.log()
  console.log('MCTS Battle Optimizer')
  console.log('─'.repeat(50))
  console.log(`  Team       : ${team.map(c => c.name).join(', ')}`)
  console.log(`  Enemy      : ${enemy.name}`)
  console.log(`  Goal       : ${goalDesc}`)
  console.log(`  Iterations : ${iterations}`)
  console.log(`  Top N      : ${topN}`)
  console.log(`  Explore C  : ${explorationConstant.toFixed(4)}`)
  console.log('─'.repeat(50))
  console.log()

  console.log('Diagnostics:')
  runDiagnostics(team, enemy, 50)

  const start = Date.now()

  const result = runMCTS({
    team, enemy, goal, iterations, topN, explorationConstant,
    onProgress(iteration, total) {
      const pct = Math.round((iteration / total) * 100)
      const elapsed = ((Date.now() - start) / 1000).toFixed(1)
      console.log(`  [${pct}%] ${iteration} / ${total} iterations  (${elapsed}s elapsed)`)
    },
  })

  const elapsed = ((Date.now() - start) / 1000).toFixed(2)
  const termCount = result.terminalNodes.length
  const rolloutCount = result.rolloutRecords.length

  console.log(`Finished in ${elapsed}s  |  tree terminals: ${termCount}  |  rollout records: ${rolloutCount}`)
  console.log()

  const rotations = extractTopRotations(result.terminalNodes, result.rolloutRecords, topN)

  if (rotations.length === 0) {
    console.log(
      'No complete rotations found. The search did not reach the termination goal.\n' +
        'Try increasing --iterations or reducing --time / --damage.',
    )
    process.exit(0)
  }

  console.log(`Top ${rotations.length} rotation${rotations.length !== 1 ? 's' : ''}:`)
  console.log()

  for (const rot of rotations) {
    console.log(`  ${rot.name}`)
    for (const step of rot.steps) {
      console.log(`    ${step.character.padEnd(18)} ${step.action}`)
    }
    console.log()
  }

  if (output) {
    const outPath = path.resolve(output)
    fs.writeFileSync(outPath, JSON.stringify(rotations, null, 2), 'utf-8')
    console.log(`Results saved to: ${outPath}`)
  }
}

main()
