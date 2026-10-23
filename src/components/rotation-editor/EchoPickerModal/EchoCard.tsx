// Catalog card for one echo (icon, cost badge, name) in the browse grid
import { motion } from 'framer-motion'
import type { EchoCatalogEntry } from '../../../data/gear/echoCatalog'
import { assetPath } from '../CharacterProfileOverlay/theme'
import { costBadgeColor } from './echoPickerHelpers'

// ========== Sub-component: Echo Card =========================================================================================

export function EchoCard({
  entry,
  onClick,
  elColor,
}: {
  entry: EchoCatalogEntry
  onClick: () => void
  elColor: string
}) {
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
        boxShadow: 'none',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
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
      {/* Image box */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 8,
          overflow: 'hidden',
          background: 'rgba(8, 10, 20, 0.9)',
          flexShrink: 0,
          position: 'relative',
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
        {/* Cost badge - corner overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 3,
            right: 3,
            fontSize: '0.52rem',
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 700,
            color: costBadgeColor(entry.cost),
            background: 'rgba(6, 8, 16, 0.88)',
            borderRadius: 3,
            padding: '1px 4px',
            lineHeight: 1.4,
            letterSpacing: '0.04em',
          }}>
          {entry.cost}C
        </div>
      </div>

      {/* Name — below the image box */}
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
    </motion.button>
  )
}
