// One orbit slot (weapon or echo): icon/placeholder, hover glow, scan-frame brackets and type label
import { motion, AnimatePresence } from 'framer-motion'
import { CornerAccents } from '../../shared/ui'
import { MUTED, FONT_DISPLAY, FONT_BODY } from './theme'

// ========== Sub-component: Gear Slot (shared for weapon & echo) ==============================================================

export function GearSlot({ icon, primaryLabel, secondaryLabel, elColor, size, delay, typeTag, isScanned, onClick, alwaysClickable, onHoverEnter, onHoverLeave }: { icon?: string; primaryLabel?: string; secondaryLabel?: string; elColor: string; size: number; delay: number; typeTag?: string; isScanned?: boolean; onClick?: () => void; alwaysClickable?: boolean; onHoverEnter?: () => void; onHoverLeave?: () => void }) {
  const hasItem = icon !== undefined || primaryLabel !== undefined
  const isClickable = hasItem || alwaysClickable

  return (
    <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay, duration: 0.35, type: 'spring', stiffness: 200 }} style={{ position: 'relative', width: size, height: size, cursor: isClickable ? 'pointer' : 'default' }} onMouseEnter={isClickable ? () => onHoverEnter?.() : undefined} onMouseLeave={isClickable ? () => onHoverLeave?.() : undefined} onClick={isClickable ? onClick : undefined}>
      {/* Background — solid occluder so orbiting particle stays hidden underneath */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'hsl(220 20% 9%)' }} />
      {/* Background — semi-transparent gradient overlay on top of occluder */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 8,
          background: hasItem ? `linear-gradient(135deg, hsl(${elColor} / ${typeTag ? 0.13 : 0.08}), rgba(30, 33, 55, 0.6))` : 'rgba(30, 33, 42, 0.3)',
          border: `1px solid ${hasItem ? `hsl(${elColor} / ${typeTag ? 0.4 : 0.25})` : 'rgba(80, 85, 100, 0.2)'}`,
          transition: 'border-color 0.2s',
        }}
      />

      {/* Hover glow */}
      {isClickable && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            opacity: 0,
            boxShadow: `inset 0 0 20px hsl(${elColor} / 0.1), 0 0 12px hsl(${elColor} / 0.15)`,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2px' }}>
        {icon ? (
          <img
            src={icon}
            alt={primaryLabel}
            style={{ width: '92%', height: '92%', objectFit: 'contain' }}
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        ) : hasItem ? (
          <>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: '0.7rem', fontWeight: 700, color: `hsl(${elColor} / 0.9)`, lineHeight: 1 }}>{primaryLabel}</span>
            {secondaryLabel && <span style={{ fontFamily: FONT_BODY, fontSize: '0.55rem', color: MUTED, marginTop: 2, maxWidth: '90%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>{secondaryLabel}</span>}
          </>
        ) : (
          <span style={{ color: 'rgba(100, 110, 130, 0.3)', fontSize: '1.1rem', lineHeight: 1 }}>+</span>
        )}
      </div>

      {/* Corner accents */}
      {isClickable && <CornerAccents />}

      {/* Scan frame — targeting brackets animate in when the orbital particle passes this slot */}
      <AnimatePresence>
        {isScanned && (
          <motion.div key="scan-frame" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {/* TL */}
            <motion.div style={{ position: 'absolute', top: -8, left: -8, width: 12, height: 12 }} initial={{ x: -14, y: -14 }} animate={{ x: 0, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 12, height: 1.5, background: `hsl(${elColor})`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: 1.5, height: 12, background: `hsl(${elColor})`, borderRadius: 1 }} />
            </motion.div>
            {/* TR */}
            <motion.div style={{ position: 'absolute', top: -8, right: -8, width: 12, height: 12 }} initial={{ x: 14, y: -14 }} animate={{ x: 0, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 1.5, background: `hsl(${elColor})`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: 1.5, height: 12, background: `hsl(${elColor})`, borderRadius: 1 }} />
            </motion.div>
            {/* BR */}
            <motion.div style={{ position: 'absolute', bottom: -8, right: -8, width: 12, height: 12 }} initial={{ x: 14, y: 14 }} animate={{ x: 0, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 1.5, background: `hsl(${elColor})`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 1.5, height: 12, background: `hsl(${elColor})`, borderRadius: 1 }} />
            </motion.div>
            {/* BL */}
            <motion.div style={{ position: 'absolute', bottom: -8, left: -8, width: 12, height: 12 }} initial={{ x: -14, y: 14 }} animate={{ x: 0, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 12, height: 1.5, background: `hsl(${elColor})`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 1.5, height: 12, background: `hsl(${elColor})`, borderRadius: 1 }} />
            </motion.div>
            {/* Border glow pulse */}
            <motion.div style={{ position: 'absolute', inset: 0, borderRadius: 8, border: `1px solid hsl(${elColor})` }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0.35] }} transition={{ duration: 0.5, ease: 'easeOut' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slot type label */}
      {typeTag && (
        <div
          style={{
            position: 'absolute',
            top: size + 4,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.65rem',
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: `hsl(${elColor} / 0.6)`,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            textShadow: `0 0 8px hsl(${elColor} / 0.35)`,
          }}>
          {typeTag}
        </div>
      )}
    </motion.div>
  )
}
