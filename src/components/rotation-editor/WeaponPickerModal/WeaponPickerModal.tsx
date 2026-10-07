// Weapon picker modal: browse weapons of the character's weapon type, then choose a rank and confirm
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import type { Weapon, WeaponType } from '../../../types/gear'
import { weaponCatalog, buildWeapon } from '../../../data/gear/weaponCatalog'
import type { WeaponCatalogEntry } from '../../../data/gear/weaponCatalog'
import { WeaponCard } from './WeaponCard'
import { RankConfigurePanel } from './RankConfigurePanel'

// ========== Types ============================================================================================================

export type WeaponPickerModalProps = {
  weaponType: WeaponType
  characterName: string
  elColor: string
  onConfirm: (weapon: Weapon) => void
  onCancel: () => void
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
