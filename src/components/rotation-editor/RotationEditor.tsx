import "../../styles/components/RotationEditor.css"
import { useRotationEditor } from "../../hooks/useRotationEditor"
import { characters } from "../../data/characters"
import { sharedColumns } from "../../data/columnSets"
import type { ColumnDef } from "../../types/tables"
import type { Character, Action } from "../../types/characters"
import type { Snapshot } from "../../types/snapshots"

type RotationEditorPageProps = {
  selectedCharacters: Character[]
}

export default function RotationEditorPage({ selectedCharacters }: RotationEditorPageProps) {
  const { snapshots, handleCharacterSelect, handleActionSelect } = useRotationEditor()

  const activeNegativeStatuses = Array.from(
    new Set(selectedCharacters.flatMap((c: Character) => c.negativeStatuses))
  )

  const negativeStatusColumns: ColumnDef[] = activeNegativeStatuses.map((status: string) => {
    const key = status.replace(/\s+/g, "")
    return {
      key,
      label: status,
      render: (snapshot: Snapshot) => {
        const value = snapshot[key as keyof Snapshot]
        return typeof value === "number" ? value : 0
      },
    }
  })

  // Build grouped dynamic columns per character
  const groupedColumns: { label: string; columns: ColumnDef[] }[] = characters.map((c: Character) => ({
    label: c.name,
    columns: [
      { key: `${c.name}_energy`, label: "Energy", render: (snapshot: Snapshot) => snapshot.energy },
      { key: `${c.name}_concerto`, label: "Concerto", render: (snapshot: Snapshot) => snapshot.concerto },
      { key: `${c.name}_forte`, label: "Forte", render: (snapshot: Snapshot) => snapshot.forte },
      ...(c.dynamicColumns?.map((col: ColumnDef) => ({
        ...col,
        key: `${c.name}_${col.key}`,
      })) ?? []),
    ],
  }))

  return (
    <div className="pageWrapper">
      <h1 className="heading">Rotation Editor</h1>

      <div className="tableWrapper">
        <table className="tableBase">
          <thead className="tableHeader">
            {/* Top-level group headers */}
            <tr>
              {/* Shared columns */}
              <th className="groupHeader" colSpan={2 + sharedColumns.filter((c: ColumnDef) => c.key !== "character" && c.key !== "action").length} style={{ textAlign: "center" }}>
                Shared
              </th>

              {/* Character-specific groups */}
              {selectedCharacters.map((c: Character) => (
                <th
                  key={c.name}
                  className="groupHeader"
                  colSpan={3 + (c.dynamicColumns?.length ?? 0)} // energy, concerto, forte + dynamicColumns
                  style={{ textAlign: "center" }}
                >
                  {c.name}
                </th>
              ))}

              {/* Negative Statuses group */}
              <th className="groupHeader" colSpan={activeNegativeStatuses.length} style={{ textAlign: "center" }}>
                Negative Statuses
              </th>
            </tr>

            {/* Column headers */}
            <tr>

              {/* Shared static columns */}
              <th className="tableCellHeader">Character</th>
              <th className="tableCellHeader">Action</th>
              {sharedColumns
                .filter((c: ColumnDef) => c.key !== "character" && c.key !== "action")
                .map((c: ColumnDef) => (
                  <th key={c.key} className="tableCellHeader">{c.label}</th>
                ))
              }

              {/* Character-specific columns */}
              {groupedColumns.flatMap((group) =>
                group.columns.map((col: ColumnDef, colIndex: number) => {
                  const applyLeftBorder = colIndex === 0
                  return (
                    <th
                      key={col.key}
                      className={`tableCellHeader ${applyLeftBorder ? "charGroupHeader" : ""}`}
                    >
                      {col.label}
                    </th>
                  )
                })
              )}

              {/* Negative Status Columns */}
              {negativeStatusColumns.map((col: ColumnDef, index: number) => {
                const applyLeftBorder = index === 0
                return (
                  <th
                    key={col.key}
                    className={`tableCellHeader ${applyLeftBorder ? "charGroupHeader" : ""}`}
                  >
                    {col.label}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody className="tableBody">
            {snapshots.map((s: Snapshot, index: number) => (
              <tr key={s.id} className={index === snapshots.length - 1 ? "lastRowClass" : ""}>

                {/* Character select */}
                <td className="tableCellBody">
                  <select
                    className="selectInput"
                    value={s.character}
                    onChange={(e) => handleCharacterSelect(s.id, e.target.value)}
                  >
                    <option value="">-- Select Character --</option>
                    {characters.map((c: Character) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </td>

                {/* Action select */}
                <td className="tableCellBody">
                  <select
                    className="selectInput"
                    value={s.action}
                    onChange={(e) => handleActionSelect(s.id, e.target.value)}
                    disabled={!s.character}
                  >
                    <option value="">-- Select Action --</option>
                    {characters.find(c => c.name === s.character)?.actions.map((a: Action) => (
                      <option key={a.name} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </td>

                {/* Static columns */}
                {sharedColumns
                  .filter((c: ColumnDef) => c.key !== "character" && c.key !== "action")
                  .map((col: ColumnDef) => (
                    <td key={col.key} className="tableCellBody">
                      {s.character && s.action ? col.render(s) : ""}
                    </td>
                  ))
                }

                {/* Character-specific columns */}
                {groupedColumns.flatMap((group) =>
                  group.columns.map((col: ColumnDef, colIndex: number) => {
                    const applyLeftBorder = colIndex === 0
                    return (
                      <td
                        key={col.key}
                        className={`tableCellBody ${applyLeftBorder ? "charGroupBody" : ""}`}
                      >
                        {s.character && s.action ? col.render(s) : ""}
                      </td>
                    )
                  })
                )}

                {/* Negative Status Columns */}
                {negativeStatusColumns.map((col: ColumnDef, index: number) => {
                  const applyLeftBorder = index === 0
                  return (
                    <td
                      key={col.key}
                      className={`tableCellBody ${applyLeftBorder ? "charGroupBody" : ""}`}
                    >
                      {s.character && s.action ? col.render(s) : ""}
                    </td>
                  )
                })}

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}




