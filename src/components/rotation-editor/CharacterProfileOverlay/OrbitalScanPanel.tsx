// Orbital scan panel: details of the weapon/echo currently highlighted by the orbit
import { motion, AnimatePresence } from 'framer-motion'
import type { Echo, Weapon } from '../../../types/gear'
import type { OrbitalScanItem } from './EquipmentOrbit'
import { SectionHeader } from './Decorations'
import { assetPath, MUTED, FONT_MONO } from './theme'
import { formatGearStats } from './statDisplay'
import { colorizeText } from './colorizeText'

// ========== Gear Info Display ================================================================================================

function WeaponInfo({ weapon, elColor }: { weapon: Weapon; elColor: string }) {
  const stats = formatGearStats(weapon.stats)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img
          src={assetPath(weapon.icon)}
          alt={weapon.name}
          style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
          onError={e => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--cpo-scan-name-size)', color: 'var(--table-text)' }}>{weapon.name}</div>
          <div style={{ fontSize: 'var(--cpo-scan-meta-size)', color: `hsl(${elColor})`, fontWeight: 600 }}>
            R{weapon.rank} · {weapon.weaponType}
          </div>
        </div>
      </div>
      {stats.length > 0 && (
        <>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.25), transparent)` }} />
          {stats.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--cpo-scan-stat-size)' }}>
              <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
              <span style={{ color: `hsl(${elColor} / 0.9)`, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
        </>
      )}
      {weapon.info && (
        <>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.25), transparent)` }} />
          <p style={{ margin: 0, fontSize: 'var(--cpo-scan-desc-size)', color: 'rgba(175, 185, 210, 0.85)', lineHeight: 1.55 }}>{colorizeText(weapon.info, elColor)}</p>
        </>
      )}
    </>
  )
}

function EchoInfo({ echo, slot, elColor }: { echo: Echo; slot: number; elColor: string }) {
  const mainStats = formatGearStats(echo.baseStats)
  const subStats = formatGearStats(echo.subStats)
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {echo.info_icon && (
          <img
            src={assetPath(echo.info_icon)}
            alt={echo.name}
            style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--cpo-scan-name-size)', color: 'var(--table-text)' }}>{echo.name}</div>
          <div style={{ fontSize: 'var(--cpo-scan-meta-size)', color: `hsl(${elColor})`, fontWeight: 600 }}>
            {echo.cost} Cost{slot === 1 ? ' · Main Echo' : ''} · {echo.setName}
          </div>
        </div>
      </div>
      {mainStats.length > 0 && (
        <>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.25), transparent)` }} />
          <div style={{ fontSize: 'var(--cpo-scan-section-label-size)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(130, 145, 175, 0.6)', marginBottom: 2 }}>Main</div>
          {mainStats.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--cpo-scan-stat-size)' }}>
              <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
              <span style={{ color: `hsl(${elColor} / 0.9)`, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
        </>
      )}
      {subStats.length > 0 && (
        <>
          <div style={{ fontSize: 'var(--cpo-scan-section-label-size)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(130, 145, 175, 0.6)', marginTop: 4, marginBottom: 2 }}>Sub</div>
          {subStats.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 'var(--cpo-scan-stat-size)' }}>
              <span style={{ color: 'rgba(150, 165, 195, 0.8)' }}>{label}</span>
              <span style={{ color: 'rgba(165, 178, 205, 0.85)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
        </>
      )}
      <>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, hsl(${elColor} / 0.25), transparent)` }} />
        <p style={{ margin: 0, fontSize: 'var(--cpo-scan-desc-size)', color: 'rgba(175, 185, 210, 0.85)', lineHeight: 1.55 }}>{echo.info ? colorizeText(echo.info, elColor) : 'No additional information available.'}</p>
      </>
    </>
  )
}

// ========== Sub-component: OrbitalScanPanel =================================================================================

export function OrbitalScanPanel({ item, elColor }: { item: OrbitalScanItem | null; elColor: string }) {
  return (
    <div>
      <SectionHeader label="Orbital Scan" elColor={elColor} />
      <AnimatePresence mode="wait">
        {item === null ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 8px',
              color: MUTED,
              fontSize: '0.72rem',
              fontFamily: FONT_MONO,
              letterSpacing: '0.1em',
            }}>
            SCANNING...
          </motion.div>
        ) : (
          <motion.div
            key={item.type === 'weapon' ? 'weapon' : `echo-${item.slot}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            style={{
              background: `hsl(${elColor} / 0.04)`,
              border: `1px solid hsl(${elColor} / 0.12)`,
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}>
            {item.type === 'weapon' ? <WeaponInfo weapon={item.data} elColor={elColor} /> : <EchoInfo echo={item.data} slot={item.slot} elColor={elColor} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
