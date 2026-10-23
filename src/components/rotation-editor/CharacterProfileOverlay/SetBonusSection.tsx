// Right-column set bonus list: each equipped echo set with its piece count and milestone descriptions
import { motion } from 'framer-motion'
import type { EchoSlots } from '../../../types/gear'
import { computeEchoSetCounts, echoSetRegistry } from '../../../data/gear/echoSets'
import { SectionHeader } from '../../shared/ui'
import { assetPath, MUTED, FONT_MONO } from './theme'
import { colorizeText } from './colorizeText'

// ========== Sub-component: Set Bonus Section =================================================================================

export function SetBonusSection({ echoSlots, elColor }: { echoSlots: EchoSlots; elColor: string }) {
  // Sets with a registry entry, most pieces first
  const activeSets = Object.entries(computeEchoSetCounts(echoSlots))
    .flatMap(([setName, count]) => {
      const registry = echoSetRegistry[setName]
      return registry ? [{ setName, count, registry }] : []
    })
    .sort((a, b) => b.count - a.count)

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: 'hidden auto', display: 'flex', flexDirection: 'column', paddingBottom: 0 }}>
      {activeSets.length > 0 ? (
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionHeader label="Set Bonus" />

          {activeSets.map(({ setName, count, registry }) => (
            <div key={setName} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="cpo-set-bonus-name-row">
                <img
                  src={assetPath(registry.icon)}
                  alt={setName}
                  style={{ width: 26, height: 26, objectFit: 'contain' }}
                  onError={e => {
                    ;(e.target as HTMLImageElement).style.opacity = '0'
                  }}
                />
                <span className="cpo-set-bonus-name-text" style={{ color: `hsl(${elColor})` }}>
                  {setName}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontFamily: FONT_MONO, color: `hsl(${elColor} / 0.7)` }}>
                  {count}/5
                </span>
              </div>

              {Object.entries(registry.info).map(([milestoneKey, desc]) => {
                const required = Number(milestoneKey)
                const isActive = count >= required
                return (
                  <div
                    key={milestoneKey}
                    className="cpo-set-bonus-entry"
                    style={{
                      background: isActive ? `hsl(${elColor} / 0.07)` : 'rgba(20, 24, 36, 0.4)',
                      border: `1px solid ${isActive ? `hsl(${elColor} / 0.18)` : 'rgba(60, 70, 90, 0.3)'}`,
                      opacity: isActive ? 1 : 0.45,
                    }}>
                    <div className="cpo-set-bonus-entry-key" style={{ color: isActive ? `hsl(${elColor})` : MUTED }}>
                      {required}-pc
                    </div>
                    <p className="cpo-set-bonus-entry-desc">{isActive ? colorizeText(desc, elColor) : desc}</p>
                  </div>
                )
              })}
            </div>
          ))}
        </motion.div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: '0.75rem', opacity: 0.4 }}>No echoes equipped</div>
      )}
    </div>
  )
}
