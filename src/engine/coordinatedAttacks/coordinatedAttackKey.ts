// Snapshot key for a coordinated attack ("<owner>: <attackName>") and its inverse.
export function makeCoordinatedAttackKey(owner: string, attackName: string): string {
  return `${owner}: ${attackName}`
}

export function parseCoordinatedAttackKey(key: string): { owner: string; attackName: string } {
  const sep = key.indexOf(': ')
  return { owner: key.slice(0, sep), attackName: key.slice(sep + 2) }
}
