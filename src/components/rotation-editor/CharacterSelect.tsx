import '../../styles/rotation-editor/CharacterSelect.css'
import type { Character } from '../../types/character'

// ========== Component: Character Select ======================================================================================

type CharacterSelectProps = {
  value: string
  characters: Character[]
  onChange: (characterName: string) => void
  disabled?: boolean
}

export function CharacterSelect({ value, characters, onChange, disabled = false }: CharacterSelectProps) {
  return (
    <select className="characterSelect" value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
      <option value="">-- Select Character --</option>
      {characters.map(c => (
        <option key={c.name} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
