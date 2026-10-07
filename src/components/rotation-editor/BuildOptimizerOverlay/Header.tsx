// Build optimizer panel header: title, run status chip (Ready / Solving / Done) and close button.
import { BoTriquetra } from './icons'

// ========== Component ========================================================================================================

type HeaderProps = {
  running: boolean
  ran: boolean
  onClose: () => void
}

export function Header({ running, ran, onClose }: HeaderProps) {
  return (
    <header className="buildOptHeader">
      <div className="buildOptHeaderLeft">
        <BoTriquetra size={26} className="buildOptHeaderTriquetra" />
        <div className="buildOptHeaderTitles">
          <h2 className="buildOptHeaderTitle">
            Build <span className="buildOptGold">Optimizer</span>
          </h2>
        </div>
        <span className={`boStatusChip${running ? ' solving' : ran ? ' done' : ''}`}>
          <span className="boStatusDot" />
          {running ? 'Solving' : ran ? 'Done' : 'Ready'}
        </span>
      </div>

      <div className="buildOptHeaderRight">
        <button className="buildOptCloseBtn" onClick={onClose} aria-label="Close">
          <img src="/assets/ui/close.png" alt="" style={{ width: 22, height: 22, display: 'block' }} />
        </button>
      </div>
    </header>
  )
}
