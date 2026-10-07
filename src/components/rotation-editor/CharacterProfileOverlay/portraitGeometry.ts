// Portrait geometry: bottom-arc clip path and the side arcs that carry sequence nodes / level badges

// ========== Portrait Config ==================================================================================================
// Controls the 3D pop-out effect: the portrait image is clipped only at the bottom arc, letting hair/features overflow the ring.
// PORTRAIT_SIZE_PX must stay in sync with --cpo-portrait-size in styles/rotation-editor/CharacterProfileOverlay/01-shell.css.

export const PORTRAIT_SIZE_PX   = 250   // px — diameter of the portrait circle (must match --cpo-portrait-size)
export const PORTRAIT_OVERFLOW_PX = 99999  // px the image may extend above/outside the circle (huge ≈ unrestricted)
export const PORTRAIT_ARC_DEG   = 160   // degrees of bottom arc that clips the image (0–180; 180 = full bottom semicircle)

// Computes an SVG path() clip-path that contains only the bottom arc region plus everything above it up to `overflowPx`.
export function portraitClipPath(sizePx: number, arcDeg: number, overflowPx: number): string {
  const R = sizePx / 2
  const cx = R, cy = R
  const startAngleRad = ((90 - arcDeg / 2) * Math.PI) / 180
  const endAngleRad   = ((90 + arcDeg / 2) * Math.PI) / 180
  const startX = (cx + R * Math.cos(startAngleRad)).toFixed(2)
  const arcY   = (cy + R * Math.sin(startAngleRad)).toFixed(2)
  const endX   = (cx + R * Math.cos(endAngleRad)).toFixed(2)
  const largeArc = arcDeg > 180 ? 1 : 0
  return `M ${startX} ${arcY} A ${R} ${R} 0 ${largeArc} 1 ${endX} ${arcY} L -9999 ${arcY} L -9999 ${-overflowPx} L 9999 ${-overflowPx} L 9999 ${arcY} Z`
}

// ========== Side Arcs =========================================================================================================

export function seqArcPath(r: number, startDeg: number, endDeg: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = r * Math.cos(toRad(startDeg)),
    y1 = r * Math.sin(toRad(startDeg))
  const x2 = r * Math.cos(toRad(endDeg)),
    y2 = r * Math.sin(toRad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

export function arcLenPx(r: number, startDeg: number, endDeg: number): number {
  return (r * Math.abs(endDeg - startDeg) * Math.PI) / 180
}

// Nodes arc along the right side of the portrait. 0° = rightward, negative = up, positive = down.
// Radius is larger than the portrait radius (125px) to leave a clear gap between portrait edge and nodes.
export const PORTRAIT_ARC_ANGLES = [-75, -45, -15, 15, 45, 75]
export const PORTRAIT_ARC_RADIUS = 160
