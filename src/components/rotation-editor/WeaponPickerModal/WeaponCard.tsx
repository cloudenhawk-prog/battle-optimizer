// Catalog card for one weapon (icon, name, available ranks) in the browse grid
import { motion } from 'framer-motion'
import type { WeaponCatalogEntry } from '../../../data/gear/weaponCatalog'
import { assetPath } from '../CharacterProfileOverlay/theme'

// ========== Sub-component: Weapon Card (browse screen) =======================================================================

export function WeaponCard({
  entry,
  onClick,
  elColor,
}: {
  entry: WeaponCatalogEntry
  onClick: () => void
  elColor: string
}) {
  const definedRanks = ([1, 2, 3, 4, 5] as const).filter(r => entry.ranks[r] !== undefined)

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.13 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        width: 108,
        padding: '10px 8px 10px',
        borderRadius: 10,
        border: '1.5px solid rgba(80, 95, 130, 0.28)',
        background: 'rgba(16, 20, 32, 0.75)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = `hsl(${elColor} / 0.55)`
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 14px hsl(${elColor} / 0.2)`
        ;(e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(160deg, hsl(${elColor} / 0.1), rgba(16, 20, 32, 0.75))`
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(80, 95, 130, 0.28)'
        ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
        ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(16, 20, 32, 0.75)'
      }}>
      {/* Image */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'rgba(8, 10, 20, 0.9)',
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
        <img
          src={assetPath(entry.icon)}
          alt={entry.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => {
            ;(e.target as HTMLImageElement).style.opacity = '0.15'
          }}
        />
      </div>

      {/* Name */}
      <span
        style={{
          fontSize: '0.72rem',
          fontFamily: '"Rajdhani", sans-serif',
          fontWeight: 600,
          color: 'rgba(195, 208, 230, 0.92)',
          textAlign: 'center',
          lineHeight: 1.25,
          width: '100%',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          minHeight: '2.3em',
        }}>
        {entry.name}
      </span>

      {/* Available ranks badge */}
      <span
        style={{
          fontSize: '0.6rem',
          fontFamily: '"Orbitron", sans-serif',
          color: `hsl(${elColor} / 0.55)`,
          letterSpacing: '0.06em',
        }}>
        R{definedRanks.join('/')}
      </span>
    </motion.button>
  )
}
