import '../../styles/rotation-editor/OptimizerPanel.css'
import { createPortal } from 'react-dom'
import type { OptimizerBlock, DraftStep } from '../../types/optimizerBlock'
import type { ResolvedCharacter } from '../../types/character'
import type { AttemptResult } from '../../hooks/rotation-editor/useOptimizer'

// ========== Types ============================================================================================================

type OptimizerPanelProps = {
  block: OptimizerBlock
  charactersMap: Record<string, ResolvedCharacter>
  result: AttemptResult | null
  isRunning: boolean
  onUpdateBlock: (updates: Partial<Omit<OptimizerBlock, 'id'>>) => void
  onRun: (blockId: string) => void
  onApply: (blockId: string) => void
  onClose: () => void
}

// ========== Helpers ==========================================================================================================

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

// ========== Component: Flex Block Panel ======================================================================================

export function OptimizerPanel({
  block,
  charactersMap,
  result,
  isRunning,
  onUpdateBlock,
  onRun,
  onApply,
  onClose,
}: OptimizerPanelProps) {
  const allCharacterNames = Object.keys(charactersMap)

  function addDraftStep() {
    const defaultChar = allCharacterNames[0] ?? ''
    const newStep: DraftStep = { character: defaultChar, action: '' }
    onUpdateBlock({ draftSteps: [...block.draftSteps, newStep] })
  }

  function removeDraftStep(index: number) {
    const updated = block.draftSteps.filter((_, i) => i !== index)
    onUpdateBlock({ draftSteps: updated })
  }

  function updateDraftStep(index: number, field: keyof DraftStep, value: string) {
    const updated = block.draftSteps.map((s, i) => {
      if (i !== index) return s
      if (field === 'character') return { character: value, action: '' }
      return { ...s, [field]: value }
    })
    onUpdateBlock({ draftSteps: updated })
  }

  return createPortal(
    <div className="optimizerPanelOverlay" onClick={onClose}>
      <div className="optimizerPanel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="optimizerPanelHeader">
          <span className="optimizerPanelTitle">◈ FLEX BLOCK</span>
          <button type="button" className="optimizerPanelClose" onClick={onClose}>✕</button>
        </div>

        <div className="flexPanelBody">
          {/* Draft steps editor */}
          <div className="flexDraftSection">
            <div className="flexDraftLabel">Draft Sequence</div>

            {block.draftSteps.length === 0 && (
              <div className="flexDraftEmpty">No steps yet. Add steps below to attempt.</div>
            )}

            <div className="flexDraftList">
              {block.draftSteps.map((step, idx) => {
                const character = charactersMap[step.character]
                const actions = character ? getUniqueActionNames(character) : []
                return (
                  <div key={idx} className="flexDraftRow">
                    <span className="flexDraftIndex">{idx + 1}</span>
                    <select
                      className="flexDraftSelect"
                      value={step.character}
                      onChange={e => updateDraftStep(idx, 'character', e.target.value)}
                    >
                      <option value="">— character —</option>
                      {allCharacterNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <select
                      className="flexDraftSelect"
                      value={step.action}
                      onChange={e => updateDraftStep(idx, 'action', e.target.value)}
                      disabled={!step.character}
                    >
                      <option value="">— action —</option>
                      {actions.map(a => (
                        <option key={a.raw} value={a.raw}>{a.display}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="flexDraftRemoveBtn"
                      onClick={() => removeDraftStep(idx)}
                      title="Remove this step"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="flexDraftActions">
              <button type="button" className="flexAddStepBtn" onClick={addDraftStep}>
                + Add Step
              </button>
              <button
                type="button"
                className="flexAttemptBtn"
                disabled={isRunning || block.draftSteps.length === 0}
                onClick={() => onRun(block.id)}
              >
                {isRunning ? 'Checking…' : 'Attempt…'}
              </button>
            </div>
          </div>

          {/* Result */}
          {result !== null && (
            <div className={`flexResult ${result.valid ? 'flexResultValid' : 'flexResultInvalid'}`}>
              {result.valid ? (
                <>
                  <span className="flexResultIcon">✓</span>
                  <span className="flexResultText">
                    Rotation is valid — {result.dps !== undefined ? `${result.dps.toFixed(0)} DPS` : ''}
                  </span>
                  <button
                    type="button"
                    className="flexApplyBtn"
                    onClick={() => onApply(block.id)}
                  >
                    Apply
                  </button>
                </>
              ) : (
                <>
                  <span className="flexResultIcon">✗</span>
                  <span className="flexResultText">{result.reason ?? 'Invalid sequence.'}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
