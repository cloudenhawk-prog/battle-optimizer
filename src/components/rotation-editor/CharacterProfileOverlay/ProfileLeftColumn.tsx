// Left column: name, portrait (with sequence + level arcs), total stats list and panel buttons
import { motion } from 'framer-motion'
import type { Character } from '../../../types/character'
import type { CharacterStats } from '../../../types/stats'
import type { ElementTheme } from './theme'
import { assetPath, FONT_DISPLAY } from './theme'
import { PORTRAIT_SIZE_PX, PORTRAIT_ARC_DEG, PORTRAIT_OVERFLOW_PX, portraitClipPath } from './portraitGeometry'
import { STAT_DISPLAY, formatStatValue, getStatDisplayValue } from './statDisplay'
import type { TooltipData } from './tooltip'
import { SectionHeader } from '../../shared/ui'
import { PortraitSequenceDisplay } from './PortraitSequenceDisplay'
import { PortraitLeftArc } from './PortraitLeftArc'

// ========== Sub-component: Panel Button ======================================================================================

// Full-width button that opens one of the body-covering panels (Active Buffs / Action DPS)
function PanelButton({ label, delay, marginTop, onClick }: { label: string; delay: number; marginTop: number; onClick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }} style={{ marginTop, flexShrink: 0 }}>
      <button type="button" className="ui-panel-btn" onClick={onClick}>
        {label}
      </button>
    </motion.div>
  )
}

// ========== Sub-component: Profile Left Column ===============================================================================

type SequenceLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6

type ProfileLeftColumnProps = {
  character: Character
  elTheme: ElementTheme
  finalStats: CharacterStats
  sequence: SequenceLevel
  prevSequence: SequenceLevel
  selectedStat: string | null
  onTooltip: (t: TooltipData | null) => void
  onSequenceChange: (seq: SequenceLevel) => void
  onToggleStat: (key: string) => void
  onOpenActiveBuffs: () => void
  onOpenActionDps: () => void
}

export function ProfileLeftColumn({ character, elTheme, finalStats, sequence, prevSequence, selectedStat, onTooltip, onSequenceChange, onToggleStat, onOpenActiveBuffs, onOpenActionDps }: ProfileLeftColumnProps) {
  return (
    <div className="cpo-left-col" style={{ borderRight: `1px solid hsl(${elTheme.primary} / 0.1)` }}>
      {/* Identity */}
      <div className="cpo-identity-block">
        <h2
          id="charProfileTitle"
          style={{
            margin: 0,
            fontFamily: FONT_DISPLAY,
            fontSize: '1.3rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: `hsl(${elTheme.primary})`,
            textShadow: `0 0 22px hsl(${elTheme.primary} / 0.35)`,
          }}>
          {character.name}
        </h2>
      </div>

      {character.image && (
        <div className="cpo-portrait-wrap">
          {/* Circle ring — z-index:-1 within the isolated stacking context places it behind the image
               but above the wrap background, so hair/features can pop out above for a 3D effect */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              transform: 'translateX(-50%)',
              width: 'var(--cpo-portrait-size)',
              height: 'var(--cpo-portrait-size)',
              borderRadius: '50%',
              border: `2px solid hsl(${elTheme.primary} / 0.35)`,
              boxShadow: `0 0 20px hsl(${elTheme.primary} / 0.2)`,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
          <img
            src={assetPath(character.image)}
            alt={character.name}
            className="cpo-portrait"
            style={{
              clipPath: `path('${portraitClipPath(PORTRAIT_SIZE_PX, PORTRAIT_ARC_DEG, PORTRAIT_OVERFLOW_PX)}')`,
              // z-index:1 places the image above the SVG arc tracks from PortraitSequenceDisplay / PortraitLeftArc
              // so the overflow (hair, features) renders on top of those decorative lines.
              // Sequence nodes are at radius 160px — outside the 250px portrait box — so they remain fully interactive.
              position: 'relative',
              zIndex: 1,
            }}
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <PortraitSequenceDisplay sequence={sequence} prevSequence={prevSequence} sequenceNodes={character.sequence_nodes} sequenceNodeIcons={character.sequence_nodes_icons} elColor={elTheme.primary} onTooltip={onTooltip} onSequenceChange={onSequenceChange} />
          <PortraitLeftArc level={(character.stats as Partial<CharacterStats>).level} element={elTheme.label} elColor={elTheme.primary} />
        </div>
      )}

      <SectionHeader label="Total Stats" />

      {STAT_DISPLAY.map((stat, i) => (
        <motion.div key={stat.key} className="cpo-stat-row" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.025, duration: 0.25 }}>
          <div className="cpo-stat-label-group">
            {stat.iconPath && (
              <img
                src={stat.iconPath}
                alt=""
                className={`cpo-stat-icon${stat.elementClass ? ` cpo-stat-icon--element cpo-stat-icon--${stat.elementClass.replace('charStatRow--', '')}` : ''}`}
                onError={e => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            <span className="cpo-stat-label">{stat.label}</span>
          </div>
          <button
            type="button"
            className="cpo-stat-value-btn"
            onClick={() => onToggleStat(stat.key)}
            style={{
              color: selectedStat === stat.key ? `hsl(${elTheme.primary})` : `hsl(${elTheme.primary} / 0.9)`,
            }}>
            {formatStatValue(stat.key, getStatDisplayValue(stat, finalStats), stat.format)}
          </button>
        </motion.div>
      ))}

      {/* Active Buffs Button */}
      <PanelButton label="Active Buffs" delay={0.6} marginTop={14} onClick={onOpenActiveBuffs} />

      {/* Action DPS Button */}
      <PanelButton label="Action DPS" delay={0.65} marginTop={6} onClick={onOpenActionDps} />
    </div>
  )
}
