import React from "react";

export default function TableOutput({ dbKey, tableData, customQueryResults }) {
  return (
    <div
      style={{
        background: "#f9f9f9",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "25px",
        border: "2px solid #888",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>{dbKey.toUpperCase()} Output</h2>

      {/* Table Data */}
      {tableData?.data && Object.entries(tableData.data).map(([tableName, rows]) => (
        <div key={tableName} style={{ marginBottom: "15px" }}>
          <h3>{tableName}</h3>
          {Array.isArray(rows) && rows.length > 0 ? (
            <div className="fixed-table-container">
              <table>
                <thead>
                  <tr>
                    {Object.keys(rows[0]).map((col) => <th key={col}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i}>
                      {Object.entries(row).map(([col, val]) => <td key={col}>{val}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ fontStyle: "italic", color: "gray" }}>
              No data available for <strong>{tableName}</strong>
            </p>
          )}
        </div>
      ))}

      {/* Custom Query Results */}
      {customQueryResults && Array.isArray(customQueryResults) && (
        <div style={{ marginTop: "10px" }}>
          <h3>Custom Query Result for {dbKey.toUpperCase()}</h3>
          <div className="fixed-table-container">
            <table>
              <thead>
                <tr>
                  {Object.keys(customQueryResults[0] || {}).map((col) => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {customQueryResults.map((row, i) => (
                  <tr key={i}>
                    {Object.entries(row).map(([col, val]) => <td key={col}>{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
