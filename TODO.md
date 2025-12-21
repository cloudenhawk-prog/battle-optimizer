
TODO:

Task:    Implement rows on-click overlay data breakdown
Context: Right now damageEvents are passed to the component RotationEditor.tsx These can be passed to the RotationTable if it needs them for future features

Task:    Damage Events should have type -> action, action-side-effect, negative-status such that we can put them together 
Context: Right now damage events only includes events from actions. We do not want a seperate event list for every type of damage event. Sorted by ID, these can be used by rows on-click overlay

Task:    Implement tests for all reasonably-testable functions
Context: Right now we aren't performing any tests other than an outdated DamageCalculator.test.ts. It would be best if all functions in hooks and utils are tested

Task:    Implement toggler to active/deactive the Selector Check on skill cost requrements (no need to update resolver, it's useful to see if energy becomes negative)
Context: Right now energy stops characters from using actions if the requirement is not met. It would be nice with a toggle option that let's you bypass this









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



