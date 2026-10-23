// Build optimizer overlay: owns optimizer state, wires config edits + runs to the pure optimizer, lays out the panel.
import { createPortal } from 'react-dom'
import { useState, useRef, useMemo } from 'react'
import '../../../styles/rotation-editor/BuildOptimizerOverlay/01-shell.css'
import '../../../styles/rotation-editor/BuildOptimizerOverlay/02-header-body.css'
import '../../../styles/rotation-editor/BuildOptimizerOverlay/03-left-and-hero.css'
import '../../../styles/rotation-editor/BuildOptimizerOverlay/04-leaderboard.css'
import '../../../styles/rotation-editor/BuildOptimizerOverlay/05-right-dial.css'
import '../../../styles/rotation-editor/BuildOptimizerOverlay/06-echo-config.css'
import '../../../styles/rotation-editor/BuildOptimizerOverlay/07-footer-animations.css'
import type { ResolvedCharacter } from '../../../types/character'
import type { Enemy } from '../../../types/enemy'
import type { TableConfig } from '../../../types/tableDefinitions'
import type { Snapshot } from '../../../types/snapshot'
import type { Settings } from '../../../types/settings'
import type { CharacterStats } from '../../../types/stats'
import { extractSteps } from '../../../engine/simulation/rotationSteps'
import { baseCharacters } from '../../../data/characters'
import { deriveGlobalColumns, energyColumnsByCharacter } from '../../../tableConfig/engineColumns'
import { countCandidates, makeDefaultSlotConfig, runBuildOptimizer } from '../../../optimizers/buildOptimizer'
import type { BuildResult, EchoOptConfig } from '../../../optimizers/buildOptimizer'
import { loadCharConfig, saveCharConfig, exportConfig as downloadConfig } from './configStorage'
import { BoCog } from './icons'
import { BoEdgeOrbiter } from './EdgeOrbiter'
import { ConfigDrawer } from './ConfigDrawer'
import { EchoesDrawer } from './EchoesDrawer'
import { Header } from './Header'
import { RotationColumn } from './RotationColumn'
import { ResultsColumn } from './ResultsColumn'
import { InfoColumn } from './InfoColumn'
import { Footer } from './Footer'

// ========== Component ========================================================================================================

type BuildOptimizerOverlayProps = {
  open: boolean
  onClose: () => void
  snapshots: Snapshot[]
  charactersInBattle: ResolvedCharacter[]
  enemy: Enemy
  tableConfig: TableConfig
  settings: Settings
}

export default function BuildOptimizerOverlay({
  open,
  onClose,
  snapshots,
  charactersInBattle,
  enemy,
  tableConfig,
  settings,
}: BuildOptimizerOverlayProps) {
  const [selectedCharName, setSelectedCharName] = useState<string>(() => charactersInBattle[0]?.name ?? '')
  const [results, setResults] = useState<BuildResult[]>([])
  const [running, setRunning] = useState(false)
  const [ran, setRan] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  // Global quality tier for all selected substats (1 = lowest roll, 8 = highest)
  const [globalTier, setGlobalTier] = useState<number>(() => {
    const name = charactersInBattle[0]?.name ?? ''
    return name ? loadCharConfig(name).globalTier : 8
  })
  // Per-echo-slot substat selection — which substats the optimizer will vary for that slot
  const [echoConfig, setEchoConfig] = useState<EchoOptConfig>(() => {
    const name = charactersInBattle[0]?.name ?? ''
    return name ? loadCharConfig(name).echoConfig : {}
  })
  const [echoesOpen, setEchoesOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [heroExpanded, setHeroExpanded] = useState(false)
  const [expandedLeaderRow, setExpandedLeaderRow] = useState<string | null>(null)
  // Bumped on every run; an in-flight run whose id no longer matches stops at its next chunk
  const runIdRef = useRef(0)

  const steps = extractSteps(snapshots)
  const hasRotation = steps.length > 0
  const selectedChar = charactersInBattle.find(c => c.name === selectedCharName)

  // Live candidate count — computed from config so it shows before Run Optimizer is clicked
  const totalBuilds = useMemo(
    () => selectedChar ? countCandidates(selectedChar, echoConfig, globalTier) : 0,
    [selectedChar, echoConfig, globalTier],
  )

  // ========== Config Handlers ================================================================================================

  function handleSelectChar(name: string) {
    setSelectedCharName(name)
    setResults([])
    setRan(false)
    setProgress(0)
    const saved = loadCharConfig(name)
    setGlobalTier(saved.globalTier)
    setEchoConfig(saved.echoConfig)
    setConfigOpen(false)
    setEchoesOpen(false)
  }

  // Cycles a substat chip: off → flexible → pinned → off. Every config edit is persisted immediately.
  function toggleSubstat(slot: 1 | 2 | 3 | 4 | 5, statKey: keyof CharacterStats) {
    setEchoConfig(prev => {
      const raw = prev[slot] ?? makeDefaultSlotConfig()
      const slotCfg = { ...raw, pinnedSubstats: raw.pinnedSubstats ?? new Set<keyof CharacterStats>() }
      const isFlexible = slotCfg.enabledSubstats.has(statKey)
      const isPinned   = slotCfg.pinnedSubstats.has(statKey)
      const nextEnabled = new Set(slotCfg.enabledSubstats)
      const nextPinned  = new Set(slotCfg.pinnedSubstats)
      if (!isFlexible && !isPinned) {
        // off → flexible
        nextEnabled.add(statKey)
      } else if (isFlexible) {
        // flexible → pinned
        nextEnabled.delete(statKey)
        nextPinned.add(statKey)
      } else {
        // pinned → off
        nextPinned.delete(statKey)
      }
      const updated = { ...prev, [slot]: { ...slotCfg, enabledSubstats: nextEnabled, pinnedSubstats: nextPinned } }
      saveCharConfig(selectedCharName, globalTier, updated)
      return updated
    })
  }

  function toggleMainStat(slot: 1 | 2 | 3 | 4 | 5, statKey: keyof CharacterStats) {
    setEchoConfig(prev => {
      const slotCfg = prev[slot] ?? makeDefaultSlotConfig()
      const next = new Set(slotCfg.enabledMainStats)
      if (next.has(statKey)) next.delete(statKey)
      else next.add(statKey)
      const updated = { ...prev, [slot]: { ...slotCfg, enabledMainStats: next } }
      saveCharConfig(selectedCharName, globalTier, updated)
      return updated
    })
  }

  function setSlotGroupSize(slot: 1 | 2 | 3 | 4 | 5, n: number) {
    setEchoConfig(prev => {
      const slotCfg = prev[slot] ?? makeDefaultSlotConfig()
      const updated = { ...prev, [slot]: { ...slotCfg, substatGroupSize: n } }
      saveCharConfig(selectedCharName, globalTier, updated)
      return updated
    })
  }

  function handleSetGlobalTier(t: number) {
    setGlobalTier(t)
    saveCharConfig(selectedCharName, t, echoConfig)
  }

  function exportConfig() {
    downloadConfig(selectedCharName, globalTier, echoConfig)
  }

  // ========== Run ============================================================================================================

  function runOptimizer() {
    if (!selectedChar || steps.length === 0) return

    const baseChar = baseCharacters.find(c => c.name === selectedCharName)
    if (!baseChar) return

    const runId = ++runIdRef.current
    setRunning(true)
    setRan(false)
    setResults([])
    setProgress(0)

    runBuildOptimizer({
      steps,
      selectedChar,
      baseChar,
      charactersInBattle,
      echoConfig,
      globalTier,
      globalColumns: deriveGlobalColumns(tableConfig),
      characterColumnsMap: energyColumnsByCharacter(charactersInBattle),
      enemy,
      tableConfig,
      settings,
      isCancelled: () => runIdRef.current !== runId,
      onProgress: setProgress,
      onDone: ranked => {
        setResults(ranked)
        setRunning(false)
        setRan(true)
      },
    })
  }

  // ========== Derived Results ================================================================================================

  const bestResult = ran && results.length > 0 ? results[0] : null
  const currentResult = ran ? results.find(r => r.isCurrent) : null
  const headroomDPS = bestResult && currentResult ? bestResult.dps - currentResult.dps : null
  const headroomPct =
    headroomDPS !== null && currentResult && currentResult.dps > 0
      ? (headroomDPS / currentResult.dps) * 100
      : null

  if (!open) return null

  // ========== Render =========================================================================================================

  // Layout: wrapper holds the edge orbiter, two slide-in drawers (z-index above body, below header)
  // and the panel itself (decorative background, header, 3-column body, footer).
  return createPortal(
    <div className="buildOptOverlay" onClick={onClose}>
      <div className="buildOptPanelWrap">
        {/* Edge orbiter lives OUTSIDE the panel so overflow:hidden doesn't clip its teeth */}
        <BoEdgeOrbiter />

        <ConfigDrawer
          configOpen={configOpen}
          setConfigOpen={setConfigOpen}
          globalTier={globalTier}
          handleSetGlobalTier={handleSetGlobalTier}
          selectedChar={selectedChar}
          echoConfig={echoConfig}
          toggleMainStat={toggleMainStat}
          toggleSubstat={toggleSubstat}
          setSlotGroupSize={setSlotGroupSize}
        />

        <EchoesDrawer echoesOpen={echoesOpen} setEchoesOpen={setEchoesOpen} selectedChar={selectedChar} />

        <div className="buildOptPanel" onClick={e => e.stopPropagation()}>

          {/* Decorative background */}
          <div className="buildOptGridOverlay" />
          <BoCog size={520} teeth={22} className="buildOptDecoCogBL" />
          <BoCog size={420} teeth={36} className="buildOptDecoCogBR" />

          <Header running={running} ran={ran} onClose={onClose} />

          <div className="buildOptBody">
            <RotationColumn
              steps={steps}
              hasRotation={hasRotation}
              charactersInBattle={charactersInBattle}
              selectedCharName={selectedCharName}
              handleSelectChar={handleSelectChar}
            />
            <ResultsColumn
              ran={ran}
              running={running}
              hasRotation={hasRotation}
              results={results}
              bestResult={bestResult}
              heroExpanded={heroExpanded}
              setHeroExpanded={setHeroExpanded}
              expandedLeaderRow={expandedLeaderRow}
              setExpandedLeaderRow={setExpandedLeaderRow}
            />
            <InfoColumn
              running={running}
              ran={ran}
              progress={progress}
              totalBuilds={totalBuilds}
              steps={steps}
              globalTier={globalTier}
              echoConfig={echoConfig}
              selectedChar={selectedChar}
              echoesOpen={echoesOpen}
              setEchoesOpen={setEchoesOpen}
              setConfigOpen={setConfigOpen}
              headroomDPS={headroomDPS}
              headroomPct={headroomPct}
            />
          </div>

          <Footer
            configOpen={configOpen}
            setConfigOpen={setConfigOpen}
            setEchoesOpen={setEchoesOpen}
            running={running}
            ran={ran}
            resultsCount={results.length}
            selectedCharName={selectedCharName}
            hasRotation={hasRotation}
            exportConfig={exportConfig}
            runOptimizer={runOptimizer}
          />

        </div>
      </div>
    </div>,
    document.body,
  )
}
