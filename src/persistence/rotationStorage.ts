// Saved rotations and snippets in localStorage (the "Rotations" panel's library).
import type { SavedRotation } from '../types/rotation'

// ========== Generic named-list store =========================================================================================

/** Both rotations and snippets are stored as a JSON array of SavedRotation, upserted by name. */
function loadList(key: string): SavedRotation[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as SavedRotation[]) : []
  } catch {
    return []
  }
}

function upsert(key: string, item: SavedRotation): void {
  const existing = loadList(key)
  const idx = existing.findIndex(r => r.name === item.name)
  if (idx !== -1) existing[idx] = item
  else existing.push(item)
  localStorage.setItem(key, JSON.stringify(existing))
}

function removeByName(key: string, name: string): void {
  const filtered = loadList(key).filter(r => r.name !== name)
  localStorage.setItem(key, JSON.stringify(filtered))
}

// ========== Rotations ========================================================================================================

const STORAGE_KEY = 'battle-optimizer:saved-rotations'

export const loadSavedRotations = (): SavedRotation[] => loadList(STORAGE_KEY)
export const saveRotationToStorage = (rotation: SavedRotation): void => upsert(STORAGE_KEY, rotation)
export const deleteRotationFromStorage = (name: string): void => removeByName(STORAGE_KEY, name)

// ========== Snippets (partial rotations appended onto the current one) =======================================================

const SNIPPETS_KEY = 'battle-optimizer:saved-snippets'

export const loadSavedSnippets = (): SavedRotation[] => loadList(SNIPPETS_KEY)
export const saveSnippetToStorage = (snippet: SavedRotation): void => upsert(SNIPPETS_KEY, snippet)
export const deleteSnippetFromStorage = (name: string): void => removeByName(SNIPPETS_KEY, name)
