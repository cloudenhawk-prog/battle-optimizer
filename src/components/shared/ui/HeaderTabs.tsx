// Overlay header tabs: Orbitron labels with a glowing underline and diamond marker on the active tab

// ========== Component: Header Tabs ===========================================================================================

type HeaderTabsProps<T extends string> = {
  tabs: ReadonlyArray<{ value: NoInfer<T>; label: string }>
  value: T
  onChange: (value: NoInfer<T>) => void
}

export function HeaderTabs<T extends string>({ tabs, value, onChange }: HeaderTabsProps<T>) {
  return (
    <div className="ui-tabs" role="tablist">
      {tabs.map(t => (
        <button key={t.value} type="button" role="tab" aria-selected={t.value === value} className={`ui-tab${t.value === value ? ' is-active' : ''}`} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
