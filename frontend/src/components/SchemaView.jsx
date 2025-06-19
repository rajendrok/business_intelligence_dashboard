import React, { useState } from "react";
import './SchemaView.css';
import Visualise from './Visualise/visualise';

function SchemaView({ schema, onSelectTable }) {
  const [selectedTables, setSelectedTables] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({});

  const handleSelectTable = (table, isChecked) => {
    setSelectedTables((prev) => ({
      ...prev,
      [table]: isChecked,
    }));
    onSelectTable(table, isChecked); // ✅ Notify HomePage about table selection
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
    <div className="schema-container">
      <div className="schema-main">
        <div className="schema-tables scrollable-section">
          <div id="tables_heading"><h2 id="tables_head">Tables</h2></div>
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

        <div className="schema-query">
          <textarea
            className="query-textarea"
            placeholder="Write your query here..."
          />
          <button className="query-submit-button">Submit Query</button>

          <div id="graph_list">
            <Visualise />
          </div>
        </div>
      </div>

      <div className="schema-views scrollable-section">
        <div id="views_heading"><h2>Views</h2></div>
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
