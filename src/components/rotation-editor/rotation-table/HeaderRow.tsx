import type { TableConfig } from "../../../types/tableDefinitions"

type HeaderRowProps = {
  tableConfig: TableConfig
}

export function HeaderRow({ tableConfig }: HeaderRowProps) {
  return (
    <thead className="tableHeader">
      {/* Top-level group headers */}
      <tr>
        {/* Group: Basic Columns */}
        <th
          className="groupHeader"
          colSpan={2 + tableConfig.basic.columns.length} // Character + Action + basic columns
          style={{ textAlign: "center" }}
        >
          Basic
        </th>

        {/* Group: Character-specific */}
        {tableConfig.characters.map(group => (
          <th
            key={group.label}
            className="groupHeader"
            colSpan={group.columns.length}
            style={{ textAlign: "center" }}
          >
            {group.label}
          </th>
        ))}

        {/* Group: Negative Statuses */}
        <th
          className="groupHeader"
          colSpan={tableConfig.negativeStatuses.columns.length}
          style={{ textAlign: "center" }}
        >
          {tableConfig.negativeStatuses.label}
        </th>

        {/* Group: Buffs */}
        <th
          className="groupHeader"
          colSpan={tableConfig.buffs.columns.length}
          style={{ textAlign: "center" }}
        >
          {tableConfig.buffs.label}
        </th>

        {/* Group: Debuffs */}
        <th
          className="groupHeader"
          colSpan={tableConfig.debuffs.columns.length}
          style={{ textAlign: "center" }}
        >
          {tableConfig.debuffs.label}
        </th>
      </tr>

      {/* Column labels */}
      <tr>
        {/* Character */}
        <th className="tableCellHeader">Character</th>

        {/* Action */}
        <th className="tableCellHeader">Action</th>

        {/* Basic Columns */}
        {tableConfig.basic.columns.map(col => (
          <th key={col.key} className="tableCellHeader">{col.label}</th>
        ))}

        {/* Character-specific Columns (dynamic energies included) */}
        {tableConfig.characters.flatMap(group =>
          group.columns.map((col, idx) => (
            <th key={col.key} className={`tableCellHeader ${idx === 0 ? "charGroupHeader" : ""}`}>
              {col.label}
            </th>
          ))
        )}

        {/* Negative Status Columns */}
        {tableConfig.negativeStatuses.columns.map((col, idx) => (
          <th key={col.key} className={`tableCellHeader ${idx === 0 ? "charGroupHeader" : ""}`}>
            {col.label}
          </th>
        ))}

        {/* Buff Columns */}
        {tableConfig.buffs.columns.map((col, idx) => (
          <th key={col.key} className={`tableCellHeader ${idx === 0 ? "charGroupHeader" : ""}`}>
            {col.label}
          </th>
        ))}

        {/* Debuff Columns */}
        {tableConfig.debuffs.columns.map((col, idx) => (
          <th key={col.key} className={`tableCellHeader ${idx === 0 ? "charGroupHeader" : ""}`}>
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}
