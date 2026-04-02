import { useState } from 'react'
import '../../styles/rotation-editor/CharacterStateTracker.css'
import { CharacterProfileOverlay } from './CharacterProfileOverlay'
import type { Snapshot } from '../../types/snapshot'
import type { Character } from '../../types/character'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'
import type { Gear } from '../../types/gear'

// ========== Component: Character State Tracker ===============================================================================

type CharacterStateTrackerProps = {
  snapshot: Snapshot | null
  charactersInBattle: Character[]
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
  activeCharacterName?: string | null
  onGearChange?: (characterName: string, newGear: Gear) => void
}

export function CharacterStateTracker({
  snapshot,
  charactersInBattle,
  tableConfig,
  columnVisibility,
  setColumnVisibility,
  activeCharacterName,
  onGearChange,
}: CharacterStateTrackerProps) {
  const [profileOpen, setProfileOpen] = useState<string | null>(null)

  // ========== Column Visibility Helpers ======================================================================================

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

  // ========== Early Exit Guards ==============================================================================================

  if (tableConfig.characters.length === 0) return null

  // ========== Derived State Helpers ==========================================================================================

  // Goal 1: compute swap cooldown remaining
  function getSwapCooldownRemaining(characterName: string) {
    if (!snapshot) return 0
    const cooldownUntil = snapshot.charactersSwapCooldownUntil?.[characterName] ?? 0
    return Math.max(0, cooldownUntil - snapshot.toTime)
  }

  // Goal 2: compute effective position for display
  // Rules:
  // - Active → own position
  // - Inactive within persistence → own position
  // - Otherwise → mirror active character
  function getDisplayPosition(characterName: string) {
    if (!snapshot) {
      return {
        position: 'GROUND' as const,
        isWithinPersistence: false,
        persistentUntil: 0,
      }
    }

    const stored = snapshot.charactersPositions?.[characterName] ?? 'GROUND'
    const persistentUntil = snapshot.charactersPersistentUntil?.[characterName] ?? 0
    const isActive = snapshot.character === characterName
    const isWithinPersistence = persistentUntil > 0 && snapshot.toTime <= persistentUntil

    const activeCharPosition =
      snapshot.character
        ? snapshot.charactersPositions?.[snapshot.character] ?? 'GROUND'
        : 'GROUND'

    const position = isActive || isWithinPersistence ? stored : activeCharPosition

    return { position, isWithinPersistence, persistentUntil }
  }

  // Goal 3: resolve form (fallback to default)
  function getDisplayForm(character: Character) {
    if (!snapshot) {
      return (
        character.forms?.find(f => f.name === character.defaultForm) ??
        character.forms?.[0]
      )
    }

    const currentFormName = snapshot.charactersForms?.[character.name] ?? ''
    const currentForm = character.forms?.find(f => f.name === currentFormName)

    if (currentForm) return currentForm

    const defaultFormName = character.defaultForm ?? character.forms?.[0]?.name
    return character.forms?.find(f => f.name === defaultFormName)
  }

  return (
    <>
      <div className="stateTracker">
        {tableConfig.characters.map(group => {
          const character = charactersInBattle.find(c => c.name === group.label)
          if (!character) return null

          const visibleColumns = group.columns.filter(col => columnVisibility[col.key])

          // ========== Derived Data ===========================================================================================

          const energies = snapshot?.charactersEnergies[character.name] ?? {}
          const swapCooldownRemaining = getSwapCooldownRemaining(character.name)

          const {
            position: displayPosition,
            isWithinPersistence,
            persistentUntil,
          } = getDisplayPosition(character.name)

          const isActiveChar = snapshot?.character === character.name
          const isOffField = !isActiveChar && !isWithinPersistence

          const comboTags = !isOffField
            ? (snapshot?.charactersComboChainTags?.[character.name] ?? [])
            : []

          const displayForm = getDisplayForm(character)
          const isActive = activeCharacterName === group.label

          // ========== Render ================================================================================================

          return (
            <div key={group.label} className={`stateTrackerCard${isActive ? ' stateTrackerCard--active' : ''}`}>

              {/* Profile Button */}
              <button
                type="button"
                className="stateTrackerGearBtn"
                onClick={() => setProfileOpen(group.label)}
                title="Character Profile"
              >
                <img src="/assets/ui/gear.png" alt="Profile" />
              </button>

              {/* Header */}
              <div className="stateTrackerHeader">
                {group.nametag ? (
                  <div className="stateTrackerNametag">
                    <img
                      src={group.nametag}
                      alt={group.label}
                      className="stateTrackerNametagImg"
                      onClick={() => handleGroupClick(group.columns)}
                    />
                    <span className="stateTrackerNametagLabel">{group.label}</span>
                  </div>
                ) : (
                  <>
                    <img src={group.icon} alt={group.label} className="stateTrackerCharIcon" />
                    <span className="stateTrackerCharName">{group.label}</span>
                  </>
                )}
              </div>

              {/* State Section */}
              <div className="stateTrackerStates">

                {/* Position */}
                <div className="stateTrackerStateItem">
                  <span className="stateTrackerStateLabel">Position</span>
                  {isOffField ? (
                    <span className="stateTrackerPositionBadge stateTrackerPositionBadge--offfield">
                      Off Field
                    </span>
                  ) : (
                    <span className={`stateTrackerPositionBadge stateTrackerPositionBadge--${displayPosition.toLowerCase()}`}>
                      {displayPosition === 'AIR' ? '▲ Air' : '▼ Ground'}
                    </span>
                  )}
                </div>

                {/* Form */}
                {displayForm && (
                  <div className="stateTrackerStateItem">
                    <span className="stateTrackerStateLabel">Form</span>
                    <span className="stateTrackerFormBadge">
                      {displayForm.displayName || displayForm.name}
                    </span>
                  </div>
                )}

                {/* Lingers (ONLY inactive + within persistence) */}
                {isWithinPersistence && !isActiveChar && (
                  <div className="stateTrackerStateItem">
                    <span className="stateTrackerStateLabel">Lingers</span>
                    <span className="stateTrackerPersistBadge">
                      {(persistentUntil - (snapshot?.toTime ?? 0)).toFixed(2)}s
                    </span>
                  </div>
                )}

                {/* Combo (relies on persistence window being active) */}
                {comboTags.length > 0 && (
                  <div className="stateTrackerStateItem">
                    <span className="stateTrackerStateLabel">Combo</span>
                    <span className="stateTrackerComboBadge">
                      {comboTags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' · ')}
                    </span>
                  </div>
                )}

                {/* Swap Cooldown */}
                {swapCooldownRemaining > 0 && (
                  <div className="stateTrackerStateItem">
                    <span className="stateTrackerStateLabel">Swap CD</span>
                    <span className="stateTrackerSwapCooldownBadge">
                      {swapCooldownRemaining.toFixed(2)}s
                    </span>
                  </div>
                )}
              </div>

              {/* Energy Section */}
              <div className="stateTrackerEnergies">
                {visibleColumns.map(col => {

                  // Goal 4: forte segmented bar
                  if (col.energyMetadata && col.energyMetadata.length > 1) {
                    const slots = col.energyMetadata.map(meta => ({
                      meta,
                      filled: (energies[meta.key] ?? 0) >= 1,
                    }))

                    const filledCount = slots.filter(s => s.filled).length

                    return (
                      <div key={col.key} className="stateTrackerBarRow">
                        <img src={col.icon} alt={col.label} className="stateTrackerEnergyIcon" onClick={() => toggleColumn(col.key)} />
                        <span className="stateTrackerEnergyLabel">{col.label}</span>
                        <div className="stateTrackerBarWrapper">
                          <div className="stateTrackerForteSegments">
                            {slots.map(slot => (
                              <div
                                key={slot.meta.key}
                                className={`stateTrackerForteSeg${slot.filled ? ' stateTrackerForteSeg--filled' : ''}`}
                                data-forte-slot={slot.meta.key.slice('forte_'.length)}
                                title={slot.meta.label}
                              />
                            ))}
                          </div>
                          <span className="stateTrackerBarText">{filledCount}/{slots.length}</span>
                        </div>
                      </div>
                    )
                  }

                  // Goal 5: regular energy bar
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

      {profileOpen !== null && (() => {
        const profileCharacter = charactersInBattle.find(c => c.name === profileOpen) ?? null
        if (!profileCharacter) return null
        return (
          <CharacterProfileOverlay
            characterName={profileOpen}
            character={profileCharacter}
            snapshot={snapshot}
            allCharacters={charactersInBattle}
            onClose={() => setProfileOpen(null)}
            onGearChange={onGearChange}
          />
        )
      })()}
    </>
  )
}