### Bugs

# Modifiers
- Modifiers with type 'self' also affect side effects and negative statuses (like Mandate). There is no real logic to determine which other things aside from the main action which should be affected by a modifier. Right now it assumes that if the filter resolves to true, it affects everything in this snapshot.
Possible solutions:
Add a scope to target strategyS? action, actionSideEffects, otherSideEffects (coordinated attacks etc?), negative statuses?
Any other ideas?

- Canceling an action with a swap, correctly filters out the character, but canceling with skill doesnt force me to use that skill (maybe the issue is within the data of BA4 cartethyia)

- Stats breakdown may not collect all modifiers

- Cartethyia GoW Team Buff doesn't seem to trigger at all.

- Static Mist Outro Buff seems to disappear instantly after the incoming character uses Intro

- CharacterStateTracker.tsx still references Form 'icons' although we have removed icons for forms entirely

- Resource Milestones don't seem to use their custom defined color for the icon labels (see: 'Fleurdelys's Conviction')

- The name-tags clickable area is too large, partly shadowing for the gear icon (not actually, but close enough to be annoying)