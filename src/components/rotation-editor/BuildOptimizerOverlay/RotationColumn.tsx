// Left column: read-only list of the rotation steps and the "Optimize For" character picker.
import type { ResolvedCharacter } from '../../../types/character'
import type { RotationStep } from '../../../types/rotation'
import { BoCross, BoDiamond } from './icons'
import { BoSectionHeading } from './primitives'

// ========== Component ========================================================================================================

type RotationColumnProps = {
  steps: RotationStep[]
  hasRotation: boolean
  charactersInBattle: ResolvedCharacter[]
  selectedCharName: string
  handleSelectChar: (name: string) => void
}

export function RotationColumn({ steps, hasRotation, charactersInBattle, selectedCharName, handleSelectChar }: RotationColumnProps) {
  return (
    <section className="buildOptSectionLeft">
      <BoSectionHeading
        title="Skill Rotation"
        hint={hasRotation ? `${steps.length} steps` : 'empty'}
        icon={<BoDiamond size={12} />}
      />
      <div className="buildOptRotList boInsetPanel">
        {steps.length === 0 ? (
          <div className="buildOptEmptyNote">No steps \u2014 add actions to the rotation first.</div>
        ) : (
          steps.map((s, i) => (
            <div key={i} className={`buildOptRotRow${i === 0 ? ' first' : ''}`}>
              <span className="buildOptRotIdx">{i + 1}</span>
              <div className="buildOptRotInfo">
                <div className="buildOptRotChar">{s.character}</div>
                <div className="buildOptRotAction">{s.action}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <BoSectionHeading title="Optimize For" icon={<BoCross size={14} />} />
      <div className="buildOptCharList">
        {charactersInBattle.map(c => (
          <button
            key={c.name}
            className={`buildOptCharBtn${c.name === selectedCharName ? ' active' : ''}`}
            onClick={() => handleSelectChar(c.name)}
          >
            <span className="buildOptCharBtnName">{c.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
