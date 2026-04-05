import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Echo, Gear } from '../../types/gear'
import type { CharacterStats } from '../../types/stats'
import { echoCatalog, type EchoCatalogEntry } from '../../data/gear/echoCatalog'
import { MAIN_STAT_OPTIONS, SUBSTAT_OPTIONS, buildBaseStats, formatSubstatValue } from '../../data/gear/echoStats'

// ========== Types ============================================================================================================

export type EchoPickerModalProps = {
  slot: 1 | 2 | 3 | 4 | 5
  currentGear: Gear
  characterName: string
  elColor: string
  onConfirm: (echo: Echo | null) => void
  onCancel: () => void
}

type SubstatRow = { key: string; value: string }

const EMPTY_SUBSTATS: SubstatRow[] = [
  { key: '', value: '' },
  { key: '', value: '' },
  { key: '', value: '' },
  { key: '', value: '' },
  { key: '', value: '' },
]

// ========== Helpers ==========================================================================================================

function assetPath(path: string): string {
  return path.startsWith('/') ? path : '/' + path
}

function costLabel(cost: 1 | 3 | 4): string {
  return cost === 4 ? '4 Cost' : cost === 3 ? '3 Cost' : '1 Cost'
}

function costBadgeColor(cost: 1 | 3 | 4): string {
  return cost === 4 ? 'hsl(45 100% 55%)' : cost === 3 ? 'hsl(195 80% 55%)' : 'hsl(195 20% 50%)'
}

function setIconPath(setName: string): string {
  return `/assets/gear/set-bonuses/${setName.toLowerCase().replace(/\s+/g, '_')}.png`
}

// ========== Stat Icon Paths & Colors =========================================================================================

const STAT_ICON_PATHS: Record<string, string> = {
  critRate:           '/assets/stat-labels/statLabel_critRate.png',
  critDamage:         '/assets/stat-labels/statLabel_critDamage.png',
  bonusATK:           '/assets/stat-labels/statLabel_ATK.png',
  bonusHP:            '/assets/stat-labels/statLabel_HP.png',
  bonusDEF:           '/assets/stat-labels/statLabel_DEF.png',
  flatATK:            '/assets/stat-labels/statLabel_ATK.png',
  flatHP:             '/assets/stat-labels/statLabel_HP.png',
  flatDEF:            '/assets/stat-labels/statLabel_DEF.png',
  energyPercent:      '/assets/stat-labels/statLabel_energyPercent.png',
  basicBonusDMG:      '/assets/stat-labels/statLabel_basicBonusDMG.png',
  heavyBonusDMG:      '/assets/stat-labels/statLabel_heavyBonusDMG.png',
  skillBonusDMG:      '/assets/stat-labels/statLabel_skillBonusDMG.png',
  liberationBonusDMG: '/assets/stat-labels/statLabel_liberationBonusDMG.png',
  aeroBonusDMG:       '/assets/stat-labels/statLabel_aeroBonusDMG.png',
  spectroBonusDMG:    '/assets/stat-labels/statLabel_spectroBonusDMG.png',
  glacioBonusDMG:     '/assets/stat-labels/statLabel_glacioBonusDMG.png',
  fusionBonusDMG:     '/assets/stat-labels/statLabel_fusionBonusDMG.png',
  electroBonusDMG:    '/assets/stat-labels/statLabel_electroBonusDMG.png',
  havocBonusDMG:      '/assets/stat-labels/statLabel_havocBonusDMG.png',
}

const STAT_COLORS: Record<string, string> = {
  critRate:           'hsl(45 100% 68%)',
  critDamage:         'hsl(45 100% 68%)',
  energyPercent:      'hsl(195 80% 62%)',
  aeroBonusDMG:       'hsl(160 80% 58%)',
  spectroBonusDMG:    'hsl(45 100% 65%)',
  glacioBonusDMG:     'hsl(200 100% 72%)',
  fusionBonusDMG:     'hsl(15 100% 60%)',
  electroBonusDMG:    'hsl(280 100% 68%)',
  havocBonusDMG:      'hsl(270 80% 65%)',
  basicBonusDMG:      'hsl(180 55% 65%)',
  heavyBonusDMG:      'hsl(180 55% 65%)',
  skillBonusDMG:      'hsl(180 55% 65%)',
  liberationBonusDMG: 'hsl(180 55% 65%)',
}

function getStatColor(key: string): string {
  return STAT_COLORS[key] ?? 'rgba(200, 215, 235, 0.9)'
}

// ========== Sub-component: Echo Card =========================================================================================

function EchoCard({
  entry,
  onClick,
  elColor,
}: {
  entry: EchoCatalogEntry
  onClick: () => void
  elColor: string
}) {
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
        boxShadow: 'none',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
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
      {/* Image box */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'rgba(8, 10, 20, 0.9)',
          flexShrink: 0,
          position: 'relative',
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
        {/* Cost badge - corner overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 3,
            right: 3,
            fontSize: '0.52rem',
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            color: costBadgeColor(entry.cost),
            background: 'rgba(6, 8, 16, 0.88)',
            borderRadius: 3,
            padding: '1px 4px',
            lineHeight: 1.4,
            letterSpacing: '0.04em',
          }}>
          {entry.cost}C
        </div>
      </div>

      {/* Name — below the image box */}
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
    </motion.button>
  )
}

// ========== Sub-component: Stat Dropdown ====================================================================================

type StatDropdownOption = {
  key: string
  label: string
  iconPath?: string
  statColor?: string
  valueDisplay?: string
}

function StatDropdown({
  value,
  options,
  placeholder,
  onChange,
  elColor,
}: {
  value: string
  options: StatDropdownOption[]
  placeholder: string
  onChange: (key: string) => void
  elColor: string
}) {
  const [open, setOpen] = useState(false)
  const [panelRect, setPanelRect] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleDown(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handleDown)
    return () => document.removeEventListener('mousedown', handleDown)
  }, [open])

  function handleToggle() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPanelRect({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen(v => !v)
  }

  const selected = options.find(o => o.key === value)

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '9px 11px',
          background: open ? 'rgba(20, 26, 44, 0.98)' : 'rgba(12, 16, 28, 0.9)',
          border: `1px solid ${open ? `hsl(${elColor} / 0.55)` : 'rgba(70, 88, 125, 0.45)'}`,
          borderRadius: 7,
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 0.13s, background 0.13s',
          minWidth: 0,
        }}>
        {selected ? (
          <>
            {selected.iconPath && (
              <img
                src={selected.iconPath}
                alt=""
                style={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, filter: 'brightness(0) invert(1) brightness(0.75)' }}
                onError={e => { ;(e.target as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <span style={{ flex: 1, color: selected.statColor ?? 'rgba(200, 215, 235, 0.9)', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, fontSize: '0.9rem', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected.label}
            </span>
            {selected.valueDisplay && (
              <span style={{ color: selected.statColor ?? `hsl(${elColor} / 0.75)`, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.8rem', flexShrink: 0 }}>
                {selected.valueDisplay}
              </span>
            )}
          </>
        ) : (
          <span style={{ flex: 1, color: 'rgba(90, 108, 145, 0.7)', fontFamily: '"Rajdhani", sans-serif', fontSize: '0.88rem' }}>{placeholder}</span>
        )}
        <span style={{ color: `hsl(${elColor} / 0.45)`, fontSize: '0.55rem', flexShrink: 0, marginLeft: 2 }}>▾</span>
      </button>

      {open && panelRect && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: panelRect.top,
            left: panelRect.left,
            width: panelRect.width,
            zIndex: 500,
            background: 'hsl(222 28% 10%)',
            border: `1px solid hsl(${elColor} / 0.35)`,
            borderRadius: 8,
            boxShadow: '0 12px 40px rgba(0,0,0,0.75)',
            maxHeight: 280,
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}>
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', width: '100%',
              padding: '8px 12px', background: 'transparent', border: 'none',
              borderBottom: '1px solid rgba(50, 68, 105, 0.25)', cursor: 'pointer',
              color: 'rgba(90, 108, 145, 0.65)', fontFamily: '"Rajdhani", sans-serif',
              fontSize: '0.82rem',
            }}>
            — None —
          </button>
          {options.map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { onChange(opt.key); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '8px 12px',
                background: opt.key === value ? `hsl(${elColor} / 0.14)` : 'transparent',
                border: 'none', borderBottom: '1px solid rgba(50, 68, 105, 0.14)',
                cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
              }}
              onMouseEnter={e => { ;(e.currentTarget as HTMLButtonElement).style.background = `hsl(${elColor} / 0.1)` }}
              onMouseLeave={e => { ;(e.currentTarget as HTMLButtonElement).style.background = opt.key === value ? `hsl(${elColor} / 0.14)` : 'transparent' }}>
              {opt.iconPath && (
                <img
                  src={opt.iconPath}
                  alt=""
                  style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0, filter: 'brightness(0) invert(1) brightness(0.75)' }}
                  onError={e => { ;(e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}
              <span style={{ flex: 1, color: opt.statColor ?? 'rgba(200, 215, 235, 0.9)', fontFamily: '"Rajdhani", sans-serif', fontWeight: 600, fontSize: '0.86rem' }}>
                {opt.label}
              </span>
              {opt.valueDisplay && (
                <span style={{ color: opt.statColor ?? `hsl(${elColor} / 0.6)`, fontFamily: '"Share Tech Mono", monospace', fontSize: '0.77rem', flexShrink: 0 }}>
                  {opt.valueDisplay}
                </span>
              )}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}

// ========== Sub-component: Stat Configure Panel ==============================================================================

function StatConfigurePanel({
  entry,
  slot,
  mainStatKey,
  substats,
  elColor,
  onMainStatChange,
  onSubstatChange,
  onBack,
  onConfirm,
}: {
  entry: EchoCatalogEntry
  slot: 1 | 2 | 3 | 4 | 5
  mainStatKey: string
  substats: SubstatRow[]
  elColor: string
  onMainStatChange: (key: string) => void
  onSubstatChange: (index: number, field: 'key' | 'value', val: string) => void
  onBack: () => void
  onConfirm: () => void
}) {
  const cost = entry.cost as 1 | 3 | 4
  const mainOptions = MAIN_STAT_OPTIONS[cost]
  const selectedMainOption = mainOptions.find(o => o.key === mainStatKey)
  const fixedStatLabel = cost === 4 ? 'ATK +150' : cost === 3 ? 'ATK +100' : 'HP +2280'

  const hasValidSubstat = substats.some(s => s.key !== '' && s.value !== '')
  const canConfirm = !!mainStatKey && hasValidSubstat

  const mainDropdownOptions: StatDropdownOption[] = mainOptions.map(o => ({
    key: o.key,
    label: o.label,
    iconPath: STAT_ICON_PATHS[o.key],
    statColor: getStatColor(o.key),
    valueDisplay: `+${(o.value * 100).toFixed(1)}%`,
  }))

  const subDropdownOptions: StatDropdownOption[] = SUBSTAT_OPTIONS.map(o => ({
    key: o.key,
    label: o.label,
    iconPath: STAT_ICON_PATHS[o.key],
    statColor: getStatColor(o.key),
  }))

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '0.68rem',
    fontFamily: '"Orbitron", sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: `hsl(${elColor} / 0.65)`,
    marginBottom: 10,
  }

  const valueSelectStyle: React.CSSProperties = {
    width: 96,
    padding: '9px 7px',
    background: 'rgba(12, 16, 28, 0.9)',
    border: '1px solid rgba(70, 88, 125, 0.45)',
    borderRadius: 7,
    color: 'rgba(200, 215, 235, 0.92)',
    fontFamily: '"Share Tech Mono", monospace',
    fontSize: '0.82rem',
    cursor: 'pointer',
    outline: 'none',
    flexShrink: 0,
    textAlign: 'center',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Echo Header ── */}
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
            onError={e => { ;(e.target as HTMLImageElement).style.opacity = '0.15' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              fontSize: '0.6rem',
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 700,
              color: costBadgeColor(cost),
              background: 'rgba(6, 8, 16, 0.9)',
              borderRadius: 3,
              padding: '2px 5px',
              lineHeight: 1.3,
              letterSpacing: '0.04em',
            }}>
            {cost}C
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'rgba(218, 228, 248, 0.97)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.name}
          </div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: '"Orbitron", sans-serif',
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: costBadgeColor(cost),
                background: 'rgba(8, 10, 20, 0.7)',
                border: `1px solid ${costBadgeColor(cost)}44`,
                borderRadius: 4,
                padding: '2px 7px',
              }}>
              {costLabel(cost)}
            </span>
            <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: '0.75rem', color: `hsl(${elColor} / 0.75)`, fontWeight: 600 }}>
              {entry.setName}
            </span>
            {slot === 1 && entry.firstSlotStats && (
              <span style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: '0.68rem', color: `hsl(${elColor} / 0.5)` }}>
                · Slot 1 bonus
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 1, flexShrink: 0, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.22), transparent)` }} />

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18, scrollbarWidth: 'none' }}>

        {/* Main Stat */}
        <div>
          <div style={sectionLabelStyle}>Main Stat</div>
          <StatDropdown
            value={mainStatKey}
            options={mainDropdownOptions}
            placeholder="— Select main stat —"
            onChange={onMainStatChange}
            elColor={elColor}
          />
          {selectedMainOption && (
            <div
              style={{
                marginTop: 10,
                padding: '8px 12px',
                background: `hsl(${elColor} / 0.07)`,
                border: `1px solid hsl(${elColor} / 0.16)`,
                borderRadius: 7,
                display: 'flex',
                gap: 18,
                flexWrap: 'wrap',
                fontSize: '0.74rem',
                fontFamily: '"Share Tech Mono", monospace',
                color: `hsl(${elColor} / 0.8)`,
              }}>
              <span>{fixedStatLabel}</span>
              <span style={{ color: getStatColor(mainStatKey) }}>
                {selectedMainOption.label} +{(selectedMainOption.value * 100).toFixed(1)}%
              </span>
              {slot === 1 && entry.firstSlotStats && (
                <>
                  {Object.entries(entry.firstSlotStats).map(([k, v]) => {
                    const opt = SUBSTAT_OPTIONS.find(o => o.key === k)
                    return (
                      <span key={k} style={{ color: `hsl(${elColor} / 0.55)` }}>
                        {opt?.label ?? k} +{formatSubstatValue(v as number, true)} (slot 1)
                      </span>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.14), transparent)` }} />

        {/* Substats */}
        <div>
          <div style={sectionLabelStyle}>Sub Stats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {substats.map((sub, i) => {
              const selectedSubOption = SUBSTAT_OPTIONS.find(o => o.key === sub.key)
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, fontSize: '0.65rem', fontFamily: '"Share Tech Mono", monospace', color: 'rgba(90, 108, 145, 0.55)', flexShrink: 0, textAlign: 'right' }}>
                    {i + 1}.
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <StatDropdown
                      value={sub.key}
                      options={subDropdownOptions}
                      placeholder="— None —"
                      onChange={val => onSubstatChange(i, 'key', val)}
                      elColor={elColor}
                    />
                  </div>
                  {selectedSubOption && (
                    <select
                      value={sub.value}
                      onChange={e => onSubstatChange(i, 'value', e.target.value)}
                      style={valueSelectStyle}>
                      {selectedSubOption.values.map(v => (
                        <option key={v} value={String(v)}>
                          {formatSubstatValue(v, selectedSubOption.isPercent)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ flexShrink: 0, padding: '12px 18px', borderTop: `1px solid hsl(${elColor} / 0.14)` }}>
        {mainStatKey && !hasValidSubstat && (
          <div style={{ fontSize: '0.65rem', fontFamily: '"Rajdhani", sans-serif', color: 'rgba(210, 130, 80, 0.85)', textAlign: 'center', marginBottom: 8, letterSpacing: '0.04em' }}>
            At least one substat is required
          </div>
        )}
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
          Confirm Echo
        </button>
      </div>
    </div>
  )
}

// ========== Main Component: EchoPickerModal ==================================================================================

export function EchoPickerModal({ slot, currentGear, characterName: _characterName, elColor, onConfirm, onCancel }: EchoPickerModalProps) {
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
    setSubstats(prev => {
      const next = prev.map(r => ({ ...r }))
      next[index] = { ...next[index], [field]: val }
      if (field === 'key') {
        if (val) {
          const option = SUBSTAT_OPTIONS.find(o => o.key === val)
          const defaultIdx = Math.min(3, (option?.values.length ?? 1) - 1)
          next[index].value = option ? String(option.values[defaultIdx]) : ''
        } else {
          next[index].value = ''
        }
      }
      return next
    })
  }

  function handleConfirm() {
    if (!selectedCatalogEntry || !mainStatKey) return
    const cost = selectedCatalogEntry.cost as 1 | 3 | 4
    const mainOption = MAIN_STAT_OPTIONS[cost].find(o => o.key === mainStatKey)
    if (!mainOption) return

    const subStatsObj: Partial<CharacterStats> = {}
    for (const sub of substats) {
      if (!sub.key || !sub.value) continue
      const num = parseFloat(sub.value)
      if (isNaN(num)) continue
      const existing = (subStatsObj[sub.key as keyof CharacterStats] as number | undefined) ?? 0
      ;(subStatsObj as Record<string, number>)[sub.key] = existing + num
    }

    const echo: Echo = {
      name: selectedCatalogEntry.name,
      setName: selectedCatalogEntry.setName,
      cost: selectedCatalogEntry.cost,
      icon: selectedCatalogEntry.icon,
      info_icon: selectedCatalogEntry.info_icon,
      info: selectedCatalogEntry.info,
      baseStats: buildBaseStats(cost, mainOption.key, mainOption.value),
      subStats: subStatsObj,
      ...(slot === 1 && selectedCatalogEntry.firstSlotStats
        ? { firstSlotStats: selectedCatalogEntry.firstSlotStats }
        : {}),
      ...(selectedCatalogEntry.echoSkill ? { echoSkill: selectedCatalogEntry.echoSkill } : {}),
      ...(selectedCatalogEntry.injectedModifiers ? { injectedModifiers: selectedCatalogEntry.injectedModifiers } : {}),
      ...(selectedCatalogEntry.injectedSideEffects ? { injectedSideEffects: selectedCatalogEntry.injectedSideEffects } : {}),
      ...(selectedCatalogEntry.conditionalStats ? { conditionalStats: selectedCatalogEntry.conditionalStats } : {}),
    }
    onConfirm(echo)
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
              <style>{`.echo-picker-scroll::-webkit-scrollbar { display: none; }`}</style>
                {/* Unequip button — shown only when the slot has an echo equipped */}
                {currentSlotEcho && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
                    <button
                      type="button"
                      onClick={() => onConfirm(null)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: 6,
                        border: `1px solid hsl(${elColor} / 0.45)`,
                        background: `hsl(${elColor} / 0.12)`,
                        color: `hsl(${elColor} / 0.9)`,
                        fontFamily: '"Orbitron", sans-serif',
                        fontWeight: 700,
                        fontSize: '0.62rem',
                        letterSpacing: '0.06em',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = `hsl(${elColor} / 0.22)`
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = `hsl(${elColor} / 0.7)`
                      }}
                      onMouseLeave={e => {
                        ;(e.currentTarget as HTMLButtonElement).style.background = `hsl(${elColor} / 0.12)`
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = `hsl(${elColor} / 0.45)`
                      }}>
                      Unequip
                    </button>
                  </div>
                )}
                {allBySet.length === 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'rgba(100, 115, 145, 0.5)',
                      fontSize: '0.75rem',
                      fontFamily: '"Share Tech Mono", monospace',
                    }}>
                    No echoes in catalog
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
                    {allBySet.map(({ setName, entries }) => (
                      <div key={setName}>
                        {/* Set section header */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 14,
                          }}>
                          <img
                            src={setIconPath(setName)}
                            alt={setName}
                            style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0, opacity: 0.88 }}
                            onError={e => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                          <span
                            style={{
                              fontFamily: FONT_DISPLAY,
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: 'rgba(215, 225, 245, 0.92)',
                              whiteSpace: 'nowrap',
                            }}>
                            {setName}
                          </span>
                          <div style={{ flex: 1, height: 1, background: 'rgba(100, 115, 150, 0.18)', marginLeft: 2 }} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {entries.map(entry => (
                            <EchoCard
                              key={`${entry.setName}-${entry.name}`}
                              entry={entry}
                              onClick={() => {
                                setSelectedCatalogEntry(entry)
                                setMainStatKey('')
                                setSubstats(EMPTY_SUBSTATS.map(r => ({ ...r })))
                              }}
                              elColor={elColor}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>,
    document.body,
  )
}
