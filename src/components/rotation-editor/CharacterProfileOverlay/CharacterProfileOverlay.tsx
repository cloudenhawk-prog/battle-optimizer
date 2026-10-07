// Character profile overlay: portal modal with stats, gear orbit, set bonuses and the gear pickers
import { createPortal } from 'react-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Character } from '../../../types/character'
import type { CharacterStats } from '../../../types/stats'
import type { Snapshot } from '../../../types/snapshot'
import type { Gear } from '../../../types/gear'
import { EchoPickerModal } from '../EchoPickerModal'
import { WeaponPickerModal } from '../WeaponPickerModal'
import { computeGearStatBreakdown, computeActiveModifierBreakdown, computeFinalStats } from '../../../engine/gear/computeStatBreakdown'
import { getTheme, FONT_MONO } from './theme'
import { STAT_DISPLAY } from './statDisplay'
import { tooltipStyle, type TooltipData } from './tooltip'
import { ProfileLeftColumn } from './ProfileLeftColumn'
import { EquipmentOrbit, type OrbitalScanItem } from './EquipmentOrbit'
import { SetBonusSection } from './SetBonusSection'
import { OrbitalScanPanel } from './OrbitalScanPanel'
import { BreakdownModal } from './BreakdownModal'
import { ActiveBuffsPanel } from './ActiveBuffsPanel'
import { ActionDpsPanel } from './ActionDpsPanel'
import '../../../styles/rotation-editor/CharacterStateTracker/01-cards.css'
import '../../../styles/rotation-editor/CharacterStateTracker/02-state-badges.css'
import '../../../styles/rotation-editor/CharacterStateTracker/03-energies.css'
import '../../../styles/rotation-editor/CharacterStateTracker/04-gear-and-stats.css'
import '../../../styles/rotation-editor/CharacterStateTracker/05-breakdown.css'
import '../../../styles/rotation-editor/DataOverlay.css'
import '../../../styles/rotation-editor/CharacterProfileOverlay/01-shell.css'
import '../../../styles/rotation-editor/CharacterProfileOverlay/02-columns.css'
import '../../../styles/rotation-editor/CharacterProfileOverlay/03-breakdown.css'
import '../../../styles/rotation-editor/CharacterProfileOverlay/04-active-buffs.css'
import '../../../styles/rotation-editor/CharacterProfileOverlay/05-action-dps.css'

// ========== Component: Character Profile Overlay =============================================================================

type CharacterProfileOverlayProps = {
  characterName: string
  character: Character
  snapshot: Snapshot | null
  allCharacters: Character[]
  onClose: () => void
  onGearChange?: (characterName: string, newGear: Gear) => void
  onCharacterChange?: (characterName: string) => void
  onSequenceChange?: (characterName: string, sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void
}

export function CharacterProfileOverlay({ characterName, character, snapshot, allCharacters, onClose, onGearChange, onCharacterChange, onSequenceChange }: CharacterProfileOverlayProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [pickerSlot, setPickerSlot] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [weaponPickerOpen, setWeaponPickerOpen] = useState(false)
  const [localSequence, setLocalSequence] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(character.sequence)
  // prevLocalSequence is initialised to -1 so the full arc animates on first open for any sequence level
  const [prevLocalSequence, setPrevLocalSequence] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(-1 as 0 | 1 | 2 | 3 | 4 | 5 | 6) // initially -1 casted to satisfy TS
  const [orbitalItem, setOrbitalItem] = useState<OrbitalScanItem | null>(null)
  const [activeBuffsPanelOpen, setActiveBuffsPanelOpen] = useState(false)
  const [actionDpsPanelOpen, setActionDpsPanelOpen] = useState(false)

  function handleSequenceChange(seq: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
    setPrevLocalSequence(localSequence)
    setLocalSequence(seq)
    onSequenceChange?.(characterName, seq)
  }

  const finalStats = computeFinalStats(character, snapshot, allCharacters)
  const gearBreakdown = computeGearStatBreakdown(character)
  const activeBreakdown = computeActiveModifierBreakdown(character, snapshot, allCharacters)
  const baseStat = character.stats as CharacterStats
  const elTheme = getTheme(character.element)

  function handleClose() {
    setTooltip(null)
    setIsClosing(true)
  }

  const selectedStatDisplay = selectedStat !== null ? (STAT_DISPLAY.find(s => s.key === selectedStat) ?? null) : null

  const charIndex = allCharacters.findIndex(c => c.name === characterName)
  const prevChar = charIndex > 0 ? allCharacters[charIndex - 1] : null
  const nextChar = charIndex < allCharacters.length - 1 ? allCharacters[charIndex + 1] : null
  const showCharNav = onCharacterChange !== undefined && allCharacters.length > 1

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        role="presentation"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(25, 25, 30, 0.75)',
          backdropFilter: 'blur(12px)',
        }}
      />

      {/* Panel */}
      <motion.div
        className="charProfilePanel"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: isClosing ? 0 : 1, scale: isClosing ? 0.96 : 1, y: isClosing ? 16 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onAnimationComplete={() => {
          if (isClosing) onClose()
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="charProfileTitle"
        style={{
          '--cpo-el-raw': elTheme.primary,
          boxShadow: `var(--table-shadow-inner), var(--table-shadow-main), var(--table-shadow-glow), 0 0 60px hsl(${elTheme.primary} / 0.1)`,
          border: `1px solid hsl(${elTheme.primary} / 0.2)`,
        } as React.CSSProperties}>
        {/* Top accent line */}
        <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.6), transparent)` }} />

        {/* Close strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            flexShrink: 0,
            background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.04))`,
          }}>
          {showCharNav ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                className="cpo-nav-btn"
                onClick={() => prevChar && onCharacterChange(prevChar.name)}
                disabled={!prevChar}
                title={prevChar ? `← ${prevChar.name}` : undefined}
                aria-label="Previous character"
                style={{ color: prevChar ? `hsl(${elTheme.primary} / 0.7)` : undefined }}
              >
                ◀
              </button>
              <span style={{ fontFamily: FONT_MONO, fontSize: '10px', color: `hsl(${elTheme.primary} / 0.45)`, minWidth: 20, textAlign: 'center', letterSpacing: '0.04em' }}>
                {charIndex + 1} / {allCharacters.length}
              </span>
              <button
                className="cpo-nav-btn"
                onClick={() => nextChar && onCharacterChange(nextChar.name)}
                disabled={!nextChar}
                title={nextChar ? `${nextChar.name} →` : undefined}
                aria-label="Next character"
                style={{ color: nextChar ? `hsl(${elTheme.primary} / 0.7)` : undefined }}
              >
                ▶
              </button>
            </div>
          ) : (
            <div />
          )}
          <button className="cpo-close-btn" onClick={handleClose} aria-label="Close">
            <img src="/assets/ui/close.png" alt="" style={{ width: 'var(--cpo-close-btn-icon-size)', height: 'var(--cpo-close-btn-icon-size)', display: 'block' }} />
          </button>
        </div>

        {/* Content */}
        <div className="cpo-content">
          <div className="cpo-body">
            {/* ── LEFT COL: Portrait + Stats ── */}
            <ProfileLeftColumn
              character={character}
              elTheme={elTheme}
              finalStats={finalStats}
              sequence={localSequence}
              prevSequence={prevLocalSequence}
              selectedStat={selectedStat}
              onTooltip={setTooltip}
              onSequenceChange={handleSequenceChange}
              onToggleStat={key => setSelectedStat(prev => (prev === key ? null : key))}
              onOpenActiveBuffs={() => setActiveBuffsPanelOpen(true)}
              onOpenActionDps={() => setActionDpsPanelOpen(true)}
            />

            {/* ── CENTER COL: Equipment Orbit + Resonance Chain ── */}
            <div className="cpo-center-col">
              <div className="cpo-orbit-wrap">
                <EquipmentOrbit weapon={character.gear.weapon} echoSlots={character.gear.echoSlots} elColor={elTheme.primary} characterName={characterName} onItemHighlight={setOrbitalItem} onEchoSlotClick={setPickerSlot} onWeaponSlotClick={() => setWeaponPickerOpen(true)} />
              </div>

            </div>

            {/* ── RIGHT COL: Set Bonus (top half) + Orbital Scan (bottom half) ── */}
            <div className="cpo-right-col" style={{ borderLeft: `1px solid hsl(${elTheme.primary} / 0.1)` }}>
              {/* Top half — Set Bonus */}
              <SetBonusSection echoSlots={character.gear.echoSlots} elColor={elTheme.primary} />

              {/* Divider */}
              <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.15), transparent)` }} />

              {/* Bottom half — Orbital Scan */}
              <div style={{ flex: 1, minHeight: 0, overflow: 'hidden auto', display: 'flex', flexDirection: 'column', paddingTop: 12 }}>
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}>
                  <OrbitalScanPanel item={orbitalItem} elColor={elTheme.primary} />
                </motion.div>
              </div>
            </div>

            {/* Breakdown modal — covers entire body */}
            {selectedStatDisplay !== null && (
              <div className="cpo-breakdown-overlay">
                <BreakdownModal statDisplay={selectedStatDisplay} finalStats={finalStats} gearBreakdown={gearBreakdown} activeBreakdown={activeBreakdown} baseStat={baseStat} onClose={() => setSelectedStat(null)} />
              </div>
            )}

            {/* Active buffs panel — covers entire body */}
            {activeBuffsPanelOpen && (
              <div className="cpo-breakdown-overlay">
                <ActiveBuffsPanel activeBreakdown={activeBreakdown} finalStats={finalStats} allCharacters={allCharacters} elColor={elTheme.primary} onClose={() => setActiveBuffsPanelOpen(false)} />
              </div>
            )}

            {/* Action DPS panel — covers entire body */}
            {actionDpsPanelOpen && (
              <div className="cpo-breakdown-overlay">
                <ActionDpsPanel character={character} finalStats={finalStats} snapshot={snapshot} allCharacters={allCharacters} elColor={elTheme.primary} onClose={() => setActionDpsPanelOpen(false)} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elTheme.primary} / 0.3), transparent)` }} />
      </motion.div>

      {/* Floating tooltip */}
      {tooltip && <div style={tooltipStyle(tooltip.x, tooltip.y)}>{tooltip.content}</div>}

      {/* Weapon picker */}
      {weaponPickerOpen && (
        <WeaponPickerModal
          weaponType={character.weaponType}
          characterName={characterName}
          elColor={elTheme.primary}
          onConfirm={newWeapon => {
            const newGear = { ...character.gear, weapon: newWeapon }
            onGearChange?.(characterName, newGear)
            setWeaponPickerOpen(false)
          }}
          onCancel={() => setWeaponPickerOpen(false)}
        />
      )}

      {/* Echo picker */}
      {pickerSlot !== null && (
        <EchoPickerModal
          slot={pickerSlot}
          currentGear={character.gear}
          characterName={characterName}
          elColor={elTheme.primary}
          onConfirm={newEcho => {
            const newEchoSlots = { ...character.gear.echoSlots, [pickerSlot]: newEcho }
            const newGear: Gear = { ...character.gear, echoSlots: newEchoSlots }
            onGearChange?.(characterName, newGear)
            setPickerSlot(null)
          }}
          onCancel={() => setPickerSlot(null)}
        />
      )}
    </>,
    document.body,
  )
}
