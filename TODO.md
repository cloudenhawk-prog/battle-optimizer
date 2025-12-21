
TODO:

Task:    Implement rows on-click overlay data breakdown
Context: Right now damageEvents are passed to the component RotationEditor.tsx These can be passed to the RotationTable if it needs them for future features

Task:    Damage Events should have type -> action, action-side-effect, negative-status such that we can put them together 
Context: Right now damage events only includes events from actions. We do not want a seperate event list for every type of damage event. Sorted by ID, these can be used by rows on-click overlay

Task:    Implement tests for all reasonably-testable functions
Context: Right now we aren't performing any tests other than an outdated DamageCalculator.test.ts. It would be best if all functions in hooks and utils are tested

Task:    Implement toggler to active/deactive the Selector Check on skill cost requrements (no need to update resolver, it's useful to see if energy becomes negative)
Context: Right now energy stops characters from using actions if the requirement is not met. It would be nice with a toggle option that let's you bypass this

Task:    Implement more icon/button logic, split it into multiple css classes for different kinds
Context: Right now you can hide/unhide columns with button presses. Make certain icons non-clickable/no animation like Character/Action. Make group headers hide all columns under the group at once.

Task:    Implement coordinated attacks
Context: Coordinated attacks could work similar to negative statuses but have its own section (perhaps actually called DoT)

Task:    Implement source tracking on missing things
Context: Right now we can apply negative statuses (and buffs/Debuffs/coordinated attacks). We need to make sure that we can track the source - who applied them? Since they may count towards tracking the damage contribution of each character

Task:    Implement a step in the useCharacterActions hook that creates references to all different effects before the first resolver
Context: Right now the resolvers are doing A LOT of work with context but run-time isn't an issue. Later it might be useful to only have to iterate the context/snapshots once and directly collect and distribute all the effects and modifiers needed in future resolvers

Task:    Implement custom/dynamic outro trigger conditions
Context: Right now the outro-intro flow is hardcoded using 100 Concerto energy. It might be useful to make this function more dynamically by letting each character define a custom outro-intro trigger condition

Task:    Implement dispatchable effects so damages and other things don't always proc at 'toTime'
Context: Right now everything is summed up at the 'toTime' milestone. For a more detailed timeline in the future, and so that all damage is not necessarily triggered at once, it might be useful to create a queue that you can dispatch events to. The queue might be able to resolve/progress events, sorts the events at the time it happened, and more detailed create a timeline of action/effect starts, damage-procs, occurences, and event endings. This could be especially useful for outro skills, swap-cancelling, and delayed effects and damage procs. It might even automatically let us create Coordinated Attacks and alike really easily.






Priority

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




1. Fix basics
(In Progress) Design table: use cool icons. Make them clickable like the Sidebar (show/hide certain columns or groups of the table?)
(In Progress) Style the sidebar to look more like the table


(Pending) Find all types of buffs/debuffs in the game and implement helper functions (in their own file?) to handle them - that let's us several buffs with different names, as long as we give them an effect that matches some expected behaviour

OR

(Pending) Clean up and Refactor code




(Pending) use custom component for the 2 table Selectors - that way we can style them EXACTLY like we want, for example making them transparent

(Pending) Implement tests on all functions that can be reasonably tested

(Pending) Graphs that show the current performance in real-time (timeline up-down line graph & pie-charts)

(Pending) When deleting rows, set TODO: updated damage logs (unless damage logs are saved in snapshot? Despite not being shown in table)
(Pending) Consider: when deleting rows, red highlight-fadeout effect before they are deleted
(Pending) Rows should have ON-CLICK that inspects the data associated with snapshot/logged damage








Allow multi-instance battle timeline -> Track boss HP - when dead, automatically proceed to next boss in the list.
Take the new 3.0 break mechanic into account
















Future refactor:

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




1. State management

Overvej at bruge Zustand eller React Context:
   - snapshots og charactersInBattle som global state
   - Reducer-style handlinger: ADD_SNAPSHOT, UPDATE_ACTION, RESET_CONCERTO
Dette gør undo/redo og multi-component updates lettere




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




2. Performance og andet

Virtualized table: Brug @tanstack/react-virtual til BodyRows
Memoize:
- tableConfig via useMemo
- Render-funktioner for kolonner
Lazy load tunge sider: RotationEditor, Analytics




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------



















Future styling:

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




1. Erstat <table> og <select> med MUI:

<TableContainer>, <Table>, <TableHead>, <TableBody>, <TableRow>, <TableCell>

<Select> + <MenuItem> for dropdowns

<TextField> til input

<Button> og <IconButton> til handlinger

Brug <Box> + MUI sx eller @emotion/styled til layout og spacing

Implementer MUI Theme (farver, typography, spacing) for konsistens




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




2. Styling

Nu:
Tailwind CSS + custom CSS

Fremtid:
Flyt alt table- og layout-styling til MUI komponenter
Brug emotion styled eller sx props til custom styling
Brug MUI tokens (palette, spacing, typography) i stedet for hardcoded CSS











Future testing:


--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




3. Developer Experience

Storybook til komponentudvikling (tables, dropdowns, lightbox)
Vitest til unit tests af engine-moduler (damageCalculator, buffManager)
Husky + lint-staged til pre-commit
Eventuelt Zod til runtime validation af snapshots og actions




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------


























TODO Prioritering

Høj prioritet (nu)
- Type safety (Snapshot, actions)
- Material UI migration for tables og dropdowns
- Splitting af useRotationEditor.ts hook
- Implementering af buffs/debuffs og negative status tracking

Medium (fremtid):
- Virtualized rows
- Drag & drop kolonner
- Color pickers / date pickers

Lav (fremtid):
- Analytics page
- Settings page
- Pie charts visualisering



