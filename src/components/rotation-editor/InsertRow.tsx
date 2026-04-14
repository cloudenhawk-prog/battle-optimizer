import '../../styles/rotation-editor/InsertRow.css'

// ========== Component: Insert Row ============================================================================================

type InsertRowProps = {
  onInsert: () => void
}

export function InsertRow({ onInsert }: InsertRowProps) {
  return (
    <tr className="insertRow">
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
