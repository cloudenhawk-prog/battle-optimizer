import RotationEditor from "../components/rotation-editor/RotationEditor"
import { characters } from "../data/characters"

export default function RotationEditorPage() {
  return (
    <div>
      <RotationEditor charactersInBattle={characters} />
    </div>
  )
}
