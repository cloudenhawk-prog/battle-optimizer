// Floating tooltip data + fixed-position style (clamped to the viewport's right edge)

// ========== Tooltip ==========================================================================================================

export type TooltipData = { x: number; y: number; content: React.ReactNode }

export function tooltipStyle(x: number, y: number): React.CSSProperties {
  const W = 340
  return {
    position: 'fixed',
    left: Math.min(x + 14, window.innerWidth - W - 8),
    top: Math.max(y - 16, 8),
    zIndex: 300,
    pointerEvents: 'none',
    background: 'hsl(222 28% 9%)',
    border: '1px solid rgba(100, 120, 170, 0.28)',
    borderRadius: 8,
    padding: '10px 12px',
    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.75)',
    color: 'var(--table-text)',
    maxWidth: W,
    fontSize: '0.8rem',
    lineHeight: 1.5,
  }
}
