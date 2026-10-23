// Build optimizer footer: Configure / Export buttons, run summary and the Run Optimizer button.
import type { Dispatch, SetStateAction } from 'react'
import { BoCog, BoDiamond } from './icons'

// ========== Component ========================================================================================================

type FooterProps = {
  configOpen: boolean
  setConfigOpen: Dispatch<SetStateAction<boolean>>
  setEchoesOpen: Dispatch<SetStateAction<boolean>>
  running: boolean
  ran: boolean
  resultsCount: number
  selectedCharName: string
  hasRotation: boolean
  exportConfig: () => void
  runOptimizer: () => void
}

export function Footer({
  configOpen,
  setConfigOpen,
  setEchoesOpen,
  running,
  ran,
  resultsCount,
  selectedCharName,
  hasRotation,
  exportConfig,
  runOptimizer,
}: FooterProps) {
  return (
    <footer className="buildOptFooter">
      <div className="buildOptFooterLeft">
        <button
          className={`buildOptSmallBtn${configOpen ? ' active' : ''}`}
          onClick={() => { setConfigOpen(v => !v); setEchoesOpen(false) }}
          aria-label="Echo configuration"
        >
          <BoCog
            size={14}
            teeth={8}
            className={`buildOptHeaderCog ${configOpen || running ? 'boCogSpinFast' : 'boCogSpin'}`}
          />
          Configure
        </button>
        {ran && (
          <button
            className="buildOptSmallBtn"
            onClick={exportConfig}
            aria-label="Export configuration"
          >
            ↓ Export
          </button>
        )}
        {ran && (
          <div className="buildOptFooterInfo">
            {resultsCount} builds tested · {selectedCharName}
          </div>
        )}
      </div>
      <div className="buildOptFooterRight">
        {!hasRotation && (
          <span className="buildOptFooterWarn">No rotation \u2014 add steps first</span>
        )}
        <button
          className="buildOptRunBtn"
          onClick={runOptimizer}
          disabled={!hasRotation || running}
          aria-label="Run build optimizer"
        >
          <BoCog
            size={18}
            teeth={10}
            className={`buildOptRunCog${running ? ' boCogSpinFast' : ''}`}
          />
          {running ? 'Calculating\u2026' : ran ? 'Re-run' : 'Run Optimizer'}
          {!running && <BoDiamond size={12} className="buildOptRunIcon" />}
        </button>
      </div>
    </footer>
  )
}
