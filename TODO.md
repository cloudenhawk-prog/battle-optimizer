







Priority

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




1. Fix basics
(Done) Energy needs to be reduced on cast and unvailable to cast
Create Stats and Enemies (for now default and hardcoded like characters)
Fix damage calculator (add damage type, element to actions etc as needed)
Log damage (used for statistics)
When deleting rows, set TODO: updated damage logs (unless damage logs are saved in snapshot? Despite not being shown in table)
Consider: when deleting rows, red highlight-fadeout effect before they are deleted



Rows should have ON-CLICK that inspects the data associated with snapshot/logged damage
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



