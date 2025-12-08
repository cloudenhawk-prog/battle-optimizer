1. Lav en konkret Snapshot interface med alle felter (ét centraliseret sted at opdatere type)

interface Snapshot {
  id: string
  character?: string
  action?: string
  fromTime: number
  toTime: number
  damage: number
  dps: number
  charactersEnergies: Record<string, Record<'energy' | 'concerto' | 'forte', number>> (OBS: tilføjer jeg bare andre som de kommer, eller kan jeg gøre noget smart så typer selv oprettes på baggrund af energy data)
  buffs: Record<string, number>
  debuffs: Record<string, number>
  negativeStatuses: Record<string, number>
}

Måske:
type EnergyKeys<T extends Record<string, any>> = keyof T extends string ? keyof T['maxEnergies'] : never;


--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




2. Split useRotationEditor.ts i mindre hooks:

useSnapshots
useCharacterActions
useTableUpdates




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




3. Erstat <table> og <select> med MUI:

<TableContainer>, <Table>, <TableHead>, <TableBody>, <TableRow>, <TableCell>

<Select> + <MenuItem> for dropdowns

<TextField> til input

<Button> og <IconButton> til handlinger

Brug <Box> + MUI sx eller @emotion/styled til layout og spacing

Implementer MUI Theme (farver, typography, spacing) for konsistens




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




4. Styling

Nu:
Tailwind CSS + custom CSS

Fremtid:
Flyt alt table- og layout-styling til MUI komponenter
Brug emotion styled eller sx props til custom styling
Brug MUI tokens (palette, spacing, typography) i stedet for hardcoded CSS




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




5. State management

Overvej at bruge Zustand eller React Context:
   - snapshots og charactersInBattle som global state
   - Reducer-style handlinger: ADD_SNAPSHOT, UPDATE_ACTION, RESET_CONCERTO
Dette gør undo/redo og multi-component updates lettere




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




6. Performance og andet

Virtualized table: Brug @tanstack/react-virtual til BodyRows
Memoize:
- tableConfig via useMemo
- Render-funktioner for kolonner
Lazy load tunge sider: RotationEditor, Analytics




--------------------------------------------------------------------------------------------------------------------------------------------------------------------------




7. Developer Experience

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



