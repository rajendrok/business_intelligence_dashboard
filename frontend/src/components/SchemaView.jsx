import React, { useState } from "react";
import './SchemaView.css';
import Visualise from './Visualise/visualise';

function SchemaView({ schema, onSelectTable }) {
  const [selectedTables, setSelectedTables] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({});

  const handleSelectTable = (table, isChecked) => {
    setSelectedTables((prev) => ({ ...prev, [table]: isChecked }));
    onSelectTable(table, isChecked);
  };

  const handleSelectColumn = (table, column, isChecked) => {
    setSelectedColumns((prev) => {
      const updated = { ...prev };
      if (!updated[table]) updated[table] = {};
      updated[table][column] = isChecked;
      return updated;
    });
  };

  if (!schema) return null;

  return (
    <div className="schema-column-wrapper">
      {/* Tables section */}
      <div className="schema-section">
        <h2>Tables</h2>
        <div className="scrollable-list">
          {Object.entries(schema.tables).map(([table, columns]) => (
            <TableAccordion
              key={table}
              table={table}
              columns={columns}
              onSelectTable={handleSelectTable}
              onSelectColumn={handleSelectColumn}
              selectedColumns={selectedColumns[table] || {}}
            />
          ))}
        </div>
      </div>

      {/* Views section */}
      <div className="schema-section">
        <h2>Views</h2>
        <div className="scrollable-list">
          {Object.entries(schema.views).map(([view, columns]) => (
            <TableAccordion
              key={view}
              table={view}
              columns={columns}
              onSelectTable={handleSelectTable}
              onSelectColumn={handleSelectColumn}
              selectedColumns={selectedColumns[view] || {}}
            />
          ))}
        </div>
      </div>

      {/* Graphs section */}
      <div className="schema-section">
        <h2>Graphs</h2>
        <div className="scrollable-list">
          <Visualise />
        </div>
      </div>
    </div>
  );
}

function TableAccordion({ table, columns, onSelectTable, onSelectColumn, selectedColumns }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div className="accordion">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          const isChecked = e.target.checked;
          setChecked(isChecked);
          onSelectTable(table, isChecked);
        }}
      />
      <span
        onClick={() => setOpen((prev) => !prev)}
        style={{ cursor: "pointer", marginLeft: "10px" }}
      >
        {open ? "[-]" : "[+]"} {table}
      </span>

      {open && (
        <ul>
          {columns?.map((col) => (
            <li key={col}>
              <input
                type="checkbox"
                checked={!!selectedColumns[col]}
                onChange={(e) => onSelectColumn(table, col, e.target.checked)}
              />
              <span style={{ marginLeft: "8px" }}>{col}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SchemaView;
