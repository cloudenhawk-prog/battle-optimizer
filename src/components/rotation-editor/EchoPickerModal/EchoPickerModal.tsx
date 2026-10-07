// Echo picker modal: browse the echo catalog, then configure main/sub stats and confirm into a slot
import { createPortal } from 'react-dom'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Echo, Gear } from '../../../types/gear'
import { echoCatalog, type EchoCatalogEntry } from '../../../data/gear/echoCatalog'
import { EMPTY_SUBSTATS, applySubstatChange, buildEchoFromSelection, type SubstatRow } from './echoPickerHelpers'
import { StatConfigurePanel } from './StatConfigurePanel'
import { EchoBrowseList } from './EchoBrowseList'

// ========== Types ============================================================================================================

export type EchoPickerModalProps = {
  slot: 1 | 2 | 3 | 4 | 5
  currentGear: Gear
  characterName: string
  elColor: string
  onConfirm: (echo: Echo | null) => void
  onCancel: () => void
}

// ========== Main Component: EchoPickerModal ==================================================================================

export function EchoPickerModal({ slot, currentGear, elColor, onConfirm, onCancel }: EchoPickerModalProps) {
  const [selectedCatalogEntry, setSelectedCatalogEntry] = useState<EchoCatalogEntry | null>(null)
  const [mainStatKey, setMainStatKey] = useState('')
  const [substats, setSubstats] = useState<SubstatRow[]>(EMPTY_SUBSTATS.map(r => ({ ...r })))

  const currentSlotEcho = currentGear.echoSlots[slot]

  // All catalog entries grouped by set
  const allBySet = Object.entries(echoCatalog)
    .map(([setName, entries]) => ({ setName, entries }))
    .filter(g => g.entries.length > 0)

  const inConfigureStep = selectedCatalogEntry !== null

  function handleSubstatChange(index: number, field: 'key' | 'value', val: string) {
    setSubstats(prev => applySubstatChange(prev, index, field, val))
  }

  function handleConfirm() {
    if (!selectedCatalogEntry || !mainStatKey) return
    const echo = buildEchoFromSelection(selectedCatalogEntry, slot, mainStatKey, substats)
    if (!echo) return
    onConfirm(echo)
  }

  // Picking a card starts the configure step with a clean stat form
  function handleSelectEntry(entry: EchoCatalogEntry) {
    setSelectedCatalogEntry(entry)
    setMainStatKey('')
    setSubstats(EMPTY_SUBSTATS.map(r => ({ ...r })))
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

      {/* Centering wrapper — isolates CSS translate from framer-motion transforms */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 281 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: 'min(820px, 96vw)',
            height: 'min(660px, 92vh)',
            background: 'hsl(222 28% 9%)',
            border: `1px solid hsl(${elColor} / 0.22)`,
            borderRadius: 14,
            boxShadow: `0 28px 90px rgba(0,0,0,0.85), 0 0 50px hsl(${elColor} / 0.09)`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
          {/* Top accent */}
          <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.55), transparent)` }} />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 22px 14px',
              flexShrink: 0,
              borderBottom: `1px solid hsl(${elColor} / 0.12)`,
              background: `linear-gradient(180deg, hsl(${elColor} / 0.07) 0%, transparent 100%)`,
            }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 900,
                  fontSize: '1.15rem',
                  letterSpacing: '0.14em',
                  color: `hsl(${elColor})`,
                  textShadow: `0 0 28px hsl(${elColor} / 0.45)`,
                  textTransform: 'uppercase',
                }}>
                Echo
              </span>
              <span
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 400,
                  fontSize: '0.72rem',
                  letterSpacing: '0.2em',
                  color: `hsl(${elColor} / 0.55)`,
                  textTransform: 'uppercase',
                }}>
                Selection
              </span>
            </div>

            <button
              type="button"
              onClick={onCancel}
              style={{
                background: `hsl(${elColor} / 0.08)`,
                border: `1px solid hsl(${elColor} / 0.2)`,
                borderRadius: 6,
                color: `hsl(${elColor} / 0.7)`,
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: '4px 8px',
                lineHeight: 1,
                fontFamily: FONT_DISPLAY,
                transition: 'all 0.15s',
              }}>
              ✕
            </button>
          </div>

          {/* Body */}
          <AnimatePresence mode="wait">
            {inConfigureStep ? (
              <motion.div
                key="configure"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2 }}
                style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <StatConfigurePanel
                  entry={selectedCatalogEntry!}
                  slot={slot}
                  mainStatKey={mainStatKey}
                  substats={substats}
                  elColor={elColor}
                  onMainStatChange={setMainStatKey}
                  onSubstatChange={handleSubstatChange}
                  onBack={() => setSelectedCatalogEntry(null)}
                  onConfirm={handleConfirm}
                />
              </motion.div>
            ) : (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="echo-picker-scroll"
                style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '18px 22px', scrollbarWidth: 'none' }}>
                <EchoBrowseList hasEquippedEcho={!!currentSlotEcho} allBySet={allBySet} elColor={elColor} onUnequip={() => onConfirm(null)} onSelectEntry={handleSelectEntry} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>,
    document.body,
  )
}
