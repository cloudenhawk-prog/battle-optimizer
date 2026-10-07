// Configure step: main stat + up to 5 substats for the chosen echo, with confirm footer
import type { EchoCatalogEntry } from '../../../data/gear/echoCatalog'
import { MAIN_STAT_OPTIONS, SUBSTAT_OPTIONS, formatSubstatValue } from '../../../data/gear/echoStats'
import { assetPath } from '../CharacterProfileOverlay/theme'
import { StatDropdown, type StatDropdownOption } from './StatDropdown'
import { STAT_ICON_PATHS, costBadgeColor, costLabel, getStatColor, type SubstatRow } from './echoPickerHelpers'

// ========== Sub-component: Stat Configure Panel ==============================================================================

export function StatConfigurePanel({
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
