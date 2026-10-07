// Browse step: optional Unequip button and every catalog echo grouped by set
import type { EchoCatalogEntry } from '../../../data/gear/echoCatalog'
import { EchoCard } from './EchoCard'
import { setIconPath } from './echoPickerHelpers'

const FONT_DISPLAY = '"Orbitron", sans-serif'

// ========== Sub-component: Echo Browse List ==================================================================================

type EchoBrowseListProps = {
  hasEquippedEcho: boolean
  allBySet: Array<{ setName: string; entries: EchoCatalogEntry[] }>
  elColor: string
  onUnequip: () => void
  onSelectEntry: (entry: EchoCatalogEntry) => void
}

// Rendered inside the scroll container; the inline <style> hides its WebKit scrollbar.
export function EchoBrowseList({ hasEquippedEcho, allBySet, elColor, onUnequip, onSelectEntry }: EchoBrowseListProps) {
  return (
    <>
      <style>{'.echo-picker-scroll::-webkit-scrollbar { display: none; }'}</style>
      {/* Unequip button — shown only when the slot has an echo equipped */}
      {hasEquippedEcho && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
          <button
            type="button"
            onClick={onUnequip}
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
                    onClick={() => onSelectEntry(entry)}
                    elColor={elColor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
