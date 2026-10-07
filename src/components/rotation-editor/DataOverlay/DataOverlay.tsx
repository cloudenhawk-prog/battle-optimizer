// Per-row data overlay ("Resonance Field Analysis"): energy deltas, stats, damage pie/sources and modifier contributions
import { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../../../styles/rotation-editor/DataOverlay.css'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { ResolvedCharacter } from '../../../types/character'
import { calculateDuration, calculateTotalDamage } from './damageMath'
import { logDataOverlayDiagnostics } from './debugLog'
import { EnergySection } from './EnergySection'
import { ActiveStatsSection } from './ActiveStatsSection'
import { CombatMetricsSection } from './CombatMetricsSection'
import { PieChartCenter } from './PieChartCenter'
import { DamageSourcesSection } from './DamageSourcesSection'
import { ContributionsSection } from './ContributionsSection'

// ========== Main Component =====================================================================================================

type DataOverlayProps = {
  snapshot: Snapshot | null
  previousSnapshot?: Snapshot | null
  startWithFullEnergy?: boolean
  damageEvents?: DamageEvent[]
  characters?: ResolvedCharacter[]
  open: boolean
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  rowInfo?: { current: number; total: number }
}

export default function DataOverlay({ snapshot, previousSnapshot = null, startWithFullEnergy = false, damageEvents = [], characters = [], open, onClose, onPrev, onNext, hasPrev, hasNext, rowInfo }: DataOverlayProps) {
  const [mode, setMode] = useState<'average' | 'normal' | 'crit'>('average')
  const [pieChartView, setPieChartView] = useState<'events' | 'types'>('events')
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)

  // Unique action names in stable insertion order — used for contribution source toggles
  const sourceNames = useMemo(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const e of damageEvents) {
      if (!seen.has(e.actionName)) { seen.add(e.actionName); result.push(e.actionName) }
    }
    return result
  }, [damageEvents])

  const [activeSources, setActiveSources] = useState<Set<string>>(() => new Set(sourceNames))
  const [prevSourceNames, setPrevSourceNames] = useState<string[]>(sourceNames)
  if (prevSourceNames !== sourceNames) {
    setPrevSourceNames(sourceNames)
    setActiveSources(new Set(sourceNames))
  }
  const toggleSource = (name: string) => setActiveSources(prev => {
    const next = new Set(prev)
    if (next.has(name)) next.delete(name); else next.add(name)
    return next
  })

  // Unique contribution group keys across all events — used for buff toggles
  const contribGroupKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const e of damageEvents) {
      for (const key of Object.keys(e.contributions)) keys.add(key)
    }
    return keys
  }, [damageEvents])

  const [activeContribs, setActiveContribs] = useState<Set<string>>(() => new Set(contribGroupKeys))
  const [prevContribGroupKeys, setPrevContribGroupKeys] = useState(contribGroupKeys)
  if (prevContribGroupKeys !== contribGroupKeys) {
    setPrevContribGroupKeys(contribGroupKeys)
    setActiveContribs(new Set(contribGroupKeys))
  }
  const toggleContrib = (key: string) => setActiveContribs(prev => {
    const next = new Set(prev)
    if (next.has(key)) next.delete(key); else next.add(key)
    return next
  })
  const toggleAllContribs = () => {
    const allKeys = Array.from(contribGroupKeys)
    setActiveContribs(prev => {
      const allActive = allKeys.every(k => prev.has(k))
      return allActive ? new Set<string>() : new Set(allKeys)
    })
  }

  // Unique damage types across all events — used for pie chart type filtering only
  const typeNames = useMemo(() => {
    const seen = new Set<string>()
    for (const e of damageEvents) {
      for (const t of e.dmgTypes) seen.add(t)
    }
    return seen
  }, [damageEvents])

  const [activeTypes, setActiveTypes] = useState<Set<string>>(() => new Set(typeNames))
  const [prevTypeNames, setPrevTypeNames] = useState(typeNames)
  if (prevTypeNames !== typeNames) {
    setPrevTypeNames(typeNames)
    setActiveTypes(new Set(typeNames))
  }
  const toggleType = (type: string) => setActiveTypes(prev => {
    const next = new Set(prev)
    if (next.has(type)) next.delete(type); else next.add(type)
    return next
  })

  // Re-evaluate each event with only the active modifier groups.
  // When all contribs are active, pass through the original events unchanged.
  const adjustedDamageEvents = useMemo(() => {
    if (activeContribs.size >= contribGroupKeys.size) return damageEvents
    return damageEvents.map(event => {
      if (!event.calcParams) return event
      const { normal, crit, avg } = event.calcParams.reEvaluate(activeContribs)
      return { ...event, normalStrike: normal, criticalStrike: crit, average: avg }
    })
  }, [damageEvents, activeContribs, contribGroupKeys])

  // ── DEBUG: dump event diagnostics when overlay opens ─────────────────────────────────────────────
  const _dbgPrevOpen = useRef(false)
  if (open !== _dbgPrevOpen.current) {
    _dbgPrevOpen.current = open
    if (open && damageEvents.length > 0) {
      logDataOverlayDiagnostics(snapshot, damageEvents, contribGroupKeys)
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────────────────────────

  if (!open || !snapshot) return null

  const totalDamage = calculateTotalDamage(adjustedDamageEvents, mode)
  const duration = calculateDuration(snapshot)
  const showNav = onPrev !== undefined || onNext !== undefined

  return createPortal(
    <div className="dataOverlay" role="dialog" aria-modal="true">
      <div className="dataPanel">

        {/* Header */}
        <div className="dataHeader">
          <div className="dataHeaderLeft">
            <h2 className="dataTitle">RESONANCE FIELD ANALYSIS</h2>
          </div>
          <div className="dataHeaderRight">
            {showNav && (
              <div className="dataNavGroup">
                <button
                  className="dataNavButton"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  title="Previous row (↑)"
                  aria-label="Previous row"
                >
                  ▲
                </button>
                {rowInfo && (
                  <span className="dataNavCounter">{rowInfo.current} / {rowInfo.total}</span>
                )}
                <button
                  className="dataNavButton"
                  onClick={onNext}
                  disabled={!hasNext}
                  title="Next row (↓)"
                  aria-label="Next row"
                >
                  ▼
                </button>
              </div>
            )}
            <button className="dataClose" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* 3-column body */}
        <div className="dataColumns">
          {/* Left panel — energy delta + active buff stats */}
          <div className="dataLeftPanel">
            <EnergySection snapshot={snapshot} previousSnapshot={previousSnapshot} startWithFullEnergy={startWithFullEnergy} characters={characters} />
            <ActiveStatsSection damageEvents={adjustedDamageEvents} activeContribs={activeContribs} contribGroupKeys={contribGroupKeys} characters={characters} snapshot={snapshot} />
          </div>

          <div className="dataColDivider" />

          {/* Center — combat metrics + pie chart + damage sources */}
          <div className="dataCenterPanel">
            <div className="dataCenterTopArea">
              <CombatMetricsSection totalDamage={totalDamage} duration={duration} snapshot={snapshot} />
            </div>
            <div className="dataCenterPieArea">
              <div className="dataPieViewBar">
                <div className="dataPieToggle">
                  <button className={`dataPieToggleButton${mode === 'average' ? ' active' : ''}`} onClick={() => setMode('average')}>
                    Average
                  </button>
                  <button className={`dataPieToggleButton${mode === 'normal' ? ' active' : ''}`} onClick={() => setMode('normal')}>
                    Normal
                  </button>
                  <button className={`dataPieToggleButton${mode === 'crit' ? ' active' : ''}`} onClick={() => setMode('crit')}>
                    Critical
                  </button>
                </div>
              </div>
              <PieChartCenter
                damageEvents={adjustedDamageEvents}
                view={pieChartView}
                mode={mode}
                highlightedIndex={highlightedIndex}
                onSliceHover={setHighlightedIndex}
                activeSources={activeSources}
                activeTypes={activeTypes}
              />
              <div className="dataPieViewBar">
                <div className="dataPieToggle">
                  <button className={`dataPieToggleButton${pieChartView === 'events' ? ' active' : ''}`} onClick={() => setPieChartView('events')}>
                    Events
                  </button>
                  <button className={`dataPieToggleButton${pieChartView === 'types' ? ' active' : ''}`} onClick={() => setPieChartView('types')}>
                    Types
                  </button>
                </div>
              </div>
            </div>
            <div className="dataCenterSourcesArea">
              <DamageSourcesSection
                damageEvents={adjustedDamageEvents}
                totalDamage={totalDamage}
                mode={mode}
                view={pieChartView}
                externalHighlightedIndex={highlightedIndex}
                onRowHighlight={setHighlightedIndex}
                activeSources={activeSources}
                onToggleSource={toggleSource}
                activeTypes={activeTypes}
                onToggleType={toggleType}
              />
            </div>
          </div>

          <div className="dataColDivider" />

          {/* Right panel — Modifier Contributions */}
          <div className="dataRightPanel">
            <ContributionsSection damageEvents={adjustedDamageEvents} mode={mode} characters={characters} snapshot={snapshot} activeSources={activeSources} activeContribs={activeContribs} onToggleContrib={toggleContrib} onToggleAllContribs={toggleAllContribs} contribGroupKeys={contribGroupKeys} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
