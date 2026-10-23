// Small layout primitives shared by the optimizer columns: section heading and key/value row.

// ========== Primitives =======================================================================================================

export function BoSectionHeading({
  title,
  hint,
  icon,
}: {
  title: string
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="boSectionHeading">
      <div className="boSectionHeadingLeft">
        {icon && <span className="boSectionHeadingIcon">{icon}</span>}
        <span className="boSectionHeadingTitle">{title}</span>
      </div>
      {hint && <span className="boSectionHeadingHint">{hint}</span>}
    </div>
  )
}

export function BoKV({ k, v }: { k: string; v: string }) {
  return (
    <div className="boKV">
      <span className="boKVKey">{k}</span>
      <span className="boKVVal">{v}</span>
    </div>
  )
}
