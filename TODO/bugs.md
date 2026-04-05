### Bugs

# Modifiers

- Modifiers with type 'self' also affect side effects and negative statuses (like Mandate). There is no real logic to determine which other things aside from the main action which should be affected by a modifier. Right now it assumes that if the filter resolves to true, it affects everything in this snapshot.
  Possible solutions:
  Add a scope to target strategyS? action, actionSideEffects, otherSideEffects (coordinated attacks etc?), negative statuses?
  Any other ideas?

- Resource Milestones don't seem to use their custom defined color for the icon labels (see: 'Fleurdelys's Conviction')
