// Action DPS ranking panel: one card per action group, sorted by best variant DPS against the default enemy
import { motion } from 'framer-motion'
import type { Character } from '../../../types/character'
import type { CharacterStats } from '../../../types/stats'
import type { Snapshot } from '../../../types/snapshot'
import { mergeEnemyStats } from '../../../engine/damage/damageCalculator'
import { enemies } from '../../../data/enemies'
import { computeActiveEnemyMods, buildActionEntries } from './actionDamage'
import { formatFlat } from './statDisplay'
import { MUTED, FONT_MONO } from './theme'

// ========== Display Constants ================================================================================================

const ELEMENT_COLORS: Record<string, string> = {
  GLACIO:  '#66d4f8',
  FUSION:  '#ff8c42',
  AERO:    '#5fe49a',
  SPECTRO: '#ffd84d',
  HAVOC:   '#c87cf0',
  ELECTRO: '#b57aff',
}

const DMG_TYPE_LABELS: Record<string, string> = {
  BASIC: 'Basic',
  HEAVY: 'Heavy',
  SKILL: 'Skill',
  LIBERATION: 'Liberation',
  COORDINATED: 'Coordinated',
  ECHO: 'Echo',
  INTRO: 'Intro',
  OUTRO: 'Outro',
}

// Top-3 get special rank colors
const RANK_COLORS = [
  'hsl(45 100% 62%)',  // gold
  'hsl(210 20% 72%)',  // silver
  'hsl(25 70% 55%)',   // bronze
]

// ========== Sub-component: ActionDpsPanel ====================================================================================

type ActionDpsPanelProps = {
  character: Character
  finalStats: CharacterStats
  snapshot: Snapshot | null
  allCharacters: Character[]
  elColor: string
  onClose: () => void
}

export function ActionDpsPanel({ character, finalStats, snapshot, allCharacters, elColor, onClose }: ActionDpsPanelProps) {
  const activeEnemyMods = computeActiveEnemyMods(snapshot, allCharacters)
  const effectiveEnemyStats = mergeEnemyStats(enemies[0].stats, activeEnemyMods)
  const entries = buildActionEntries(character, finalStats, effectiveEnemyStats)

  const maxDps = entries.length > 0 ? entries[0].bestDps : 1

  return (
    <div className="charStatBreakdown adp" style={{ '--cpo-el-raw': elColor } as React.CSSProperties}>
      <div className="charStatBreakdownHeader">
        <span className="charStatBreakdownTitle">Action DPS Ranking</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.68rem', fontFamily: FONT_MONO, color: MUTED, letterSpacing: '0.08em' }}>vs. {enemies[0].name} · Lv.{enemies[0].stats.level} · avg dmg · with buffs</span>
          <button className="cpo-close-btn" onClick={onClose} aria-label="Close action DPS panel">
            <img src="/assets/ui/close.png" alt="" style={{ width: 'var(--cpo-close-btn-icon-size)', height: 'var(--cpo-close-btn-icon-size)', display: 'block' }} />
          </button>
        </div>
      </div>

      <div className="adp-grid-scroll">
        <div className="adp-grid">
          {entries.map(({ groupKey, category, variants, bestDps, bestDamage, topAction }, rankIndex) => {
            const barPct = maxDps > 0 ? (bestDps / maxDps) * 100 : 0
            const rankColor = RANK_COLORS[rankIndex] ?? `hsl(${elColor} / 0.42)`
            const hasVariants = variants.length > 1
            const elems = topAction.elements.filter(e => e !== '')
            const primaryElem = elems[0] ?? ''
            const elemColor = ELEMENT_COLORS[primaryElem] ?? `hsl(${elColor})`
            const activeStatusMods = topAction.statusModifications.filter(m => m.type === 'negativeStatus' || m.type === 'buff' || m.type === 'debuff')
            const dmgTypes = topAction.dmgTypes.filter(t => t !== 'NEGATIVE_STATUS')
            const hasNegStatus = topAction.statusModifications.some(m => m.type === 'negativeStatus')

            return (
              <motion.div
                key={groupKey}
                className="adp-card"
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.26, delay: rankIndex * 0.02, ease: 'easeOut' }}
                style={{
                  '--adp-elem-color': elemColor,
                  '--adp-elem-color-dim': elemColor + '28',
                  border: `1px solid ${elemColor}28`,
                } as React.CSSProperties}
              >
                {/* Top accent line */}
                <div className="adp-card-accent" style={{ background: `linear-gradient(90deg, ${elemColor}bb, transparent)` }} />

                {/* Header: rank badge + category pill */}
                <div className="adp-card-top">
                  <span className="adp-rank" style={{ color: rankColor }}>#{rankIndex + 1}</span>
                  <span className="adp-category" style={{ color: `${elemColor}88` }}>{category}</span>
                </div>

                {/* Icon + name row */}
                <div className="adp-card-identity">
                  {topAction.icon ? (
                    <div className="adp-icon-wrap" style={{ boxShadow: `0 0 12px ${elemColor}33`, border: `1px solid ${elemColor}33` }}>
                      <img
                        src={topAction.icon}
                        alt=""
                        className="adp-icon"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  ) : (
                    <div className="adp-icon-wrap adp-icon-wrap--placeholder" style={{ border: `1px solid ${elemColor}22`, background: `${elemColor}0a` }}>
                      <span className="adp-icon-placeholder" style={{ color: `${elemColor}55` }}>
                        {groupKey.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="adp-name-col">
                    <span className="adp-card-name" title={groupKey}>{groupKey}</span>
                    <div className="adp-chips">
                      {elems.map(el => (
                        <span key={el} className="adp-chip adp-chip--elem" style={{ color: ELEMENT_COLORS[el], background: ELEMENT_COLORS[el] + '18', borderColor: ELEMENT_COLORS[el] + '44' }}>
                          {el[0] + el.slice(1).toLowerCase()}
                        </span>
                      ))}
                      {dmgTypes.map(t => (
                        <span key={t} className="adp-chip adp-chip--type" style={{ color: 'rgba(165,180,215,0.75)', background: 'rgba(100,115,160,0.1)', borderColor: 'rgba(110,125,165,0.2)' }}>
                          {DMG_TYPE_LABELS[t] ?? t}
                        </span>
                      ))}
                      {hasNegStatus && (
                        <span className="adp-chip adp-chip--status" style={{ color: elemColor + 'cc', background: elemColor + '18', borderColor: elemColor + '44' }}>
                          DoT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* DPS hero */}
                <div className="adp-card-dps-wrap">
                  <span className="adp-card-dps" style={{ color: elemColor }}>
                    {formatFlat(Math.round(bestDps))}
                    <span className="adp-dps-unit">/s</span>
                  </span>
                  <span className="adp-card-dmg">{formatFlat(bestDamage)} dmg</span>
                </div>

                {/* Full-width progress bar with percentage label */}
                <div className="adp-card-bar-track">
                  <motion.div
                    className="adp-card-bar-fill"
                    style={{ background: `linear-gradient(90deg, ${elemColor}dd, ${elemColor}44)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.55, delay: rankIndex * 0.02 + 0.12, ease: 'easeOut' }}
                  />
                  <span className="adp-bar-pct" style={{ color: `${elemColor}88` }}>
                    {barPct.toFixed(0)}%
                  </span>
                </div>

                {/* Stats row: labeled multiplier · cast time · scaling */}
                <div className="adp-card-stats">
                  <div className="adp-stat-block">
                    <span className="adp-stat-label">Mult</span>
                    <span className="adp-stat-value" style={{ color: elemColor }}>{(topAction.multiplier * 100).toFixed(0)}%</span>
                  </div>
                  <div className="adp-stat-divider" />
                  <div className="adp-stat-block">
                    <span className="adp-stat-label">Cast</span>
                    <span className="adp-stat-value" style={{ color: 'rgba(185,200,230,0.8)' }}>{topAction.castTime.toFixed(2)}s</span>
                  </div>
                  <div className="adp-stat-divider" />
                  <div className="adp-stat-block">
                    <span className="adp-stat-label">Scale</span>
                    <span className="adp-stat-value" style={{ color: 'rgba(185,200,230,0.8)' }}>{topAction.scaling}</span>
                  </div>
                </div>

                {/* Status modification badges */}
                {activeStatusMods.length > 0 && (
                  <div className="adp-status-row">
                    {activeStatusMods.map((m, i) => {
                      const change = m.stackChange !== undefined ? (m.stackChange > 0 ? `+${m.stackChange}` : `${m.stackChange}`) : ''
                      return (
                        <span key={i} className="adp-status-badge" style={{ color: elemColor, background: elemColor + '15', borderColor: elemColor + '40' }}>
                          {m.targetName}{change}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Variant comparison mini-bars */}
                {hasVariants && (
                  <div className="adp-card-variants" style={{ borderTop: `1px solid ${elemColor}18` }}>
                    {variants.map(({ action, dps }, vi) => {
                      const vPct = bestDps > 0 ? (dps / bestDps) * 100 : 0
                      return (
                        <div key={action.name} className="adp-variant-line">
                          <span className="adp-variant-label" style={{ color: vi === 0 ? 'rgba(190,205,235,0.75)' : MUTED }}>
                            {action.variantName ?? action.displayName}
                          </span>
                          <div className="adp-variant-bar-wrap">
                            <div className="adp-variant-mini-bar" style={{ background: `${elemColor}18` }}>
                              <div style={{ width: `${vPct}%`, height: '100%', background: `${elemColor}${vi === 0 ? 'cc' : '66'}`, borderRadius: 'inherit' }} />
                            </div>
                            <span className="adp-variant-dps-small" style={{ color: `${elemColor}${vi === 0 ? 'cc' : '77'}` }}>
                              {formatFlat(Math.round(dps))}/s
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
