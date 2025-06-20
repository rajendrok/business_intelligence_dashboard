import React, { useState } from "react";
import './SchemaView.css';
import Visualise from './Visualise/visualise';

function SchemaView({ schema, onSelectTable }) {
  const [selectedTables, setSelectedTables] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({});
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState(null);

  const handleSubmitQuery = async () => {
    if (!queryText.trim()) {
      alert("Please enter a query.");
      return;
    }

    setQueryResult(null); // Clear previous result

    const payload = {
      username: "root",
      password: "Kush@789#",
      host: "dev.wikibedtimestories.com",
      port: 31347,
      database: "WBS",
      driver: "mysql",
      query: queryText,
    };

    try {
      const response = await fetch('http://localhost:8080/custom-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (Array.isArray(data.data) && data.data.length > 0) {
        const columns = Object.keys(data.data[0]);
        const rows = data.data.map((rowObj) => columns.map((col) => rowObj[col]));

        setQueryResult({ columns, rows });
      } else {
        setQueryResult({ error: "No data returned from query." });
      }
    } catch (error) {
      console.error("Query execution failed:", error);
      setQueryResult({ error: "Failed to execute query" });
    }
  };
  

  const handleSelectTable = (table, isChecked) => {
    setSelectedTables((prev) => ({
      ...prev,
      [table]: isChecked,
    }));
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
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <button className="query-submit-button" onClick={handleSubmitQuery}>
            Submit Query
          </button>
          {queryResult && queryResult.columns?.length > 0 && queryResult.rows?.length > 0 && (
            <div className="query-result-table">
              <table>
                <thead>
                  <tr>
                    {queryResult.columns.map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div id="graph_list">
            <Visualise />

           

            {queryResult?.error && (
              <div className="query-error">⚠️ {queryResult.error}</div>
            )}
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
