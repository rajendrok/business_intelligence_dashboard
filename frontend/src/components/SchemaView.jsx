// src/components/SchemaView.js
import React, { useState } from "react";
import './SchemaView.css';  
function SchemaView({ schema, onSelectTable }) {
  if (!schema) return null;

  return (
    <>
      <div style={{ width: "50vh", display: "flex" }}>
        <div id="for_table">
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
        <div id="for_query" style={{width :"40vw"}}>
          <textarea id="textarea"/>
           <button id="query-submit-button">Submit Query</button>
        </div>
      </div>

      <div>
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
    </>
  );
}

function TableAccordion({ table, columns, onSelectTable }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <div style={{ border: "1px solid #ccc", margin: "5px", padding: "10px" }}>
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
