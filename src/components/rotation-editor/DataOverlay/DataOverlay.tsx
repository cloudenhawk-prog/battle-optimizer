// Per-row data overlay: energy flow + stats (left), impact dial, source ledger and hit log (centre), modifier contributions (right)
import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import '../../../styles/rotation-editor/DataOverlay.css'
import type { Snapshot } from '../../../types/snapshot'
import type { DamageEvent } from '../../../types/events'
import type { ResolvedCharacter } from '../../../types/character'
import { aggregateEventsByName, calculateDuration, calculateTotalDamage } from './damageMath'
import { logDataOverlayDiagnostics } from './debugLog'
import { EnergySection } from './EnergySection'
import { ActiveStatsSection } from './ActiveStatsSection'
import { ImpactDial } from './ImpactDial'
import { DamageSourcesSection } from './DamageSourcesSection'
import { ContributionsSection } from './ContributionsSection'
import { HitLog } from './HitLog'
import { getTeamAccent } from '../../shared/elementColors'
import { CloseButton, PortraitRing, Readout, SectionHeader, SegmentedToggle, accentVar } from '../../shared/ui'

const DAMAGE_MODES = [
  { value: 'average', label: 'Average' },
  { value: 'normal', label: 'Normal' },
  { value: 'crit', label: 'Critical' },
] as const

const PIE_VIEWS = [
  { value: 'events', label: 'Events' },
  { value: 'types', label: 'Types' },
] as const

const formatInt = (n: number) => Math.round(n).toLocaleString('en-US')

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
  useEffect(() => {
    if (open !== _dbgPrevOpen.current) {
      _dbgPrevOpen.current = open
      if (open && damageEvents.length > 0) {
        logDataOverlayDiagnostics(snapshot, damageEvents, contribGroupKeys)
      }
    }
  }, [open, snapshot, damageEvents, contribGroupKeys])
  // ─────────────────────────────────────────────────────────────────────────────────────────────────

  if (!open || !snapshot) return null

  const totalDamage = calculateTotalDamage(adjustedDamageEvents, mode)
  const duration = calculateDuration(snapshot)
  const dps = duration > 0 ? totalDamage / duration : 0
  const showNav = onPrev !== undefined || onNext !== undefined

  // Accent = the acting character's team accent, the same one that tints their table row
  const acting = characters.find(c => c.name === snapshot.character) ?? null
  const accent = getTeamAccent(characters, snapshot.character)
  const actionName = snapshot.resolvedDisplayName ?? acting?.actions.find(a => a.name === snapshot.action)?.displayName ?? snapshot.action ?? 'Field Analysis'
  // Source name → ledger index, so hit-log rows share the dial colours (only meaningful in the events view)
  const sourceIndex = new Map(aggregateEventsByName(adjustedDamageEvents, mode).map((s, i) => [s.name, i]))
  const isEventsView = pieChartView === 'events'

  return createPortal(
    <div className="dataOverlay">
      <div className="ui-overlay-backdrop" onClick={onClose} role="presentation" />
      <div className="ui-overlay-panel dataPanel" role="dialog" aria-modal="true" aria-labelledby="dataTitle" style={accentVar(accent)}>

        {/* Header: who acted + headline numbers for this row */}
        <div className="ui-overlay-header">
          <div className="dataHeaderId">
            {acting && <PortraitRing name={acting.name} src={acting.image} size={44} />}
            <div className="dataHeaderIdText">
              <span className="ui-readout-label">{rowInfo ? `Row ${rowInfo.current} · ` : ''}{snapshot.character ?? 'Field Analysis'}</span>
              <h2 id="dataTitle" className="ui-overlay-title">{actionName}</h2>
            </div>
          </div>
          <div className="ui-readouts">
            <Readout label="Total Damage" value={formatInt(totalDamage)} accent />
            <Readout label="DPS" value={dps > 0 ? formatInt(dps) : 'N/A'} />
            <Readout label="Duration" value={duration.toFixed(2)} unit="s" />
            <Readout label="Cast Window" value={`${snapshot.fromTime.toFixed(2)} – ${snapshot.toTime.toFixed(2)}`} unit="s" />
          </div>
          <div className="ui-overlay-header-end">
            {showNav && (
              <div className="ui-pager">
                <button type="button" className="ui-icon-btn" onClick={onPrev} disabled={!hasPrev} title="Previous row (↑)" aria-label="Previous row">▲</button>
                {rowInfo && <span className="ui-pager-count">{rowInfo.current} / {rowInfo.total}</span>}
                <button type="button" className="ui-icon-btn" onClick={onNext} disabled={!hasNext} title="Next row (↓)" aria-label="Next row">▼</button>
              </div>
            )}
            <CloseButton onClick={onClose} />
          </div>
        </div>

        {/* 3-column body */}
        <div className="ui-overlay-body">
          {/* Left — energy flow + acting character's stats */}
          <div className="ui-col dataLeftPanel">
            <EnergySection snapshot={snapshot} previousSnapshot={previousSnapshot} startWithFullEnergy={startWithFullEnergy} characters={characters} />
            <ActiveStatsSection damageEvents={adjustedDamageEvents} activeContribs={activeContribs} contribGroupKeys={contribGroupKeys} characters={characters} snapshot={snapshot} />
          </div>

          {/* Centre — impact dial beside the source ledger, then the hit profile and per-hit log */}
          <div className="ui-col dataCenterPanel">
            <section className="ui-section">
              <SectionHeader label="Impact" />
              <div className="ui-toolbar dataCenterToolbar">
                <SegmentedToggle options={DAMAGE_MODES} value={mode} onChange={setMode} />
                <SegmentedToggle options={PIE_VIEWS} value={pieChartView} onChange={setPieChartView} />
              </div>
            </section>
            <div className="dataImpact">
              <ImpactDial
                damageEvents={adjustedDamageEvents}
                view={pieChartView}
                mode={mode}
                crestSeed={snapshot.character ?? 'Resonance'}
                highlightedIndex={highlightedIndex}
                onSliceHover={setHighlightedIndex}
                activeSources={activeSources}
                activeTypes={activeTypes}
              />
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
            <HitLog
              damageEvents={adjustedDamageEvents}
              mode={mode}
              rowStart={snapshot.fromTime}
              sourceIndex={sourceIndex}
              highlightedIndex={isEventsView ? highlightedIndex : null}
              onHighlight={isEventsView ? setHighlightedIndex : () => {}}
            />
          </div>

          {/* Right — modifier contributions */}
          <div className="ui-col dataRightPanel">
            <ContributionsSection damageEvents={adjustedDamageEvents} mode={mode} characters={characters} snapshot={snapshot} activeSources={activeSources} activeContribs={activeContribs} onToggleContrib={toggleContrib} onToggleAllContribs={toggleAllContribs} contribGroupKeys={contribGroupKeys} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
