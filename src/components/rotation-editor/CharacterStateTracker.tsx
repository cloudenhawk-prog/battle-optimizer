import { useState } from 'react'
import '../../styles/rotation-editor/CharacterStateTracker.css'
import { CharacterProfileOverlay } from './CharacterProfileOverlay'
import type { Snapshot } from '../../types/snapshot'
import type { Character } from '../../types/character'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'

// ========== Component: Character State Tracker ===============================================================================

type CharacterStateTrackerProps = {
  snapshot: Snapshot | null
  charactersInBattle: Character[]
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
  activeCharacterName?: string | null
}

export function CharacterStateTracker({ snapshot, charactersInBattle, tableConfig, columnVisibility, setColumnVisibility, activeCharacterName }: CharacterStateTrackerProps) {
  const [profileOpen, setProfileOpen] = useState<string | null>(null)

  function handleGroupClick(groupColumns: { key: string }[]) {
    const visibleKeys = groupColumns.filter(col => columnVisibility[col.key]).map(col => col.key)
    if (visibleKeys.length === 0) return
    setColumnVisibility(prev => {
      const updated = { ...prev }
      visibleKeys.forEach(key => {
        updated[key] = false
      })
      return updated
    })
  }

  function toggleColumn(key: string) {
    setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // If no character groups exist, don't render
  if (tableConfig.characters.length === 0) return null

  // Check if any character column is visible
  const anyVisible = tableConfig.characters.some(group => group.columns.some(col => columnVisibility[col.key]))
  if (!anyVisible) return null

  return (
    <>
      <div className="stateTracker">
        {tableConfig.characters.map(group => {
          const character = charactersInBattle.find(c => c.name === group.label)
          if (!character) return null

          const visibleColumns = group.columns.filter(col => columnVisibility[col.key])
          if (visibleColumns.length === 0) return null

          const energies = snapshot?.charactersEnergies[character.name] ?? {}

          // Compute remaining swap cooldown for display
          const swapCooldownUntil = snapshot?.charactersSwapCooldownUntil?.[character.name] ?? 0
          const swapCooldownRemaining = Math.max(0, swapCooldownUntil - (snapshot?.toTime ?? 0))

          // Compute effective position for display:
          // - Active character → use their stored position
          // - Inactive within persistence → use their own stored position
          // - Inactive outside persistence → sync to active character's position
          const storedPosition: 'GROUND' | 'AIR' = snapshot?.charactersPositions?.[character.name] ?? 'GROUND'
          const persistentUntil = snapshot?.charactersPersistentUntil?.[character.name] ?? 0
          const isActiveChar = snapshot?.character === character.name
          const isWithinPersistence = persistentUntil > 0 && (snapshot?.toTime ?? 0) <= persistentUntil
          const activeCharPosition: 'GROUND' | 'AIR' = snapshot?.character ? (snapshot.charactersPositions?.[snapshot.character] ?? 'GROUND') : 'GROUND'
          const displayPosition: 'GROUND' | 'AIR' = isActiveChar || isWithinPersistence ? storedPosition : activeCharPosition

          // Get current form for this character
          const currentFormName = snapshot?.charactersForms?.[character.name] ?? ''
          const currentForm = character.forms?.find(f => f.name === currentFormName)
          const defaultFormName = character.defaultForm ?? character.forms?.[0]?.name
          const defaultForm = character.forms?.find(f => f.name === defaultFormName)
          const displayForm = currentForm || defaultForm

          const isActive = activeCharacterName === group.label

          return (
            <div key={group.label} className={`stateTrackerCard${isActive ? ' stateTrackerCard--active' : ''}`}>
              {/* Gear icon - top right corner */}
              <button type="button" className="stateTrackerGearBtn" onClick={() => setProfileOpen(group.label)} title="Character Profile">
                <img src="/assets/gear.png" alt="Profile" />
              </button>

              {/* Character header */}
              <div className="stateTrackerHeader">
                {group.nametag ? (
                  <div className="stateTrackerNametag">
                    <img src={group.nametag} alt={group.label} className="stateTrackerNametagImg" onClick={() => handleGroupClick(group.columns)} />
                    <span className="stateTrackerNametagLabel">{group.label}</span>
                  </div>
                ) : (
                  <>
                    <img src={group.icon} alt={group.label} className="stateTrackerCharIcon" />
                    <span className="stateTrackerCharName">{group.label}</span>
                  </>
                )}
              </div>

              {/* State section: position + form as labeled chips */}
              <div className="stateTrackerStates">
                <div className="stateTrackerStateItem">
                  <span className="stateTrackerStateLabel">Position</span>
                  {!isActiveChar && !isWithinPersistence ? (
                    <span className="stateTrackerPositionBadge stateTrackerPositionBadge--offfield">Off Field</span>
                  ) : (
                    <span className={`stateTrackerPositionBadge stateTrackerPositionBadge--${displayPosition.toLowerCase()}`}>
                      {displayPosition === 'AIR' ? '▲ Air' : '▼ Ground'}
                    </span>
                  )}
                </div>
                {displayForm && (
                  <div className="stateTrackerStateItem">
                    <span className="stateTrackerStateLabel">Form</span>
                    <span className="stateTrackerFormBadge">
                      {displayForm.icon && <img src={displayForm.icon} alt={displayForm.name} className="stateTrackerFormIcon" />}
                      {displayForm.displayName || displayForm.name}
                    </span>
                  </div>
                )}
                {!isActiveChar && isWithinPersistence && (
                  <div className="stateTrackerStateItem">
                    <span className="stateTrackerStateLabel">Lingers</span>
                    <span className="stateTrackerPersistBadge">{(persistentUntil - (snapshot?.toTime ?? 0)).toFixed(2)}s</span>
                  </div>
                )}
                {swapCooldownRemaining > 0 && (
                  <div className="stateTrackerStateItem">
                    <span className="stateTrackerStateLabel">Swap CD</span>
                    <span className="stateTrackerSwapCooldownBadge">{swapCooldownRemaining.toFixed(2)}s</span>
                  </div>
                )}
              </div>

              {/* Energy bars */}
              <div className="stateTrackerEnergies">
                {visibleColumns.map(col => {
                  const energyType = col.key.slice(col.key.indexOf('_') + 1)
                  const current = energies[energyType] || 0
                  const max = character.maxEnergies[energyType as keyof typeof character.maxEnergies] || 100
                  const percentage = Math.min((current / max) * 100, 100)

                  return (
                    <div key={col.key} className="stateTrackerBarRow">
                      <img src={col.icon} alt={col.label} className="stateTrackerEnergyIcon" onClick={() => toggleColumn(col.key)} />
                      <span className="stateTrackerEnergyLabel">{col.label}</span>
                      <div className="stateTrackerBarWrapper">
                        <div className="stateTrackerBar" style={{ width: `${percentage}%` }} data-energy-type={energyType.toLowerCase()} />
                        <span className="stateTrackerBarText">
                          {Math.floor(current)}/{max}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {profileOpen !== null && <CharacterProfileOverlay characterName={profileOpen} onClose={() => setProfileOpen(null)} />}
    </>
  )
}
