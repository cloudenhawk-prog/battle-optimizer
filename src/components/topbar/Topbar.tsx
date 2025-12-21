import "../../styles/topbar/Topbar.css"
import type { ColumnVisibility, ColumnDef, TableConfig, ColumnGroup } from "../../types/tableDefinitions"
import React from "react"

type TopbarProps = {
  tableConfig: TableConfig
  allColumns: ColumnDef[]
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export default function Topbar({ tableConfig, columnVisibility, setColumnVisibility }: TopbarProps) {
  function toggleColumn(key: string) {
    setColumnVisibility(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const renderGroupButtons = (group: ColumnGroup) =>
    group.columns.map(col => (
      <button
        key={col.key}
        className={`topbarColumnButton ${columnVisibility[col.key] ? "is-hidden" : "is-visible"}`}
        onClick={() => toggleColumn(col.key)}
      >
        <img src={col.icon} alt={col.label} className="table-icon" />
      </button>
    ))

  const groups: ColumnGroup[] = [
    tableConfig.basic,
    ...tableConfig.characters,
    ...(tableConfig.negativeStatuses ? [tableConfig.negativeStatuses] : []),
    ...(tableConfig.buffs ? [tableConfig.buffs] : []),
    ...(tableConfig.debuffs ? [tableConfig.debuffs] : []),
  ]

  return (
    <div className="topbarWrapper">
      <div className="topbarBase">
        <div className="topbarColoring">
          <div 
            className="topbarColumnButton" 
          />

          {groups.map((group, idx) => (
            <React.Fragment key={group.label}>
              {idx === 0 && <div className="topbarSeparator" />}

              {renderGroupButtons(group)}

              {idx < groups.length - 1 && <div className="topbarSeparator" />}

              {idx === groups.length - 1 && <div className="topbarSeparator" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}