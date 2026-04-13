import '../../styles/rotation-editor/OptimizerPanel.css'
import { createPortal } from 'react-dom'
import type { OptimizerBlock, RequiredAction } from '../../types/optimizerBlock'
import type { ResolvedCharacter } from '../../types/character'
import type { ScoredCandidate } from '../../utils/optimizer/score'
import type { OptimizerProgress } from '../../hooks/rotation-editor/useOptimizer'
import type { RotationStep } from '../../utils/importExport'

// ========== Types ============================================================================================================

type OptimizerPanelProps = {
  block: OptimizerBlock
  charactersMap: Record<string, ResolvedCharacter>
  totalStepCount: number
  results: ScoredCandidate[]
  isRunning: boolean
  progress: OptimizerProgress | null
  onUpdateBlock: (updates: Partial<Omit<OptimizerBlock, 'id'>>) => void
  onRun: (blockId: string) => void
  onApply: (blockId: string, steps: RotationStep[]) => void
  onSave: (blockId: string, steps: RotationStep[], name: string) => void
  onExport: (steps: RotationStep[], name: string) => void
  onClose: () => void
}

// ========== Helpers ==========================================================================================================

function formatTime(seconds: number): string {
  return `${seconds.toFixed(1)}s`
}

function getUniqueActionNames(character: ResolvedCharacter): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const action of character.actions) {
    const key = action.groupName ?? action.name
    if (!seen.has(key)) {
      seen.add(key)
      result.push(action.displayName || action.name)
    }
  }
  return result
}

function getRawActionName(character: ResolvedCharacter, displayName: string): string {
  const found = character.actions.find(a => (a.displayName || a.name) === displayName)
  return found?.groupName ?? found?.name ?? displayName
}

// ========== Component: Optimizer Panel =======================================================================================

export function OptimizerPanel({
  block,
  charactersMap,
  totalStepCount,
  results,
  isRunning,
  progress,
  onUpdateBlock,
  onRun,
  onApply,
  onSave,
  onExport,
  onClose,
}: OptimizerPanelProps) {
  const character = charactersMap[block.character]
  const allCharacterNames = Object.keys(charactersMap)
  const actionDisplayNames = character ? getUniqueActionNames(character) : []

  function handleRequiredToggle(displayName: string) {
    if (!character) return
    const rawName = getRawActionName(character, displayName)
    const exists = block.requiredActions.some(r => r.action === rawName)
    if (exists) {
      onUpdateBlock({ requiredActions: block.requiredActions.filter(r => r.action !== rawName) })
    } else {
      onUpdateBlock({ requiredActions: [...block.requiredActions, { action: rawName, minCount: 1 }] })
    }
  }

  function handleRequiredCountChange(displayName: string, count: number) {
    if (!character) return
    const rawName = getRawActionName(character, displayName)
    onUpdateBlock({
      requiredActions: block.requiredActions.map(r =>
        r.action === rawName ? { ...r, minCount: Math.max(1, count) } : r,
      ),
    })
  }

  function handleBannedToggle(displayName: string) {
    if (!character) return
    const rawName = getRawActionName(character, displayName)
    const current = new Set(block.bannedActions)
    if (current.has(rawName)) current.delete(rawName)
    else current.add(rawName)
    onUpdateBlock({ bannedActions: [...current] })
  }

  function isRequired(displayName: string): boolean {
    if (!character) return false
    const rawName = getRawActionName(character, displayName)
    return block.requiredActions.some(r => r.action === rawName)
  }

  function getRequiredEntry(displayName: string): RequiredAction | undefined {
    if (!character) return undefined
    const rawName = getRawActionName(character, displayName)
    return block.requiredActions.find(r => r.action === rawName)
  }

  function isBanned(displayName: string): boolean {
    if (!character) return false
    return block.bannedActions.includes(getRawActionName(character, displayName))
  }

  const topResults = results.slice(0, 20)

  return createPortal(
    <div className="optimizerPanelOverlay" onClick={onClose}>
      <div className="optimizerPanel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="optimizerPanelHeader">
          <span className="optimizerPanelTitle">◈ SEQUENCE OPTIMIZER</span>
          <button type="button" className="optimizerPanelClose" onClick={onClose}>✕</button>
        </div>

        <div className="optimizerPanelBody">
          {/* Left: Config */}
          <div className="optimizerPanelConfig">
            <div className="optimizerConfigSection">
              <label className="optimizerConfigLabel">Character</label>
              <select
                className="optimizerConfigSelect"
                value={block.character}
                onChange={e => onUpdateBlock({ character: e.target.value, requiredActions: [], bannedActions: [] })}
              >
                <option value="">— select —</option>
                {allCharacterNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div className="optimizerConfigSection">
              <label className="optimizerConfigLabel">Block position</label>
              <div className="optimizerConfigRow">
                <span className="optimizerConfigNote">After step</span>
                <input
                  type="number"
                  className="optimizerConfigInput"
                  min={0}
                  max={totalStepCount}
                  value={block.insertAfterStepCount}
                  onChange={e => onUpdateBlock({ insertAfterStepCount: Math.max(0, Math.min(totalStepCount, Number(e.target.value))) })}
                />
                <span className="optimizerConfigNote">of {totalStepCount}</span>
              </div>
            </div>

            <div className="optimizerConfigSection">
              <label className="optimizerConfigLabel">Duration</label>
              <div className="optimizerConfigRow">
                <input
                  type="number"
                  className="optimizerConfigInput"
                  min={0}
                  max={block.maxDuration}
                  step={0.5}
                  value={block.minDuration}
                  onChange={e => onUpdateBlock({ minDuration: Math.max(0, Number(e.target.value)) })}
                />
                <span className="optimizerConfigNote">s min</span>
                <input
                  type="number"
                  className="optimizerConfigInput"
                  min={block.minDuration}
                  max={120}
                  step={0.5}
                  value={block.maxDuration}
                  onChange={e => onUpdateBlock({ maxDuration: Math.max(block.minDuration, Number(e.target.value)) })}
                />
                <span className="optimizerConfigNote">s max</span>
              </div>
            </div>

            {character && actionDisplayNames.length > 0 && (
              <div className="optimizerConfigSection">
                <label className="optimizerConfigLabel">Actions</label>
                <div className="optimizerActionGrid">
                  {actionDisplayNames.map(displayName => {
                    const req = isRequired(displayName)
                    const banned = isBanned(displayName)
                    const reqEntry = getRequiredEntry(displayName)
                    return (
                      <div key={displayName} className={`optimizerActionItem ${req ? 'optimizerActionRequired' : banned ? 'optimizerActionBanned' : ''}`}>
                        <span className="optimizerActionName">{displayName}</span>
                        <div className="optimizerActionButtons">
                          <button
                            type="button"
                            className={`optimizerActionBtn ${req ? 'active' : ''}`}
                            title="Require this action"
                            onClick={() => { if (banned) handleBannedToggle(displayName); handleRequiredToggle(displayName) }}
                          >
                            ✓
                          </button>
                          {req && (
                            <input
                              type="number"
                              className="optimizerActionCount"
                              min={1}
                              max={99}
                              value={reqEntry?.minCount ?? 1}
                              title="Minimum times this action must appear"
                              onClick={e => e.stopPropagation()}
                              onChange={e => handleRequiredCountChange(displayName, Number(e.target.value))}
                            />
                          )}
                          <button
                            type="button"
                            className={`optimizerActionBtn ${banned ? 'activeBanned' : ''}`}
                            title="Ban this action"
                            onClick={() => { if (req) handleRequiredToggle(displayName); handleBannedToggle(displayName) }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              className="optimizerRunBtn"
              disabled={isRunning || !block.character}
              onClick={() => onRun(block.id)}
            >
              {isRunning ? 'Running…' : 'Run'}
            </button>

            {progress !== null && (
              <div className="optimizerProgress">
                {isRunning
                  ? `Scoring ${progress.done} / ${progress.total}…`
                  : `Found ${results.length} valid sequences (from ${progress.total} candidates)`
                }
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="optimizerPanelResults">
            {topResults.length === 0 && !isRunning && progress !== null && (
              <div className="optimizerNoResults">No valid sequences found with these constraints.</div>
            )}
            {topResults.length === 0 && progress === null && (
              <div className="optimizerNoResults">Configure constraints and hit Run to enumerate sequences.</div>
            )}
            {topResults.map((result, i) => (
              <div key={i} className="optimizerResultCard">
                <div className="optimizerResultHeader">
                  <span className="optimizerResultRank">#{i + 1}</span>
                  <span className="optimizerResultDps">{result.score.toFixed(0)} DPS</span>
                  <span className="optimizerResultDuration">{formatTime(result.blockDuration)}</span>
                </div>
                <div className="optimizerResultSteps">
                  {result.steps.map((step, j) => (
                    <span key={j} className="optimizerResultStep">{step.action}</span>
                  ))}
                </div>
                <div className="optimizerResultActions">
                  <button
                    type="button"
                    className="optimizerResultBtn"
                    onClick={() => onApply(block.id, result.steps)}
                    title="Replace optimizer block with this sequence"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    className="optimizerResultBtn"
                    onClick={() => onSave(block.id, result.steps, `Optimizer result #${i + 1}`)}
                    title="Save as a named rotation"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="optimizerResultBtn"
                    onClick={() => onExport(result.steps, `Optimizer result #${i + 1}`)}
                    title="Download as JSON"
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
