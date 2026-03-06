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
}

export function CharacterStateTracker({ snapshot, charactersInBattle, tableConfig, columnVisibility, setColumnVisibility }: CharacterStateTrackerProps) {
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

          const energies = (snapshot?.charactersEnergies as any)?.[character.name] || {}

          return (
            <div key={group.label} className="stateTrackerCard">
              {/* Gear icon - top right corner */}
              <button
                type="button"
                className="stateTrackerGearBtn"
                onClick={() => setProfileOpen(group.label)}
                title="Character Profile"
              >
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

              {/* Energy bars */}
              <div className="stateTrackerEnergies">
                {visibleColumns.map(col => {
                  const energyType = col.key.split('_')[1]
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

      {profileOpen !== null && (
        <CharacterProfileOverlay characterName={profileOpen} onClose={() => setProfileOpen(null)} />
      )}
    </>
  )
}
