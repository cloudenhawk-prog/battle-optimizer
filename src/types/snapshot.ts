
export type Snapshot =
  Record<string,
    number |
    string |
    Record<string, number> |
    Record<string, Record<string, number>>
  >