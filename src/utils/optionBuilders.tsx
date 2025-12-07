
export function buildActionOptions(
  actions: { name: string }[],
  currentAction: string
) {
  return actions.map((a) => {
    const isSpecial = a.name === "Intro" || a.name === "Outro"
    const isCurrent = a.name === currentAction

    if (isSpecial && !isCurrent) {
      return (
        <option key={a.name} value={a.name} hidden disabled>
          {a.name}
        </option>
      )
    }

    return (
      <option key={a.name} value={a.name}>
        {a.name}
      </option>
    )
  })
}
