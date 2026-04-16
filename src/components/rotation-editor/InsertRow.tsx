import '../../styles/rotation-editor/InsertRow.css'

// ========== Component: Insert Row ============================================================================================

type InsertRowProps = {
  onInsert: () => void
  alwaysVisible?: boolean
}

export function InsertRow({ onInsert, alwaysVisible = false }: InsertRowProps) {
  return (
    <tr className={`insertRow${alwaysVisible ? ' insertRowAlwaysVisible' : ''}`}>
      <td colSpan={999}>
        <button
          type="button"
          className="insertRowBtn"
          onClick={onInsert}
          title="Insert a flex block here"
        >
          + Insert Flex Block
        </button>
      </td>
    </tr>
  )
}
