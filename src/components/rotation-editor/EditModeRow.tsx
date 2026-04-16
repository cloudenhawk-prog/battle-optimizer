import '../../styles/rotation-editor/EditModeRow.css'
import type { EditModeEntry } from '../../types/editMode'
import type { ResolvedCharacter } from '../../types/character'

// ========== Component: Edit Mode Row =========================================================================================

type EditModeRowProps = {
  entry: EditModeEntry
  charactersMap: Record<string, ResolvedCharacter>
  onUpdate: (id: string, updates: Partial<{ character: string; action: string }>) => void
  onRemove: (id: string) => void
}

function getUniqueActionNames(character: ResolvedCharacter): Array<{ display: string; raw: string }> {
  const seen = new Set<string>()
  const result: Array<{ display: string; raw: string }> = []
  for (const action of character.actions) {
    if (action.category === 'Testing') continue
    if (action.tags?.includes('INTRO_ACTION') || action.tags?.includes('OUTRO_ACTION')) continue
    const raw = action.groupName ?? action.name
    if (!seen.has(raw)) {
      seen.add(raw)
      result.push({ display: action.displayName || action.name, raw })
    }
  }
  return result
}

export function EditModeRow({ entry, charactersMap, onUpdate, onRemove }: EditModeRowProps) {
  const charNames = Object.keys(charactersMap)
  const character = entry.character ? charactersMap[entry.character] : null
  const actions = character ? getUniqueActionNames(character) : []

  return (
    <tr className="editModeRow">
      <td colSpan={999}>
        <div className="editModeRowContent">
          <span className="editModeRowLabel">+ NEW STEP</span>
          <select
            className="editModeRowSelect"
            value={entry.character}
            onChange={e => onUpdate(entry.id, { character: e.target.value, action: '' })}
          >
            <option value="">— character —</option>
            {charNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            className="editModeRowSelect"
            value={entry.action}
            onChange={e => onUpdate(entry.id, { action: e.target.value })}
            disabled={!entry.character}
          >
            <option value="">— action —</option>
            {actions.map(a => (
              <option key={a.raw} value={a.raw}>{a.display}</option>
            ))}
          </select>
          <button
            type="button"
            className="editModeRowRemoveBtn"
            onClick={() => onRemove(entry.id)}
            title="Remove this step"
          >
            ✕
          </button>
        </div>
      </td>
    </tr>
  )
}
