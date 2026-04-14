import '../../styles/rotation-editor/OptimizerRow.css'
import type { OptimizerBlock } from '../../types/optimizerBlock'

// ========== Component: Flex Block Row ========================================================================================

type OptimizerRowProps = {
  block: OptimizerBlock
  onConfigure: (blockId: string) => void
  onRemove: (blockId: string) => void
}

export function OptimizerRow({ block, onConfigure, onRemove }: OptimizerRowProps) {
  return (
    <tr className="optimizerRow">
      <td colSpan={999}>
        <div className="optimizerRowContent">
          <span className="optimizerRowLabel">◈ FLEX BLOCK</span>
          <div className="optimizerRowSpacer" />
          <button
            type="button"
            className="optimizerRowBtn optimizerRowBtnRun"
            onClick={() => onConfigure(block.id)}
          >
            Edit
          </button>
          <button
            type="button"
            className="optimizerRowBtn optimizerRowBtnDelete"
            onClick={() => onRemove(block.id)}
            title="Remove flex block"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  )
}

