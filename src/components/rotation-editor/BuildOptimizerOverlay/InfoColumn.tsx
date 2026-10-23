// Right column: convergence dial (run progress + stats), current build summary and DPS headroom.
import type { Dispatch, SetStateAction } from 'react'
import type { ResolvedCharacter } from '../../../types/character'
import type { RotationStep } from '../../../types/rotation'
import type { EchoOptConfig } from '../../../optimizers/buildOptimizer'
import { BoCog, BoCross, BoDiamond } from './icons'
import { BoKV, BoSectionHeading } from './primitives'

// ========== Component ========================================================================================================

type InfoColumnProps = {
  running: boolean
  ran: boolean
  progress: number
  totalBuilds: number
  steps: RotationStep[]
  globalTier: number
  echoConfig: EchoOptConfig
  selectedChar: ResolvedCharacter | undefined
  echoesOpen: boolean
  setEchoesOpen: Dispatch<SetStateAction<boolean>>
  setConfigOpen: Dispatch<SetStateAction<boolean>>
  headroomDPS: number | null
  headroomPct: number | null
}

export function InfoColumn({
  running,
  ran,
  progress,
  totalBuilds,
  steps,
  globalTier,
  echoConfig,
  selectedChar,
  echoesOpen,
  setEchoesOpen,
  setConfigOpen,
  headroomDPS,
  headroomPct,
}: InfoColumnProps) {
  return (
    <section className="buildOptSectionRight">

      <BoSectionHeading title="Convergence" icon={<BoCross size={12} />} />
      <div className="buildOptConvergenceBox boInsetPanel">
        {/* Dial */}
        <div className="buildOptDial">
          <div className="buildOptDialRingOuter" />
          <div className="buildOptDialRingInner" />
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="buildOptDialTick"
              style={{
                height: i % 6 === 0 ? '12%' : '5%',
                transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-90%)`,
              }}
            />
          ))}
          {/* Needle — sweeps -80° → +80° as progress goes 0 → 1 */}
          <span
            className="buildOptDialNeedle"
            style={{ transform: `translate(-50%, -100%) rotate(${progress * 160 - 80}deg)` }}
          />
          <span className="buildOptDialDot" />
          <div className="buildOptDialCenter">
            <div className="buildOptDialValue">
              {running ? `${Math.round(progress * 100)}%` : ran ? '100%' : '—'}
            </div>
            <div className="buildOptDialSub">CONF.</div>
          </div>
        </div>
        {/* Stats beside dial */}
        <div className="buildOptDialStats">
          <BoKV k="Builds" v={
            running
              ? `${Math.round(progress * totalBuilds)} / ${totalBuilds}`
              : totalBuilds > 0 ? String(totalBuilds) : '—'
          } />
          <BoKV k="Rotation" v={ran || running ? `${steps.length} steps` : '—'} />
          <BoKV k="Tier" v={String(globalTier)} />
          <BoKV k="Substats" v={
            (() => {
              const total = ([1,2,3,4,5] as const)
                .reduce((n, s) => n + (echoConfig[s]?.substatGroupSize ?? 0), 0)
              return total > 0 ? String(total) : '—'
            })()
          } />
        </div>
      </div>

      <BoSectionHeading title="Current Build" icon={<BoDiamond size={12} />} />
      <div className="buildOptCurrentBox boInsetPanel">
        {selectedChar ? (
          <>
            {(() => {
              const slots = selectedChar.gear.echoSlots
              const setNames = ([1, 2, 3, 4, 5] as const)
                .map(s => slots[s]?.setName)
                .filter((n): n is string => n !== undefined)
              const uniqueSets = [...new Set(setNames)]
              return (
                <>
                  <BoKV k="Sequence" v={`S${selectedChar.sequence}`} />
                  <BoKV k="Weapon" v={
                    selectedChar.gear.weapon
                      ? `${selectedChar.gear.weapon.name} R${selectedChar.gear.weapon.rank}`
                      : '—'
                  } />
                  <BoKV k="Set" v={
                    uniqueSets.length === 0 ? '—' :
                    uniqueSets.length === 1 ? uniqueSets[0] :
                    `${uniqueSets.length} sets`
                  } />
                  <button
                    className={`buildOptEchoesToggle${echoesOpen ? ' active' : ''}`}
                    onClick={() => { setEchoesOpen(true); setConfigOpen(false) }}
                  >
                    <span className="buildOptEchoesToggleLeft">
                      <BoCog
                        size={14}
                        teeth={8}
                        className={`buildOptHeaderCog ${echoesOpen ? 'boCogSpinFast' : 'boCogSpin'}`}
                      />
                      <span>Echoes</span>
                    </span>
                    <span>&#x25b6;</span>
                  </button>
                </>
              )
            })()}
          </>
        ) : (
          <div className="buildOptEmptyNote">No character selected</div>
        )}
      </div>

      {ran && headroomDPS !== null && (
        <>
          <BoSectionHeading title="Headroom" icon={<BoDiamond size={12} />} />
          <div className="buildOptGapBox boInsetPanel">
            <div className="buildOptGapValue">
              {headroomDPS.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="buildOptGapLabel">DPS gap</div>
            {headroomPct !== null && (
              <div className="buildOptGapPct">
                {headroomPct > 0 ? `+${headroomPct.toFixed(1)}%` : '—'}
              </div>
            )}
            <div className="buildOptGapSub">best vs. current</div>
          </div>
        </>
      )}
    </section>
  )
}
