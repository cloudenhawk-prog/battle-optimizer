// Custom stat dropdown (icon + label + value) whose option list is portalled to body to escape overflow clipping
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'

// ========== Sub-component: Stat Dropdown ====================================================================================

export type StatDropdownOption = {
  key: string
  label: string
  iconPath?: string
  statColor?: string
  valueDisplay?: string
}

export function StatDropdown({
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
