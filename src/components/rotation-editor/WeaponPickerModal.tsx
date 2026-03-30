import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { Weapon, WeaponType } from '../../types/gear'
import { weaponCatalog, buildWeapon } from '../../data/gear/weaponCatalog'
import type { WeaponCatalogEntry } from '../../data/gear/weaponCatalog'

// ========== Types ============================================================================================================

export type WeaponPickerModalProps = {
  weaponType: WeaponType
  characterName: string
  elColor: string
  onConfirm: (weapon: Weapon) => void
  onCancel: () => void
}

// ========== Helpers ==========================================================================================================

function assetPath(path: string): string {
  return path.startsWith('/') ? path : '/' + path
}

/**
 * Wraps rank-scaling numbers (e.g. "10%/14%/18%/22%/26%") in colored spans.
 * Numbers and % signs are highlighted; slashes are dimmed.
 */
function colorizeInfo(text: string, elColor: string) {
  const pattern = /(\d+(?:[.,]\d+)*|[%/])/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    parts.push(
      <span key={match.index} style={{ color: `hsl(${elColor})`, fontWeight: 600 }}>
        {match[0]}
      </span>,
    )
    lastIndex = pattern.lastIndex
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <>{parts}</>
}

// ========== Sub-component: Weapon Card (browse screen) =======================================================================

function WeaponCard({
  entry,
  onClick,
  elColor,
}: {
  entry: WeaponCatalogEntry
  onClick: () => void
  elColor: string
}) {
  const definedRanks = ([1, 2, 3, 4, 5] as const).filter(r => entry.ranks[r] !== undefined)

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.13 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        width: 108,
        padding: '10px 8px 10px',
        borderRadius: 10,
        border: '1.5px solid rgba(80, 95, 130, 0.28)',
        background: 'rgba(16, 20, 32, 0.75)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = `hsl(${elColor} / 0.55)`
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 14px hsl(${elColor} / 0.2)`
        ;(e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(160deg, hsl(${elColor} / 0.1), rgba(16, 20, 32, 0.75))`
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(80, 95, 130, 0.28)'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(16, 20, 32, 0.75)'
      }}>
      {/* Image */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'rgba(8, 10, 20, 0.9)',
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
        <img
          src={assetPath(entry.icon)}
          alt={entry.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => {
            ;(e.target as HTMLImageElement).style.opacity = '0.15'
          }}
        />
      </div>

      {/* Name */}
      <span
        style={{
          fontSize: '0.72rem',
          fontFamily: '"Rajdhani", sans-serif',
          fontWeight: 600,
          color: 'rgba(195, 208, 230, 0.92)',
          textAlign: 'center',
          lineHeight: 1.25,
          width: '100%',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          minHeight: '2.3em',
        }}>
        {entry.name}
      </span>

      {/* Available ranks badge */}
      <span
        style={{
          fontSize: '0.6rem',
          fontFamily: '"Orbitron", sans-serif',
          color: `hsl(${elColor} / 0.55)`,
          letterSpacing: '0.06em',
        }}>
        R{definedRanks.join('/')}
      </span>
    </motion.button>
  )
}

// ========== Sub-component: Rank Configure Panel ==============================================================================

function RankConfigurePanel({
  entry,
  selectedRank,
  elColor,
  onRankSelect,
  onBack,
  onConfirm,
}: {
  entry: WeaponCatalogEntry
  selectedRank: 1 | 2 | 3 | 4 | 5 | null
  elColor: string
  onRankSelect: (rank: 1 | 2 | 3 | 4 | 5) => void
  onBack: () => void
  onConfirm: () => void
}) {
  const rankData = selectedRank !== null ? entry.ranks[selectedRank] : undefined
  const canConfirm = selectedRank !== null && rankData !== undefined
  // Stats are identical across ranks — read from the first defined rank for display
  const statsData = ([1, 2, 3, 4, 5] as const).map(r => entry.ranks[r]).find(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Weapon Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px 12px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: `1px solid hsl(${elColor} / 0.3)`,
            borderRadius: 6,
            color: `hsl(${elColor} / 0.8)`,
            fontSize: '0.68rem',
            padding: '5px 10px',
            cursor: 'pointer',
            fontFamily: '"Orbitron", sans-serif',
            flexShrink: 0,
          }}>
          ← Back
        </button>

        <div
          style={{
            position: 'relative',
            width: 64,
            height: 64,
            borderRadius: 10,
            overflow: 'hidden',
            background: 'rgba(8, 10, 20, 0.9)',
            border: `1.5px solid hsl(${elColor} / 0.3)`,
            flexShrink: 0,
            boxShadow: `0 0 18px hsl(${elColor} / 0.18)`,
          }}>
          <img
            src={assetPath(entry.icon)}
            alt={entry.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={e => {
              ;(e.target as HTMLImageElement).style.opacity = '0.15'
            }}
          />
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'rgba(210, 222, 240, 0.95)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
            {entry.name}
          </div>
          <div
            style={{
              fontSize: '0.7rem',
              fontFamily: '"Orbitron", sans-serif',
              color: `hsl(${elColor} / 0.65)`,
              letterSpacing: '0.06em',
              marginTop: 2,
            }}>
            {entry.weaponType}
          </div>
        </div>
      </div>

      <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.22), transparent)` }} />

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18, scrollbarWidth: 'none' }}>

        {/* Rank selection */}
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontFamily: '"Orbitron", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: `hsl(${elColor} / 0.65)`,
              marginBottom: 12,
            }}>
            Rank
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([1, 2, 3, 4, 5] as const).map(rank => {
              const available = entry.ranks[rank] !== undefined
              const isSelected = selectedRank === rank
              return (
                <button
                  key={rank}
                  type="button"
                  disabled={!available}
                  onClick={() => available && onRankSelect(rank)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: 8,
                    border: `1.5px solid ${isSelected ? `hsl(${elColor} / 0.7)` : available ? `hsl(${elColor} / 0.3)` : 'rgba(50, 60, 80, 0.35)'}`,
                    background: isSelected
                      ? `linear-gradient(135deg, hsl(${elColor} / 0.28), hsl(${elColor} / 0.1))`
                      : available
                        ? 'rgba(20, 26, 44, 0.7)'
                        : 'rgba(14, 17, 28, 0.4)',
                    color: isSelected ? `hsl(${elColor})` : available ? 'rgba(185, 198, 220, 0.9)' : 'rgba(80, 88, 108, 0.4)',
                    fontFamily: '"Orbitron", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: available ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? `0 0 10px hsl(${elColor} / 0.2)` : 'none',
                  }}>
                  R{rank}
                </button>
              )
            })}
          </div>
          {!([1, 2, 3, 4, 5] as const).some(r => entry.ranks[r] !== undefined && r !== selectedRank) && selectedRank === null && (
            <p style={{ margin: '8px 0 0', fontSize: '0.72rem', color: 'rgba(120, 135, 160, 0.6)', fontFamily: '"Rajdhani", sans-serif' }}>
              Select a rank to continue.
            </p>
          )}
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.14), transparent)` }} />

        {/* Stats */}
        {statsData && (
          <div>
            <div
              style={{
                fontSize: '0.68rem',
                fontFamily: '"Orbitron", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: `hsl(${elColor} / 0.65)`,
                marginBottom: 10,
              }}>
              Stats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Object.entries(statsData.stats)
                .filter(([, v]) => typeof v === 'number' && v !== 0)
                .map(([k, v]) => {
                  const label = STAT_LABELS[k] ?? k
                  const formatted = k === 'baseATK' ? Math.round(v as number).toString() : `${((v as number) * 100).toFixed(1)}%`
                  return (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: '"Rajdhani", sans-serif' }}>
                      <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
                      <span style={{ color: `hsl(${elColor} / 0.9)`, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatted}</span>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.14), transparent)` }} />

        {/* Weapon info */}
        <div>
          <div
            style={{
              fontSize: '0.68rem',
              fontFamily: '"Orbitron", sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: `hsl(${elColor} / 0.65)`,
              marginBottom: 10,
            }}>
            Passive
          </div>
          <p style={{ margin: 0, fontSize: '0.78rem', fontFamily: '"Rajdhani", sans-serif', color: 'rgba(175, 190, 215, 0.85)', lineHeight: 1.6 }}>
            {colorizeInfo(entry.info, elColor)}
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ flexShrink: 0, padding: '12px 18px', borderTop: `1px solid hsl(${elColor} / 0.14)` }}>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canConfirm}
          style={{
            width: '100%',
            padding: '11px 16px',
            borderRadius: 8,
            border: `1.5px solid ${canConfirm ? `hsl(${elColor} / 0.65)` : 'rgba(55, 65, 88, 0.4)'}`,
            background: canConfirm
              ? `linear-gradient(135deg, hsl(${elColor} / 0.24), hsl(${elColor} / 0.09))`
              : 'rgba(18, 22, 34, 0.4)',
            color: canConfirm ? `hsl(${elColor})` : 'rgba(90, 108, 145, 0.45)',
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            cursor: canConfirm ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}>
          Confirm Weapon
        </button>
      </div>
    </div>
  )
}

// ========== Stat label map (for display in the rank panel) ===================================================================

const STAT_LABELS: Record<string, string> = {
  baseATK: 'Base ATK',
  bonusATK: 'ATK%',
  bonusHP: 'HP%',
  bonusDEF: 'DEF%',
  flatATK: 'ATK',
  flatHP: 'HP',
  flatDEF: 'DEF',
  critRate: 'Crit Rate',
  critDamage: 'Crit DMG',
  energyPercent: 'Energy Regen',
  healingBonus: 'Healing Bonus',
  aeroBonusDMG: 'Aero DMG',
  spectroBonusDMG: 'Spectro DMG',
  glacioBonusDMG: 'Glacio DMG',
  fusionBonusDMG: 'Fusion DMG',
  electroBonusDMG: 'Electro DMG',
  havocBonusDMG: 'Havoc DMG',
  basicBonusDMG: 'Basic ATK DMG',
  heavyBonusDMG: 'Heavy ATK DMG',
  skillBonusDMG: 'Skill DMG',
  liberationBonusDMG: 'Liberation DMG',
}

// ========== Main Component: WeaponPickerModal ================================================================================

export function WeaponPickerModal({ weaponType, characterName, elColor, onConfirm, onCancel }: WeaponPickerModalProps) {
  const [selectedEntry, setSelectedEntry] = useState<WeaponCatalogEntry | null>(null)
  const [selectedRank, setSelectedRank] = useState<1 | 2 | 3 | 4 | 5 | null>(null)

  const availableWeapons = weaponCatalog.filter(e => e.weaponType === weaponType)

  function handleSelectEntry(entry: WeaponCatalogEntry) {
    setSelectedEntry(entry)
    // Pre-select the first available rank
    const firstRank = ([1, 2, 3, 4, 5] as const).find(r => entry.ranks[r] !== undefined) ?? null
    setSelectedRank(firstRank)
  }

  function handleBack() {
    setSelectedEntry(null)
    setSelectedRank(null)
  }

  function handleConfirm() {
    if (!selectedEntry || selectedRank === null) return
    const weapon = buildWeapon(selectedEntry, selectedRank, characterName)
    if (!weapon) return
    onConfirm(weapon)
  }

  const FONT_DISPLAY = '"Orbitron", sans-serif'

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 280,
          background: 'rgba(10, 12, 20, 0.6)',
        }}
      />

      {/* Centering wrapper */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 281 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            width: 520,
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 14,
            background: 'linear-gradient(160deg, hsl(222 30% 10%), hsl(220 25% 8%))',
            border: `1px solid hsl(${elColor} / 0.25)`,
            boxShadow: `0 24px 80px rgba(0,0,0,0.8), 0 0 40px hsl(${elColor} / 0.08)`,
            overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}>

          {/* ── Header Bar ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              borderBottom: `1px solid hsl(${elColor} / 0.14)`,
              flexShrink: 0,
            }}>
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: '0.72rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: `hsl(${elColor} / 0.8)`,
              }}>
              {selectedEntry ? 'Select Rank' : `${weaponType} — Select Weapon`}
            </span>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(130, 145, 175, 0.6)',
                fontSize: '1rem',
                cursor: 'pointer',
                padding: '2px 6px',
                lineHeight: 1,
              }}>
              ✕
            </button>
          </div>

          {/* ── Body ── */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {selectedEntry === null ? (
              /* Browse screen */
              <div style={{ height: '100%', overflowY: 'auto', padding: '16px 18px', scrollbarWidth: 'none' }}>
                {availableWeapons.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px 0',
                      color: 'rgba(100, 115, 145, 0.5)',
                      fontFamily: '"Orbitron", sans-serif',
                      fontSize: '0.72rem',
                      letterSpacing: '0.1em',
                    }}>
                    NO WEAPONS AVAILABLE
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {availableWeapons.map(entry => (
                      <WeaponCard key={entry.name} entry={entry} onClick={() => handleSelectEntry(entry)} elColor={elColor} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Rank configure screen */
              <RankConfigurePanel
                entry={selectedEntry}
                selectedRank={selectedRank}
                elColor={elColor}
                onRankSelect={setSelectedRank}
                onBack={handleBack}
                onConfirm={handleConfirm}
              />
            )}
          </div>
        </motion.div>
      </div>
    </>,
    document.body,
  )
}
