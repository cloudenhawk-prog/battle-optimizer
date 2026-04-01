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

- Ensemple Sylph (24 % aero boost from ciaccona) doesn't seem to show up in the table or as a contributing modifier when characters deal damage or even in the stats profile tab. This suggest our flows are wrong for certain things since there is no reason to believe this is and will always be a single incident.

- Gusts of Welking is bugged: In the stats profile breakdown, it's displayed under Team Buffs (both the Self Buff and Team Buff part). The names are shown as GustsofWelkin(SelfBuff) and GustsofWelkin(TeamBuff), while every other entry has correct spaces between words and parentheses.
  Gusts of welking (both self buff and team buff) seem to use wrong names between "what is displayed in the table" and "what is used to access the asset for the icon". It seems to use different logic than other assets. This might be a systematic issue in certain places. Once again there is no reason to believe this is an isolated issue.
