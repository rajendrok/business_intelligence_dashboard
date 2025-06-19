import React, { useState } from "react";
import './SchemaView.css';
import Visualise from './Visualise/visualise'; // ✅ adjust path if needed

function SchemaView({ schema, onSelectTable }) {
  if (!schema) return null;

  return (
    <div className="schema-container">
      <div className="schema-main">
        <div className="schema-tables">
          <h2>Tables</h2>
          {Object.entries(schema.tables).map(([table, columns]) => (
            <TableAccordion
              key={table}
              table={table}
              columns={columns}
              onSelectTable={onSelectTable}
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

      <div className="schema-views">
        <h2>Views</h2>
        {Object.entries(schema.views).map(([view, columns]) => (
          <TableAccordion
            key={view}
            table={view}
            columns={columns}
            onSelectTable={onSelectTable}
          />
        ))}
      </div>
    </div>
  );
}

function TableAccordion({ table, columns, onSelectTable }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div className="accordion">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          onSelectTable(table, e.target.checked);
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
            <li key={col}>{col}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SchemaView;
