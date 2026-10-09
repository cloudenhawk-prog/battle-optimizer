// Overlay close button (the same close glyph everywhere)

// ========== Component: Close Button ==========================================================================================

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="ui-icon-btn" onClick={onClick} aria-label="Close">
      <img src="/assets/ui/close.png" alt="" />
    </button>
  )
}
