import type { TableConfig } from "../../../types/tableDefinitions"

type HeaderRowProps = {
  tableConfig: TableConfig
}

function IconRenderer({ icon, alt }: { icon?: string; alt?: string }) {
  if (!icon) return null
  return <img src={icon} alt={alt ?? ""} className="header-icon" />
}

function HeaderContent({ label, icon }: { label: string; icon?: string }) {
  return (
    <div className="header-content">
      <IconRenderer icon={icon} alt={label} />
      <span>{label}</span>
    </div>
  )
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
        >
          <HeaderContent label={tableConfig.basic.label} icon={tableConfig.basic.icon} />
        </th>

        {/* Group: Character-specific */}
        {tableConfig.characters.map(group => (
          <th
            key={group.label}
            className="groupHeader"
            colSpan={group.columns.length}
          >
            <HeaderContent label={group.label} icon={group.icon} />
          </th>
        ))}

        {/* Group: Negative Statuses */}
        {tableConfig.negativeStatuses && (
          <th
            className="groupHeader"
            colSpan={tableConfig.negativeStatuses.columns.length}
          >
            <HeaderContent
              label={tableConfig.negativeStatuses.label}
              icon={tableConfig.negativeStatuses.icon}
            />
          </th>
        )}

        {/* Group: Buffs */}
        {tableConfig.buffs && (
          <th
            className="groupHeader"
            colSpan={tableConfig.buffs.columns.length}
          >
            <HeaderContent
              label={tableConfig.buffs.label}
              icon={tableConfig.buffs.icon}
            />
          </th>
        )}

        {/* Group: Debuffs */}
        {tableConfig.debuffs && (
          <th
            className="groupHeader"
            colSpan={tableConfig.debuffs.columns.length}
          >
            <HeaderContent
              label={tableConfig.debuffs.label}
              icon={tableConfig.debuffs.icon}
            />
          </th>
        )}
      </tr>

      {/* Column labels */}
      <tr>
        {/* Character */}
        <th className="tableCellHeader">
          <div className="header-cell-content">
            <IconRenderer icon={"assets/character.png"} alt={"Character"} />
            <span>Character</span>
          </div>
        </th>

        {/* Action */}
        <th className="tableCellHeader">
          <div className="header-cell-content">
            <IconRenderer icon={"assets/action.png"} alt={"Action"} />
            <span>Action</span>
          </div>
        </th>

        {/* Basic Columns */}
        {tableConfig.basic.columns.map(col => (
          <th key={col.key} className="tableCellHeader">
            <div className="header-cell-content">
              <IconRenderer icon={col.icon} alt={col.label} />
              <span>{col.label}</span>
            </div>
          </th>
        ))}

        {/* Character-specific Columns */}
        {tableConfig.characters.flatMap(group =>
          group.columns.map((col, idx) => (
            <th key={col.key} className={`tableCellHeader ${idx === 0 ? "charGroupHeader" : ""}`}>
              <div className="header-cell-content">
                <IconRenderer icon={col.icon} alt={col.label} />
                <span>{col.label}</span>
              </div>
            </th>
          ))
        )}

        {/* Negative Status Columns */}
        {tableConfig.negativeStatuses?.columns.map((col, idx) => (
          <th key={col.key} className={`tableCellHeader ${idx === 0 ? "charGroupHeader" : ""}`}>
            <div className="header-cell-content">
              <IconRenderer icon={col.icon} alt={col.label} />
              <span>{col.label}</span>
            </div>
          </th>
        ))}

        {/* Buff Columns */}
        {tableConfig.buffs?.columns.map((col, idx) => (
          <th key={col.key} className={`tableCellHeader ${idx === 0 ? "charGroupHeader" : ""}`}>
            <div className="header-cell-content">
              <IconRenderer icon={col.icon} alt={col.label} />
              <span>{col.label}</span>
            </div>
          </th>
        ))}

        {/* Debuff Columns */}
        {tableConfig.debuffs?.columns.map((col, idx) => (
          <th key={col.key} className={`tableCellHeader ${idx === 0 ? "charGroupHeader" : ""}`}>
            <div className="header-cell-content">
              <IconRenderer icon={col.icon} alt={col.label} />
              <span>{col.label}</span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  )
}

