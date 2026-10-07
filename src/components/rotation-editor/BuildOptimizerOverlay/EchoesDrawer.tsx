// Echo Substats drawer: read-only list of the selected character's equipped echoes and their substats.
import type { Dispatch, SetStateAction } from 'react'
import type { ResolvedCharacter } from '../../../types/character'
import type { CharacterStats } from '../../../types/stats'
import { SUBSTAT_OPTIONS } from '../../../data/gear/echoStats'
import { BoDiamond } from './icons'

// ========== Component ========================================================================================================

type EchoesDrawerProps = {
  echoesOpen: boolean
  setEchoesOpen: Dispatch<SetStateAction<boolean>>
  selectedChar: ResolvedCharacter | undefined
}

export function EchoesDrawer({ echoesOpen, setEchoesOpen, selectedChar }: EchoesDrawerProps) {
  return (
    <div className={`buildOptDrawer${echoesOpen ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="buildOptDrawerInner">
        <div className="buildOptDrawerHead">
          <div className="buildOptDrawerTitle">
            <BoDiamond size={14} />
            Echo Substats
          </div>
          <button
            className="buildOptCloseBtn"
            onClick={() => setEchoesOpen(false)}
            aria-label="Close echoes"
          >
            ✕
          </button>
        </div>
        <div className="buildOptConfigSection buildOptEchoConfig">
          {!selectedChar ? (
            <div className="buildOptEmptyNote">No character selected.</div>
          ) : (
            ([1, 2, 3, 4, 5] as const).map(slot => {
              const echo = selectedChar.gear.echoSlots[slot]
              return (
                <div key={slot} className={`buildOptEchoDetailSlot${echo ? '' : ' empty'}`}>
                  <div className="buildOptEchoDetailHead">
                    <span className="buildOptEchoDetailSlotNum">E{slot}</span>
                    {echo
                      ? <span className="buildOptEchoDetailName">{echo.name}</span>
                      : <span className="buildOptEchoDetailEmpty">empty</span>
                    }
                    {echo && <span className="buildOptEchoDetailCost">C{echo.cost}</span>}
                  </div>
                  {echo && (
                    <div className="buildOptEchoDetailSubs">
                      {Object.entries(echo.subStats).map(([key, val]) => {
                        const opt = SUBSTAT_OPTIONS.find(s => s.key === (key as keyof CharacterStats))
                        const label = opt?.label ?? key
                        const formatted = opt?.isPercent
                          ? `${((val as number) * 100).toFixed(1)}%`
                          : String(val)
                        return (
                          <span key={key} className="buildOptEchoDetailSub">
                            {label} {formatted}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
