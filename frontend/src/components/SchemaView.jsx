import React, { useState } from "react";
import './SchemaView.css';

function SchemaView({ schema, selectedTables, onToggleColumn, onToggleTable }) {
  if (!schema) return null;

  return (
    <div className="schema-column-wrapper">
      {/* Tables Section */}
      <div className="schema-section">
        <h2>Tables</h2>
        <div className="scrollable-list">
          {Object.entries(schema.tables || {}).map(([table, columns]) => (
            <TableAccordion
              key={table}
              table={table}
              columns={columns}
              selectedColumns={selectedTables[table]}
              onToggleColumn={onToggleColumn}
              onToggleTable={onToggleTable}
            />
          ))}
        </div>
      </div>

      {/* Views Section */}
      <div className="schema-section">
        <h2>Views</h2>
        <div className="scrollable-list">
          {Object.entries(schema.views || {}).map(([view, columns]) => (
            <TableAccordion
              key={view}
              table={view}
              columns={columns}
              selectedColumns={selectedTables[view]}
              onToggleColumn={onToggleColumn}
              onToggleTable={onToggleTable}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TableAccordion({ table, columns, selectedColumns, onToggleColumn, onToggleTable }) {
  const [open, setOpen] = useState(false);
  const tableChecked = selectedColumns !== undefined;

  return (
    <div className="accordion">
      <label>
        <input
          type="checkbox"
          checked={tableChecked}
          onChange={(e) => onToggleTable(table, e.target.checked)}
        />
        <strong
          style={{ marginLeft: "8px", cursor: "pointer" }}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "[-]" : "[+]"} {table}
        </strong>
      </label>

      {open && tableChecked && (
        <ul>
          {columns.map((col) => (
            <li key={col}>
              <label>
                <input
                  type="checkbox"
                  checked={(selectedColumns || []).includes(col)}
                  onChange={(e) => onToggleColumn(table, col, e.target.checked)}
                />
                <span style={{ marginLeft: "8px" }}>{col}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SchemaView;
