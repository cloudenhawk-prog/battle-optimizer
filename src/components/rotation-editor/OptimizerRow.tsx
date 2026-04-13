import '../../styles/rotation-editor/OptimizerRow.css'
import type { OptimizerBlock } from '../../types/optimizerBlock'

// ========== Component: Optimizer Row =========================================================================================

type OptimizerRowProps = {
  block: OptimizerBlock
  onConfigure: (blockId: string) => void
  onRemove: (blockId: string) => void
}

export function OptimizerRow({ block, onConfigure, onRemove }: OptimizerRowProps) {
  const requiredCount = block.requiredActions.length
  const bannedCount = block.bannedActions.length

  return (
    <tr className="optimizerRow">
      <td colSpan={999}>
        <div className="optimizerRowContent">
          <span className="optimizerRowLabel">◈ OPTIMIZER</span>
          <span className="optimizerRowCharacter">{block.character || '—'}</span>
          <span className="optimizerRowDuration">
            {block.minDuration}s – {block.maxDuration}s
          </span>
          {requiredCount > 0 && (
            <span className="optimizerRowTag optimizerRowTagRequired" title={`Required: ${block.requiredActions.map(r => r.minCount > 1 ? `${r.action} ×${r.minCount}` : r.action).join(', ')}`}>
              {requiredCount} required
            </span>
          )}
          {bannedCount > 0 && (
            <span className="optimizerRowTag optimizerRowTagBanned" title={`Banned: ${block.bannedActions.join(', ')}`}>
              {bannedCount} banned
            </span>
          )}
          <div className="optimizerRowSpacer" />
          <button
            type="button"
            className="optimizerRowBtn optimizerRowBtnRun"
            onClick={() => onConfigure(block.id)}
          >
            Configure & Run
          </button>
          <button
            type="button"
            className="optimizerRowBtn optimizerRowBtnDelete"
            onClick={() => onRemove(block.id)}
            title="Remove optimizer block"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  )
}
