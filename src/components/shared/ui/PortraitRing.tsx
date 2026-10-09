// Small circular character portrait with an accent ring (falls back to initials when there is no image)

// ========== Component: Portrait Ring =========================================================================================

type PortraitRingProps = {
  name: string
  src?: string
  size?: number
  /** Space-separated HSL triplet; defaults to the inherited --ui-accent-raw. */
  accent?: string
}

export function PortraitRing({ name, src, size = 40, accent }: PortraitRingProps) {
  const style = { '--ui-portrait-size': `${size}px`, ...(accent ? { '--ui-accent-raw': accent } : {}) } as React.CSSProperties
  if (!src) {
    return (
      <span className="ui-portrait ui-portrait--fallback" style={style} aria-hidden="true">
        {name.slice(0, 2).toUpperCase()}
      </span>
    )
  }
  return <img className="ui-portrait" src={src.startsWith('/') ? src : `/${src}`} alt={name} style={style} />
}
