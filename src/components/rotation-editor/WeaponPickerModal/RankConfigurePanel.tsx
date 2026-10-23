// Configure step: pick a refinement rank, preview stats + passive, confirm the weapon
import type { WeaponCatalogEntry } from '../../../data/gear/weaponCatalog'
import { assetPath } from '../CharacterProfileOverlay/theme'
import { colorizeText } from '../CharacterProfileOverlay/colorizeText'
import { STAT_LABELS, formatWeaponStat } from './weaponStatLabels'

// ========== Sub-component: Rank Configure Panel ==============================================================================

export function RankConfigurePanel({
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
              {Object.entries(entry.stats)
                .filter(([, v]) => typeof v === 'number' && v !== 0)
                .map(([k, v]) => {
                  const label = STAT_LABELS[k] ?? k
                  const formatted = formatWeaponStat(k, v as number)
                  return (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: '"Rajdhani", sans-serif' }}>
                      <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
                      <span style={{ color: `hsl(${elColor} / 0.9)`, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatted}</span>
                    </div>
                  )
                })}
            </div>
          </div>

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
            {colorizeText(entry.info, elColor)}
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
