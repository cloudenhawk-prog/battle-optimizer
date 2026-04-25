import '../../styles/topbar/TopbarButton.css'

// ========== Component: Topbar Button =========================================================================================

interface TopbarButtonProps {
  visible: boolean
  onClick: () => void
}

export default function TopbarButton({ visible, onClick }: TopbarButtonProps) {
  return (
    <button className={`topbar-ghost ${visible ? 'visible' : 'hidden'}`} onClick={onClick} aria-label={visible ? 'Hide topbar' : 'Show topbar'} aria-expanded={visible} title={visible ? 'Hide topbar' : 'Show topbar'}>
      <img src="/assets/ui/circle-icon.svg" alt="topbar toggle" />
    </button>
  )
}
