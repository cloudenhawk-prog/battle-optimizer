import RotationEditor from "../components/rotation-editor/RotationEditor"
import { characters } from "../data/characters"
import { enemies } from "../data/enemies.ts"

export default function RotationEditorPage() {
  return (
    <div>
      <RotationEditor charactersInBattle={characters} enemy={enemies[0]} />
    </div>
  )
}
