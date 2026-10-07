// Resonance chain (sequence) nodes on the portrait's right arc; clicking a node sets the sequence level
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { TooltipData } from './tooltip'
import { assetPath, MUTED, FONT_DISPLAY } from './theme'
import { colorizeText } from './colorizeText'
import { seqArcPath, arcLenPx, PORTRAIT_ARC_ANGLES, PORTRAIT_ARC_RADIUS } from './portraitGeometry'

// ========== Sub-component: Portrait Sequence Display ========================================================================

export function PortraitSequenceDisplay({ sequence, prevSequence, sequenceNodes, sequenceNodeIcons, elColor, onTooltip, onSequenceChange }: { sequence: 0 | 1 | 2 | 3 | 4 | 5 | 6; prevSequence: 0 | 1 | 2 | 3 | 4 | 5 | 6; sequenceNodes: string[]; sequenceNodeIcons: string[]; elColor: string; onTooltip: (t: TooltipData | null) => void; onSequenceChange: (seq: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void }) {
  const nodes = sequenceNodes.slice(0, 6)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const NODE_SIZE = 34
  const R = PORTRAIT_ARC_RADIUS
  // Arc geometry
  const trackPath = seqArcPath(R, -75, 75)
  const clampedSeq = Math.min(sequence, nodes.length)
  const activeEndDeg = clampedSeq > 0 ? PORTRAIT_ARC_ANGLES[clampedSeq - 1] : -75

  // Static arc: the already-drawn portion (up to the lower of prev/current), shown instantly
  const staticSeq = Math.min(prevSequence, sequence)
  const staticHasArc = staticSeq >= 2
  const staticEndDeg = staticSeq > 0 ? PORTRAIT_ARC_ANGLES[Math.min(staticSeq, nodes.length) - 1] : -75
  const staticPath = staticHasArc ? seqArcPath(R, -75, staticEndDeg) : ''

  // Animated segment: only the newly added portion, drawn in when sequence increases
  const shouldAnimate = sequence >= 2 && sequence > prevSequence
  const animStartDeg = staticSeq >= 2 ? PORTRAIT_ARC_ANGLES[Math.min(staticSeq, nodes.length) - 1] : -75
  const animPath = shouldAnimate ? seqArcPath(R, animStartDeg, activeEndDeg) : ''
  const animLen = shouldAnimate ? arcLenPx(R, animStartDeg, activeEndDeg) : 0

  // SVG: 190 × 360 with viewBox "0 -180 190 360" so (0,0) = portrait center.
  // placed at left:50% top:50% translateY(-50%) → left edge at portrait center x, vertically centered.
  // Paths drawn with x going rightward match the node calc(50% + offsetX) coordinate system.

  function makeTooltip(i: number, desc: string, active: boolean) {
    const iconPath = sequenceNodeIcons[i] ? assetPath(sequenceNodeIcons[i]) : null
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          {iconPath && (
            <img
              src={iconPath}
              alt={`S${i + 1}`}
              style={{
                width: 36,
                height: 36,
                objectFit: 'contain',
                flexShrink: 0,
                filter: active ? undefined : 'grayscale(1) opacity(0.4)',
                borderRadius: 4,
              }}
              onError={e => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: active ? `hsl(${elColor})` : 'hsl(195 100% 90%)' }}>Sequence {i + 1}</span>
            <span style={{ fontSize: '0.68rem', color: MUTED }}>{active ? 'Unlocked' : 'Locked'}</span>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '0.76rem', color: 'rgba(175, 185, 210, 0.9)', lineHeight: 1.55 }}>{colorizeText(desc, elColor)}</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      {/* SVG arc layer — actual dimensions so paths are measurable and drop-shadows render correctly */}
      <svg
        width="190"
        height="360"
        viewBox="0 -180 190 360"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateY(-50%)',
          overflow: 'visible',
          pointerEvents: 'none',
        }}>
        {/* Track — clean solid grey rail, full span */}
        <path d={trackPath} fill="none" stroke="rgba(120, 128, 145, 0.22)" strokeWidth="1" strokeLinecap="round" />

        {/* Static arc: the already-drawn portion, shown instantly with no animation */}
        {staticHasArc && <path d={staticPath} fill="none" stroke={`hsl(${elColor})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.75" style={{ filter: `drop-shadow(0 0 2.5px hsl(${elColor} / 0.7))` }} />}

        {/* Animated arc — draws in only the new segment each time sequence increases */}
        {shouldAnimate && <motion.path key={`${prevSequence}-${sequence}`} d={animPath} fill="none" stroke={`hsl(${elColor})`} strokeWidth="1.5" strokeLinecap="round" strokeDasharray={animLen} style={{ filter: `drop-shadow(0 0 2.5px hsl(${elColor} / 0.7))` }} initial={{ strokeDashoffset: animLen, opacity: 0 }} animate={{ strokeDashoffset: 0, opacity: 0.75 }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }} />}
      </svg>

      {/* Nodes */}
      {nodes.map((desc, i) => {
        const active = i < sequence
        const hovered = hoveredIndex === i
        const rad = (PORTRAIT_ARC_ANGLES[i] * Math.PI) / 180
        const offsetX = R * Math.cos(rad)
        const offsetY = R * Math.sin(rad)

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `calc(50% + ${offsetX}px)`,
              top: `calc(50% + ${offsetY}px)`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            onClick={() => {
              // todo: this only updates local visual state for the resonance chain.
              // Later, onSequenceChange should persist to character data so sequence-gated
              // modifiers (skills, passives, injected effects, etc.) are applied correctly.
              const nextSeq = sequence === i + 1 ? i : i + 1
              onSequenceChange(nextSeq as 0 | 1 | 2 | 3 | 4 | 5 | 6)
            }}
            onMouseEnter={e => {
              setHoveredIndex(i)
              onTooltip({ x: e.clientX, y: e.clientY, content: makeTooltip(i, desc, active) })
            }}
            onMouseMove={e => onTooltip({ x: e.clientX, y: e.clientY, content: makeTooltip(i, desc, active) })}
            onMouseLeave={() => {
              setHoveredIndex(null)
              onTooltip(null)
            }}>
            <motion.div style={{ position: 'relative', width: NODE_SIZE, height: NODE_SIZE }} animate={{ scale: hovered ? 1.22 : 1 }} transition={{ duration: 0.13, ease: 'easeOut' }}>
              {/* Circle */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1.5px solid ${hovered ? `hsl(${elColor})` : active ? `hsl(${elColor} / 0.72)` : 'rgba(120, 130, 150, 0.28)'}`,
                  background: active ? `radial-gradient(circle, hsl(${elColor} / ${hovered ? 0.4 : 0.2}), hsl(${elColor} / 0.04)), rgb(12, 15, 22)` : hovered ? 'rgb(42, 47, 65)' : 'rgb(18, 21, 30)',
                  boxShadow: hovered ? `0 0 14px hsl(${elColor} / ${active ? 0.6 : 0.28}), inset 0 0 8px hsl(${elColor} / 0.14)` : active ? `0 0 5px hsl(${elColor} / 0.3)` : 'none',
                  transition: 'border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease',
                  overflow: 'hidden',
                }}>
                {sequenceNodeIcons[i] ? (
                  <img
                    src={assetPath(sequenceNodeIcons[i])}
                    alt={`S${i + 1}`}
                    style={{
                      width: '90%',
                      height: '90%',
                      objectFit: 'contain',
                      filter: active ? undefined : `grayscale(1) opacity(${hovered ? 0.55 : 0.28})`,
                      transition: 'filter 0.15s ease',
                    }}
                    onError={e => {
                      ;(e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      color: active ? `hsl(${elColor})` : `rgba(100, 110, 130, ${hovered ? 0.75 : 0.45})`,
                    }}>
                    {i + 1}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
