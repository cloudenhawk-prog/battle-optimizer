// Segmented button group for switching a view mode ([ Damage | DPS ], [ Average | Normal | Critical ] …)

// ========== Component: Segmented Toggle ======================================================================================

type SegmentedToggleProps<T extends string> = {
  options: ReadonlyArray<{ value: NoInfer<T>; label: string }>
  value: T
  onChange: (value: NoInfer<T>) => void
}

export function SegmentedToggle<T extends string>({ options, value, onChange }: SegmentedToggleProps<T>) {
  return (
    <div className="ui-segmented" role="group">
      {options.map(o => (
        <button key={o.value} type="button" className={`ui-segmented-btn${o.value === value ? ' is-active' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
