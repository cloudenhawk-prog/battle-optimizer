import '../../styles/rotation-editor/HeaderRow.css'
import type { TableConfig, ColumnVisibility } from '../../types/tableDefinitions'

// ========== Component: Header Row ============================================================================================

type HeaderRowProps = {
  tableConfig: TableConfig
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export function HeaderRow({ tableConfig, columnVisibility, setColumnVisibility }: HeaderRowProps) {
  const countVisible = (columns: typeof tableConfig.basic.columns) => columns.filter(col => columnVisibility[col.key]).length

  function handleGroupClick(groupColumns: typeof tableConfig.basic.columns) {
    const visibleKeysinGroup = groupColumns.filter(col => columnVisibility[col.key]).map(col => col.key)
    if (visibleKeysinGroup.length === 0) return

    setColumnVisibility(prev => {
      const updated = { ...prev }
      visibleKeysinGroup.forEach(key => {
        updated[key] = false
      })
      return updated
    })
  }

  function renderColumns(columns: typeof tableConfig.basic.columns, columnVisibility: ColumnVisibility, setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>) {
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

  return (
    <>
      {/* Top-level group headers */}
      <tr>
        {/* Group: Selectors (Character + Action) */}
        <th className="groupHeader groupHeaderStatic" colSpan={2}>
          <HeaderContent label="Selectors" icon="assets/table/selector.png" />
        </th>

        {/* Group: Basic Columns */}
        {(() => {
          const visibleBasicCols = countVisible(tableConfig.basic.columns)
          if (!visibleBasicCols) return null
          return (
            <th className="groupHeader" colSpan={visibleBasicCols} onClick={() => handleGroupClick(tableConfig.basic.columns)}>
              <HeaderContent label={tableConfig.basic.label} icon={tableConfig.basic.icon} />
            </th>
          )
        })()}



        {/* Group: Status Effects */}
        {tableConfig.statusEffects &&
          (() => {
            const visibleCols = tableConfig.statusEffects.columns.filter(col => columnVisibility[col.key]).length
            if (!visibleCols) return null
            return (
              <th className="groupHeader" colSpan={visibleCols} onClick={() => handleGroupClick(tableConfig.statusEffects!.columns)}>
                <HeaderContent label={tableConfig.statusEffects.label} icon={tableConfig.statusEffects.icon} />
              </th>
            )
          })()}

        {/* Group: Other */}
        {tableConfig.other &&
          (() => {
            const visibleCols = tableConfig.other.columns.filter(col => columnVisibility[col.key]).length
            if (!visibleCols) return null
            return (
              <th className="groupHeader" colSpan={visibleCols} onClick={() => handleGroupClick(tableConfig.other!.columns)}>
                <HeaderContent label={tableConfig.other.label} icon={tableConfig.other.icon} />
              </th>
            )
          })()}

      </tr>

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

function HeaderContent({ label, icon }: { label: string; icon?: string }) {
  return (
    <div className="header-content">
      <IconRenderer icon={icon} alt={label} />
      <span>{label}</span>
    </div>
  )
}
