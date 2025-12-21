import "../../styles/rotation-editor/HeaderRow.css"
import type { TableConfig, ColumnVisibility } from "../../types/tableDefinitions"

// ========== Component: Header Row ============================================================================================

type HeaderRowProps = {
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export function HeaderRow({ tableConfig, columnVisibility, setColumnVisibility }: HeaderRowProps) {
  const countVisible = (columns: typeof tableConfig.basic.columns) => columns.filter(col => columnVisibility[col.key]).length

  function renderColumns(
    columns: typeof tableConfig.basic.columns,
    columnVisibility: ColumnVisibility,
    setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
  ) {
    let firstVisible = true
    return columns
      .filter(col => columnVisibility[col.key])
      .map(col => {
        const className = firstVisible ? "tableCellHeader charGroupHeader" : "tableCellHeader"
        firstVisible = false
        return (
          <th
            key={col.key}
            className={className}
            onClick={() => setColumnVisibility(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
          >
            <div className="header-cell-content">
              <IconRenderer icon={col.icon} alt={col.label} />
              <span>{col.label}</span>
            </div>
          </th>
        )
      })
  }

  return (
    <thead className="tableHeader">
      {/* Top-level group headers */}
      <tr>
        {/* Group: Basic Columns */}
        {(() => {
          const visibleBasicCols = countVisible(tableConfig.basic.columns)
          const basicColSpan = 2 + visibleBasicCols // Character + Action + visible columns
          return basicColSpan > 0 ? (
            <th className="groupHeader" colSpan={basicColSpan}>
              <HeaderContent label={tableConfig.basic.label} icon={tableConfig.basic.icon} />
            </th>
          ) : null
        })()}

        {/* Group: Character-specific */}
        {tableConfig.characters.map(group => {
          const visibleCols = group.columns.filter(col => columnVisibility[col.key]).length
          if (!visibleCols) return null
          return (
            <th key={group.label} className="groupHeader" colSpan={visibleCols}>
              <HeaderContent label={group.label} icon={group.icon} />
            </th>
          )
        })}

        {/* Group: Negative Statuses */}
        {tableConfig.negativeStatuses && (() => {
          const visibleCols = tableConfig.negativeStatuses.columns.filter(col => columnVisibility[col.key]).length
          if (!visibleCols) return null
          return (
            <th className="groupHeader" colSpan={visibleCols}>
              <HeaderContent
                label={tableConfig.negativeStatuses.label}
                icon={tableConfig.negativeStatuses.icon}
              />
            </th>
          )
        })()}

        {/* Group: Buffs */}
        {tableConfig.buffs && (() => {
          const visibleCols = tableConfig.buffs.columns.filter(col => columnVisibility[col.key]).length
          if (!visibleCols) return null
          return (
            <th className="groupHeader" colSpan={visibleCols}>
              <HeaderContent
                label={tableConfig.buffs.label}
                icon={tableConfig.buffs.icon}
              />
            </th>
          )
        })()}

        {/* Group: Debuffs */}
        {tableConfig.debuffs && (() => {
          const visibleCols = tableConfig.debuffs.columns.filter(col => columnVisibility[col.key]).length
          if (!visibleCols) return null
          return (
            <th className="groupHeader" colSpan={visibleCols}>
              <HeaderContent
                label={tableConfig.debuffs.label}
                icon={tableConfig.debuffs.icon}
              />
            </th>
          )
        })()}
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
        {tableConfig.basic.columns.map(col => {
          if (!columnVisibility[col.key]) return null
          return (
            <th key={col.key} className="tableCellHeader" onClick={() => setColumnVisibility(prev => ({ ...prev, [col.key]: !prev[col.key] }))}>
              <div className="header-cell-content">
                <IconRenderer icon={col.icon} alt={col.label} />
                <span>{col.label}</span>
              </div>
            </th>
          )
        })}

        {/* Character-specific Columns */}
        {tableConfig.characters.flatMap(group =>
          renderColumns(group.columns, columnVisibility, setColumnVisibility)
        )}

        {/* Negative Status Columns */}
        {tableConfig.negativeStatuses && renderColumns(tableConfig.negativeStatuses.columns, columnVisibility, setColumnVisibility)}

        {/* Buff Columns */}
        {tableConfig.buffs && renderColumns(tableConfig.buffs.columns, columnVisibility, setColumnVisibility)}

        {/* Debuff Columns */}
        {tableConfig.debuffs && renderColumns(tableConfig.debuffs.columns, columnVisibility, setColumnVisibility)}
      </tr>
    </thead>
  )
}

// ========== Helper Components ================================================================================================

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
