// Center column: hero card for the #1 build and the top-20 DPS leaderboard with per-echo detail rows.
import type { Dispatch, SetStateAction } from 'react'
import type { BuildResult } from '../../../optimizers/buildOptimizer'
import { BoCog, BoDiamond, BoTriquetra } from './icons'

// ========== Component ========================================================================================================

type ResultsColumnProps = {
  ran: boolean
  running: boolean
  hasRotation: boolean
  results: BuildResult[]
  bestResult: BuildResult | null
  heroExpanded: boolean
  setHeroExpanded: Dispatch<SetStateAction<boolean>>
  expandedLeaderRow: string | null
  setExpandedLeaderRow: Dispatch<SetStateAction<string | null>>
}

// Leaderboard rows are keyed by label; the "current" row has no details so it can't be expanded.
export function ResultsColumn({
  ran,
  running,
  hasRotation,
  results,
  bestResult,
  heroExpanded,
  setHeroExpanded,
  expandedLeaderRow,
  setExpandedLeaderRow,
}: ResultsColumnProps) {
  return (
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
                {(() => {
                  const mainLines = bestResult.details?.filter(l => l.includes('[')) ?? []
                  return mainLines.length > 0
                    ? <div className="buildOptHeroMainStats">{mainLines.map(l => l.split(' · ')[0]).join('  ·  ')}</div>
                    : <div className="buildOptHeroMainStats buildOptHeroMainStatsEmpty">Substat-only run</div>
                })()}
                <button
                  className="buildOptHeroDetailsBtn"
                  onClick={() => setHeroExpanded(v => !v)}
                >
                  {heroExpanded ? '▴ Less' : '▾ Details'}
                </button>
                {heroExpanded && bestResult.details && bestResult.details.length > 0 && (
                  <div className="buildOptHeroDetailBox">
                    {bestResult.details.map(line => (
                      <div key={line} className="buildOptHeroDetailLine">{line}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="buildOptHeroRight">
              <div className="buildOptHeroDpsSub">Average DPS</div>
              <div className="buildOptHeroDps">
                {bestResult.dps.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
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
            <span>Sort DPS</span>
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
            <div key={r.label}>
              <div
                className={`buildOptLeaderRow${r.isCurrent ? ' current' : ''}${i === 0 ? ' best' : ''}`}
              >
                <span className="buildOptLeaderRank">{String(i + 1).padStart(2, '0')}</span>
                <span className="buildOptLeaderName" title={r.label}>
                  {r.label}
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
                {!r.isCurrent && r.details && r.details.length > 0 && (
                  <button
                    className={`buildOptLeaderExpandBtn${expandedLeaderRow === r.label ? ' open' : ''}`}
                    onClick={() => setExpandedLeaderRow(prev => prev === r.label ? null : r.label)}
                    title="Per-echo breakdown"
                  >›</button>
                )}
              </div>
              {expandedLeaderRow === r.label && r.details && (
                <div className="buildOptLeaderDetail">
                  {r.details.map(line => (
                    <span key={line} className="buildOptLeaderDetailLine">{line}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
