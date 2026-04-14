import '../../styles/rotation-editor/HeaderRow.css'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'

// ========== Component: Header Row ============================================================================================

type HeaderRowProps = {
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export function HeaderRow({ tableConfig, columnVisibility, setColumnVisibility }: HeaderRowProps) {
  return (
    <>
      {/* Column labels */}
      <tr>
        {/* Character */}
        <th className="tableCellHeader">
          <div className="header-cell-content">
            <IconRenderer icon={'assets/table/character.png'} alt={'Character'} />
            <span>Character</span>
          </div>
        </th>

        {/* Action */}
        <th className="tableCellHeader">
          <div className="header-cell-content">
            <IconRenderer icon={'assets/table/action.png'} alt={'Action'} />
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



        {/* Status Effects Columns (Negative Statuses, Buffs, Debuffs) */}
        {tableConfig.statusEffects && renderColumns(tableConfig.statusEffects.columns, columnVisibility, setColumnVisibility)}

        {/* Other Columns (Coordinated Attacks, etc.) */}
        {tableConfig.other && renderColumns(tableConfig.other.columns, columnVisibility, setColumnVisibility)}
      </tr>
    </>
  )
}

// ========== Helper Components ================================================================================================

function IconRenderer({ icon, alt }: { icon?: string; alt?: string }) {
  if (!icon) return null
  return <img src={icon} alt={alt ?? ''} className="header-icon" />
}

function renderColumns(
  columns: TableConfig['basic']['columns'],
  columnVisibility: ColumnVisibility,
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
) {
  let firstVisible = true
  return columns
    .filter(col => columnVisibility[col.key])
    .map(col => {
      const className = firstVisible ? 'tableCellHeader charGroupHeader' : 'tableCellHeader'
      firstVisible = false
      return (
        <th key={col.key} className={className} onClick={() => setColumnVisibility(prev => ({ ...prev, [col.key]: !prev[col.key] }))}>
          <div className="header-cell-content">
            <IconRenderer icon={col.icon} alt={col.label} />
            <span>{col.label}</span>
          </div>
        </th>
      )
    })
}
