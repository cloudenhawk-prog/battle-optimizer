import { createPortal } from 'react-dom'
import { useState, useCallback, useRef, useEffect } from 'react'
import '../../styles/rotation-editor/BuildOptimizerOverlay.css'
import type { ResolvedCharacter } from '../../types/character'
import type { Enemy } from '../../types/enemy'
import type { TableConfig } from '../../types/tableDefinitions'
import type { Snapshot } from '../../types/snapshot'
import type { Settings } from '../../hooks/useSettings'
import { extractSteps } from '../../utils/importExport'
import { resolveCharacter } from '../../utils/gear/resolveCharacter'
import { replaySteps } from '../../utils/engine/replaySteps'
import { createEmptySnapshot } from '../../hooks/rotation-editor/useSnapshots'
import { weaponCatalog, buildWeapon } from '../../data/gear/weaponCatalog'
import { baseCharacters } from '../../data/characters'
import { negativeStatuses as negativeStatusesData } from '../../data/negativeStatuses'
import type { EngineState } from '../../utils/engine/step'

// ========== Types ============================================================================================================

export type BuildResult = {
  label: string
  weaponName: string
  weaponRank: number
  dps: number
  delta: number
  deltaPct: number
  isCurrent: boolean
}

// ========== Helpers ==========================================================================================================

function buildGlobalColumns(tableConfig: TableConfig) {
  const statusEffectsColumns = tableConfig.statusEffects?.columns ?? []
  const buffsCol = statusEffectsColumns.find(col => col.key === 'buffs')
  const debuffsCol = statusEffectsColumns.find(col => col.key === 'debuffs')
  const negativeStatusesCol = statusEffectsColumns.find(col => col.key === 'negativeStatuses')
  return {
    basic: tableConfig.basic.columns.map(col => col.key),
    buffs: buffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    debuffs: debuffsCol?.statusMetadata?.map(meta => meta.key) ?? [],
    negativeStatuses: negativeStatusesCol?.statusMetadata?.map(meta => meta.key) ?? [],
  }
}

function freshEngineState(): EngineState {
  return {
    negativeStatusesInAction: Object.values(negativeStatusesData).map(status => ({
      negativeStatus: status,
      applicationTime: -1,
      timeLeft: 0,
      currentStacks: 0,
      lastDamageTime: 0,
    })),
    modifiersInAction: [],
    coordinatedAttacksInAction: [],
  }
}

function bestRank(entry: { ranks: Partial<Record<1 | 2 | 3 | 4 | 5, unknown>> }): 1 | 2 | 3 | 4 | 5 | null {
  for (const r of [5, 4, 3, 2, 1] as const) {
    if (entry.ranks[r] !== undefined) return r
  }
  return null
}

function scoreRotation(params: {
  steps: ReturnType<typeof extractSteps>
  charactersMap: Record<string, ResolvedCharacter>
  characterColumnsMap: Record<string, string[]>
  globalColumns: ReturnType<typeof buildGlobalColumns>
  enemy: Enemy
  tableConfig: TableConfig
  settings: Settings
  autocastFollowUps: boolean
}): number {
  const { steps, charactersMap, characterColumnsMap, globalColumns, enemy, tableConfig, settings, autocastFollowUps } = params
  if (steps.length === 0) return 0

  const startingSnapshot = createEmptySnapshot(
    charactersMap,
    characterColumnsMap,
    globalColumns,
    tableConfig,
    settings.startWithFullEnergy,
  )

  const result = replaySteps({
    steps,
    startingSnapshots: [startingSnapshot],
    startingEngineState: freshEngineState(),
    charactersMap,
    characterColumnsMap,
    globalColumns,
    enemy,
    autocastFollowUps,
  })

  if (!result.valid) return 0
  const lastResolved = result.snapshots[result.snapshots.length - 2]
  return lastResolved?.dps ?? 0
}

// ========== Local SVG Components =============================================================================================

function BoCog({
  size = 100,
  teeth = 14,
  className,
}: {
  size?: number
  teeth?: number
  className?: string
}) {
  const cx = 50, cy = 50, rOuter = 47, rInner = 39, hub = 11, bore = 4.5
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      {Array.from({ length: teeth }, (_, i) => {
        const angle = (360 / teeth) * i
        const yTop = cy - rOuter, yBot = cy - rInner + 0.5
        return (
          <polygon
            key={i}
            fill="currentColor"
            transform={`rotate(${angle} ${cx} ${cy})`}
            points={`${cx - 1.6},${yTop} ${cx + 1.6},${yTop} ${cx + 2.6},${yBot} ${cx - 2.6},${yBot}`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="currentColor" strokeWidth={1.1} />
      {Array.from({ length: 5 }, (_, i) => (
        <rect
          key={i}
          x={cx - 0.6}
          y={cy - rInner + 3}
          width={1.2}
          height={rInner - hub - 2}
          fill="currentColor"
          opacity={0.45}
          transform={`rotate(${(360 / 5) * i} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={hub} fill="currentColor" opacity={0.9} />
      <circle cx={cx} cy={cy} r={bore} fill="var(--bo-bg)" />
    </svg>
  )
}

// Build a rounded-rect SVG path string (clockwise, suitable for animateMotion)
function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const cr = Math.min(r, w / 2, h / 2)
  return [
    `M ${x + cr} ${y}`,
    `H ${x + w - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w} ${y + cr}`,
    `V ${y + h - cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + w - cr} ${y + h}`,
    `H ${x + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x} ${y + h - cr}`,
    `V ${y + cr}`,
    `A ${cr} ${cr} 0 0 1 ${x + cr} ${y}`,
    `Z`,
  ].join(' ')
}

function BoEdgeOrbiter() {
  // ViewBox = "0 0 112 92".
  // Panel border: x=6..106, y=6..86 (100×80 units).
  // Cog center rides R=3 units OUTSIDE the panel border.
  // Cog center rect: x=3, y=3, w=106, h=86.
  // Corner radius of that rect = (panel CSS border-radius in viewBox units) + R.
  //   panel CSS border-radius = 28px (fixed pixels).
  //   1 viewBox unit = svgRenderedWidth / 112 pixels  (since SVG width = 1.12 × panelWidth,
  //   and 112 viewBox units span that full SVG width).
  //   → panelBrInUnits = 28 / (svgPx / 112) = 28 × 112 / svgPx
  //   → cogCenterCr = panelBrInUnits + R

  const R      = 3
  const rInner = 2.49
  const hub    = 0.70
  const bore   = 0.29
  const teeth  = 14
  const tw     = 0.10
  const bw     = 0.17
  const gold   = 'oklch(0.86 0.13 88)'

  const svgRef = useRef<SVGSVGElement>(null)
  const [svgWidthPx, setSvgWidthPx] = useState(1321.6) // default = 1180 × 1.12

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      setSvgWidthPx(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Corner radius for the cog-center path in viewBox units
  const panelBrUnits = (28 * 112) / svgWidthPx
  const cogCr        = panelBrUnits + R

  // Rounded rect for the cog center: x=3, y=3, w=106, h=86
  const cogPath = roundedRectPath(3, 3, 106, 86, cogCr)

  // Perimeter of the rounded rect (straight segments + 4 quarter-circle arcs)
  const straightW  = 106 - 2 * cogCr
  const straightH  = 86  - 2 * cogCr
  const perimeter  = 2 * (straightW + straightH) + 2 * Math.PI * cogCr
  // Rolling: full_perimeter / (2π × R) rotations per lap = perimeter / (2π × R) × 360°
  const spinDeg = Math.round((perimeter / (2 * Math.PI * R)) * 360)
  const dur     = '30s'

  return (
    <svg
      ref={svgRef}
      className="buildOptEdgeOrbiter"
      viewBox="0 0 112 92"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Cog center rides R=3 units outside the panel border, on rounded corners */}
        <path id="bo-cog-path" d={cogPath} fill="none" />

        {/* Bloom glow: blurred copy rendered behind the sharp cog */}
        <filter id="bo-cog-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer group: animateMotion translates to path position and rotates to path tangent */}
      <g filter="url(#bo-cog-glow)">
        <animateMotion dur={dur} repeatCount="indefinite" rotate="auto">
          <mpath href="#bo-cog-path" />
        </animateMotion>

        {/* Inner group: rolling spin around the cog's own centre (local origin = cog centre) */}
        <g>
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to={`${spinDeg} 0 0`}
            dur={dur}
            repeatCount="indefinite"
          />

          {/* ── Teeth ── */}
          {Array.from({ length: teeth }, (_, i) => (
            <polygon
              key={i}
              fill={gold}
              transform={`rotate(${(360 / teeth) * i})`}
              points={`${-tw},${-R} ${tw},${-R} ${bw},${-rInner} ${-bw},${-rInner}`}
            />
          ))}

          {/* ── Inner ring (face of body) ── */}
          <circle r={rInner} fill="none" stroke={gold} strokeWidth={0.08} />

          {/* ── Web / spokes (5×) ── */}
          {Array.from({ length: 5 }, (_, i) => (
            <rect
              key={i}
              x={-0.038}
              y={-2.30}
              width={0.077}
              height={1.66}
              fill={gold}
              opacity={0.55}
              transform={`rotate(${(360 / 5) * i})`}
            />
          ))}

          {/* ── Hub disc ── */}
          <circle r={hub} fill={gold} opacity={0.92} />

          {/* ── Bore hole ── */}
          <circle r={bore} fill="var(--bo-bg)" />

          {/* ── Bore detail ring ── */}
          <circle r={bore - 0.05} fill="none" stroke={gold} strokeWidth={0.03} opacity={0.65} />
        </g>
      </g>
    </svg>
  )
}

function BoTriquetra({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <circle cx="20" cy="14" r="7" />
        <circle cx="13" cy="25" r="7" />
        <circle cx="27" cy="25" r="7" />
        <circle cx="20" cy="21" r="2" fill="currentColor" />
      </g>
    </svg>
  )
}

function BoDiamond({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g transform="rotate(45 20 20)">
        <rect x="6" y="6" width="28" height="28" rx="3" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="17" y="17" width="6" height="6" rx="0.8" fill="currentColor" />
      </g>
    </svg>
  )
}

function BoCross({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <path d="M20 4 L20 36 M4 20 L36 20" />
        <circle cx="20" cy="20" r="6" />
      </g>
      <circle cx="20" cy="20" r="1.6" fill="currentColor" />
    </svg>
  )
}

// ========== Sub-components ===================================================================================================

function BoStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="boStat">
      <div className="boStatLabel">{label}</div>
      <div className={`boStatValue${accent ? ' accent' : ''}`}>{value}</div>
    </div>
  )
}

function BoSectionHeading({
  title,
  hint,
  icon,
}: {
  title: string
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="boSectionHeading">
      <div className="boSectionHeadingLeft">
        {icon && <span className="boSectionHeadingIcon">{icon}</span>}
        <span className="boSectionHeadingTitle">{title}</span>
      </div>
      {hint && <span className="boSectionHeadingHint">{hint}</span>}
    </div>
  )
}

function BoKV({ k, v }: { k: string; v: string }) {
  return (
    <div className="boKV">
      <span className="boKVKey">{k}</span>
      <span className="boKVVal">{v}</span>
    </div>
  )
}

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

  const steps = extractSteps(snapshots)
  const hasRotation = steps.length > 0
  const selectedChar = charactersInBattle.find(c => c.name === selectedCharName)

  function handleSelectChar(name: string) {
    setSelectedCharName(name)
    setResults([])
    setRan(false)
  }

  const runOptimizer = useCallback(() => {
    if (!selectedChar || steps.length === 0) return

    setRunning(true)
    setRan(false)

    const globalColumns = buildGlobalColumns(tableConfig)
    const characterColumnsMap = Object.fromEntries(
      charactersInBattle.map(c => [c.name, Object.keys(c.maxEnergies)]),
    )
    const baseCharMap = Object.fromEntries(baseCharacters.map(c => [c.name, c]))
    const baseChar = baseCharMap[selectedChar.name]

    if (!baseChar) {
      setRunning(false)
      return
    }

    const currentCharactersMap = Object.fromEntries(charactersInBattle.map(c => [c.name, c]))
    const currentDPS = scoreRotation({
      steps,
      charactersMap: currentCharactersMap,
      characterColumnsMap,
      globalColumns,
      enemy,
      tableConfig,
      settings,
      autocastFollowUps: true,
    })

    const currentWeaponName = selectedChar.gear.weapon?.name ?? '(no weapon)'
    const currentWeaponRank = selectedChar.gear.weapon?.rank ?? 1

    const candidateResults: BuildResult[] = [
      {
        label: `${currentWeaponName} \u2605${currentWeaponRank} (current)`,
        weaponName: currentWeaponName,
        weaponRank: currentWeaponRank,
        dps: currentDPS,
        delta: 0,
        deltaPct: 0,
        isCurrent: true,
      },
    ]

    for (const entry of weaponCatalog.filter(w => w.weaponType === selectedChar.weaponType)) {
      const rank = bestRank(entry)
      if (rank === null) continue
      if (entry.name === currentWeaponName && rank === currentWeaponRank) continue

      const newWeapon = buildWeapon(entry, rank, selectedChar.name)
      if (!newWeapon) continue

      const candidate = resolveCharacter(baseChar, { ...baseChar.gear, weapon: newWeapon })
      const candidateCharactersMap = { ...currentCharactersMap, [selectedChar.name]: candidate }
      const candidateColumnsMap = {
        ...characterColumnsMap,
        [selectedChar.name]: Object.keys(candidate.maxEnergies),
      }

      const dps = scoreRotation({
        steps,
        charactersMap: candidateCharactersMap,
        characterColumnsMap: candidateColumnsMap,
        globalColumns,
        enemy,
        tableConfig,
        settings,
        autocastFollowUps: true,
      })

      candidateResults.push({
        label: `${entry.name} \u2605${rank}`,
        weaponName: entry.name,
        weaponRank: rank,
        dps,
        delta: 0,
        deltaPct: 0,
        isCurrent: false,
      })
    }

    candidateResults.sort((a, b) => b.dps - a.dps)

    const baseline = candidateResults.find(r => r.isCurrent)?.dps ?? currentDPS
    const withDeltas = candidateResults.map(r => ({
      ...r,
      delta: r.dps - baseline,
      deltaPct: baseline > 0 ? ((r.dps - baseline) / baseline) * 100 : 0,
    }))

    setResults(withDeltas)
    setRunning(false)
    setRan(true)
  }, [selectedChar, steps, charactersInBattle, enemy, tableConfig, settings])

  const bestResult = ran && results.length > 0 ? results[0] : null
  const currentResult = ran ? results.find(r => r.isCurrent) : null
  const headroomDPS = bestResult && currentResult ? bestResult.dps - currentResult.dps : null
  const headroomPct =
    headroomDPS !== null && currentResult && currentResult.dps > 0
      ? (headroomDPS / currentResult.dps) * 100
      : null

  if (!open) return null

  return createPortal(
    <div className="buildOptOverlay" onClick={onClose}>
      <div className="buildOptPanelWrap">
        {/* Edge orbiter lives OUTSIDE the panel so overflow:hidden doesn't clip its teeth */}
        <BoEdgeOrbiter />

        <div className="buildOptPanel" onClick={e => e.stopPropagation()}>

          {/* Decorative background */}
          <div className="buildOptGridOverlay" />
          <BoCog size={520} teeth={22} className="buildOptDecoCogBL" />
          <BoCog size={420} teeth={36} className="buildOptDecoCogBR" />

        {/* ===================== HEADER ===================== */}
        <header className="buildOptHeader">
          <div className="buildOptHeaderLeft">
            <BoTriquetra size={26} className="buildOptHeaderTriquetra" />
            <div className="buildOptHeaderTitles">
              <div className="buildOptHeaderSub">Tacet Forge \u00b7 Module 04</div>
              <h2 className="buildOptHeaderTitle">
                Build <span className="buildOptGold">Optimizer</span>
              </h2>
            </div>
            <span className={`boStatusChip${running ? ' solving' : ran ? ' done' : ''}`}>
              <span className="boStatusDot" />
              {running ? 'Solving' : ran ? 'Done' : 'Ready'}
            </span>
          </div>

          <div className="buildOptHeaderRight">
            <BoStat label="Weapons Tested" value={ran ? String(results.length) : '\u2014'} />
            <span className="boHeaderDivider" />
            <BoStat
              label="Best DPS"
              value={bestResult ? bestResult.dps.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '\u2014'}
              accent
            />
            <span className="boHeaderDivider" />
            <BoStat label="Target" value={selectedCharName || '\u2014'} />
            <BoCog
              size={36}
              teeth={12}
              className={`buildOptHeaderCog${running ? ' boCogSpinFast' : ' boCogSpin'}`}
            />
            <button className="buildOptCloseBtn" onClick={onClose} aria-label="Close">\u2715</button>
          </div>
        </header>

        {/* ===================== BODY ===================== */}
        <div className="buildOptBody">

          {/* LEFT: Rotation + Character selector */}
          <section className="buildOptSectionLeft">
            <BoSectionHeading
              title="Skill Rotation"
              hint={hasRotation ? `${steps.length} steps` : 'empty'}
              icon={<BoTriquetra size={14} />}
            />
            <div className="buildOptRotList boInsetPanel">
              {steps.length === 0 ? (
                <div className="buildOptEmptyNote">No steps \u2014 add actions to the rotation first.</div>
              ) : (
                steps.map((s, i) => (
                  <div key={i} className={`buildOptRotRow${i === 0 ? ' first' : ''}`}>
                    <span className="buildOptRotIdx">{i + 1}</span>
                    <div className="buildOptRotInfo">
                      <div className="buildOptRotChar">{s.character}</div>
                      <div className="buildOptRotAction">{s.action}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <BoSectionHeading title="Optimize For" icon={<BoCross size={14} />} />
            <div className="buildOptCharList">
              {charactersInBattle.map(c => (
                <button
                  key={c.name}
                  className={`buildOptCharBtn${c.name === selectedCharName ? ' active' : ''}`}
                  onClick={() => handleSelectChar(c.name)}
                >
                  <span className="buildOptCharBtnName">{c.name}</span>
                  <span className="buildOptCharBtnType">{c.weaponType}</span>
                </button>
              ))}
            </div>
          </section>

          {/* CENTER: Hero card + Leaderboard */}
          <section className="buildOptSectionCenter">
            {ran && bestResult && (
              <div className="buildOptHeroCard boInsetPanel">
                <BoCog size={220} teeth={48} className="buildOptHeroCog" />
                <div className="buildOptHeroGlow" />
                <div className="buildOptHeroRow">
                  <div className="buildOptHeroLeft">
                    <div className="buildOptHeroIconWrap">
                      <BoTriquetra size={36} className="buildOptHeroTriquetra" />
                      <span className="buildOptHeroRank">#1</span>
                    </div>
                    <div>
                      <div className="buildOptHeroSubLabel">Leading Configuration</div>
                      <h3 className="buildOptHeroName">{bestResult.weaponName}</h3>
                      <div className="buildOptHeroMeta">
                        \u2605{bestResult.weaponRank} \u00b7 {selectedChar?.weaponType}
                      </div>
                    </div>
                  </div>
                  <div className="buildOptHeroRight">
                    <div className="buildOptHeroDpsSub">Average DPS</div>
                    <div className="buildOptHeroDps">
                      {bestResult.dps.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="buildOptHeroDpsNote">{steps.length} steps \u00b7 full rotation</div>
                  </div>
                </div>
              </div>
            )}

            <div className="buildOptLeaderboard boInsetPanel">
              <div className="buildOptLeaderHead">
                <div className="buildOptLeaderHeadLeft">
                  <BoDiamond size={12} className="buildOptLeaderHeadIcon" />
                  <span className="buildOptLeaderHeadLabel">Leaderboard</span>
                </div>
                <div className="buildOptLeaderHeadRight">
                  <span>Sort \u00b7 DPS</span>
                  <span className="buildOptLeaderHeadDivider" />
                  <span>{ran ? `Top ${Math.min(results.length, 20)} / ${results.length}` : '\u2014'}</span>
                </div>
              </div>
              <div className="buildOptLeaderBody">
                {!ran && !running && (
                  <div className="buildOptLeaderEmpty">
                    {hasRotation
                      ? 'Select a character and click Run Optimizer.'
                      : 'Add actions to the rotation first.'}
                  </div>
                )}
                {running && (
                  <div className="buildOptLeaderEmpty">Calculating builds\u2026</div>
                )}
                {ran && results.slice(0, 20).map((r, i) => (
                  <div
                    key={r.label}
                    className={`buildOptLeaderRow${r.isCurrent ? ' current' : ''}${i === 0 ? ' best' : ''}`}
                  >
                    <span className="buildOptLeaderRank">{String(i + 1).padStart(2, '0')}</span>
                    <span className="buildOptLeaderName">
                      {r.weaponName}
                      <span className="buildOptLeaderStar"> \u2605{r.weaponRank}</span>
                      {r.isCurrent && <span className="buildOptLeaderCurrent"> current</span>}
                    </span>
                    <div className="buildOptLeaderBarWrap">
                      <div
                        className="buildOptLeaderBarFill"
                        style={{ width: `${(r.dps / (bestResult?.dps || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="buildOptLeaderDps">
                      {r.dps.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                    <span
                      className={`buildOptLeaderDelta${r.deltaPct > 0 ? ' pos' : r.deltaPct < 0 ? ' neg' : ' neu'}`}
                    >
                      {r.deltaPct === 0 ? '\u2014' : `${r.deltaPct > 0 ? '+' : ''}${r.deltaPct.toFixed(1)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT: Convergence dial + build stats */}
          <section className="buildOptSectionRight">
            <BoSectionHeading title="Convergence" icon={<BoCross size={12} />} />
            <div className="buildOptConvergenceBox boInsetPanel">
              {/* Dial */}
              <div className="buildOptDial">
                <div className="buildOptDialRingOuter" />
                <div className="buildOptDialRingInner" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="buildOptDialTick"
                    style={{
                      height: i % 6 === 0 ? '12%' : '5%',
                      transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-90%)`,
                    }}
                  />
                ))}
                {/* Needle — angle encodes progress through results */}
                <span
                  className="buildOptDialNeedle"
                  style={{
                    transform: ran && results.length > 0
                      ? `translate(-50%, -100%) rotate(${Math.min(160, (results.length / 30) * 160) - 80}deg)`
                      : 'translate(-50%, -100%) rotate(-80deg)',
                  }}
                />
                <span className="buildOptDialDot" />
                <div className="buildOptDialCenter">
                  <div className="buildOptDialValue">
                    {ran ? `${Math.round(Math.min(99, (results.length / 30) * 100))}%` : '—'}
                  </div>
                  <div className="buildOptDialSub">CONF.</div>
                </div>
              </div>
              {/* Stats beside dial */}
              <div className="buildOptDialStats">
                <BoKV k="Builds" v={ran ? String(results.length) : '—'} />
                <BoKV k="Steps" v={String(steps.length)} />
                <BoKV k="Echoes" v="Fixed" />
                <BoKV k="Mode" v="Weapons" />
              </div>
            </div>

            <BoSectionHeading title="Current Build" icon={<BoDiamond size={12} />} />
            <div className="buildOptCurrentBox boInsetPanel">
              {selectedChar ? (
                <>
                  <BoKV k="Weapon" v={selectedChar.gear.weapon?.name ?? '—'} />
                  <BoKV k="Rank" v={selectedChar.gear.weapon ? `★${selectedChar.gear.weapon.rank}` : '—'} />
                  <BoKV k="Type" v={selectedChar.weaponType} />
                  <BoKV k="Element" v={selectedChar.element} />
                </>
              ) : (
                <div className="buildOptEmptyNote">No character selected</div>
              )}
            </div>

            {ran && headroomDPS !== null && (
              <>
                <BoSectionHeading title="Headroom" icon={<BoDiamond size={12} />} />
                <div className="buildOptGapBox boInsetPanel">
                  <div className="buildOptGapValue">
                    {headroomDPS.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="buildOptGapLabel">DPS gap</div>
                  {headroomPct !== null && (
                    <div className="buildOptGapPct">
                      {headroomPct > 0 ? `+${headroomPct.toFixed(1)}%` : '—'}
                    </div>
                  )}
                  <div className="buildOptGapSub">best vs. current</div>
                </div>
              </>
            )}
          </section>
        </div>

        {/* ===================== FOOTER ===================== */}
        <footer className="buildOptFooter">
          <div className="buildOptFooterLeft">
            <button className="buildOptSmallBtn" onClick={onClose}>Close</button>
            {ran && (
              <div className="buildOptFooterInfo">
                {results.length} weapons scored \u00b7 {selectedCharName}
              </div>
            )}
          </div>
          <div className="buildOptFooterRight">
            {!hasRotation && (
              <span className="buildOptFooterWarn">No rotation \u2014 add steps first</span>
            )}
            <button
              className="buildOptRunBtn"
              onClick={runOptimizer}
              disabled={!hasRotation || running}
              aria-label="Run build optimizer"
            >
              <BoCog
                size={18}
                teeth={10}
                className={`buildOptRunCog${running ? ' boCogSpinFast' : ''}`}
              />
              {running ? 'Calculating\u2026' : ran ? 'Re-run' : 'Run Optimizer'}
              {!running && <BoDiamond size={12} className="buildOptRunIcon" />}
            </button>
          </div>
        </footer>

        </div>{/* /buildOptPanel */}
      </div>{/* /buildOptPanelWrap */}
    </div>,
    document.body,
  )
}
