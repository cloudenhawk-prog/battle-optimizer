import type { Character } from "../../../types/character"
import type { TableConfig } from "../../../types/tableDefinitions"
import { buildBasicColumns } from "./buildBasicColumns"
import { buildCharacterGroupsColumns } from "./buildCharacterGroupedColumns"
import { buildNegativeStatusColumns } from "./buildNegativeStatusColumns"
import { buildBuffColumns } from "./buildBuffColumns"
import { buildDebuffColumns } from "./buildDebuffColumns"

export function buildTableConfig(selectedCharacters: Character[]): TableConfig {
  return {
    basic: buildBasicColumns(),
    characters: buildCharacterGroupsColumns(selectedCharacters),
    negativeStatuses: buildNegativeStatusColumns(selectedCharacters),
    buffs: buildBuffColumns(selectedCharacters),
    debuffs: buildDebuffColumns(selectedCharacters),
  }
}
