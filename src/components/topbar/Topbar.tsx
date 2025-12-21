import "../../styles/topbar/Topbar.css"
import type { ColumnVisibility, ColumnDef } from "../../types/tableDefinitions"

type TopbarProps = {
  allColumns: ColumnDef[]
  columnVisibility: ColumnVisibility
  setColumnVisibility: React.Dispatch<React.SetStateAction<ColumnVisibility>>
}

export default function Topbar({ allColumns, columnVisibility, setColumnVisibility }: TopbarProps) {
  function toggleColumn(key: string) {
    setColumnVisibility(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="topbarWrapper">
      <div className="topbarBase">
        <div className="topbarColoring">
          {allColumns.map(col => (
            <button
              key={col.key}
              className={`topbarColumnButton ${
                columnVisibility[col.key] ? "is-hidden" : "is-visible"
              }`}
              onClick={() => toggleColumn(col.key)}
            >
              <img
                src={col.icon}
                alt={col.label}
                className="table-icon"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
