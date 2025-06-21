import React, { useState } from "react";
import DatabaseSelector from "./components/DatabaseSelector";
import CredentialsModal from "./components/CredentialsModal";
import SchemaView from "./components/SchemaView";
import CustomQueryBox from "./components/CustomQueryBox";
import Visualise from "./components/Visualise/visualise";
import "./index.css";

// Util to generate consistent colors
const getColorForKey = (key) => {
  const colors = ["#ffe0e0", "#e0ffe0", "#e0e0ff", "#fff4e0", "#e0fff8", "#f8e0ff", "#f0e0ff"];
  const hash = key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

function HomePage() {
  const [connections, setConnections] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [selectedTables, setSelectedTables] = useState({});
  const [tableData, setTableData] = useState({});
  const [customQueryResults, setCustomQueryResults] = useState({});
  const [selectedGraphs, setSelectedGraphs] = useState({});
  const [loadingConnections, setLoadingConnections] = useState({});
  const [credentials, setCredentials] = useState({});

  const addConnection = (driver) => {
    const count = connections.filter((c) => c.driver === driver).length + 1;
    const key = `${driver}_${count}`;
    setConnections((prev) => [...prev, { driver, key }]);
  };

  const removeKey = (obj, key) => {
    const updated = { ...obj };
    delete updated[key];
    return updated;
  };

  const removeConnection = (key) => {
    setConnections((prev) => prev.filter((c) => c.key !== key));
    [setSchemas, setSelectedTables, setTableData, setCustomQueryResults, setCredentials, setLoadingConnections, setSelectedGraphs]
      .forEach(setFn => setFn(prev => removeKey(prev, key)));
  };

  const updateCredentials = (key, newCreds) => {
    setCredentials((prev) => ({ ...prev, [key]: newCreds }));
  };

  const submitCredentials = async (key, driver) => {
    const creds = credentials[key];
    if (!creds) return;

    setLoadingConnections((prev) => ({ ...prev, [key]: true }));

    try {
      const payload = { ...creds, port: Number(creds.port), driver };
      const res = await fetch("http://localhost:8080/db-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSchemas((prev) => ({ ...prev, [key]: { schema: data.schema, creds: payload } }));
      } else {
        console.error("Schema fetch failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConnections((prev) => ({ ...prev, [key]: false }));
    }
  };

  const toggleTableSelection = (key, table, isChecked) => {
    setSelectedTables((prev) => {
      const updated = { ...prev };
      const current = updated[key] || [];
      updated[key] = isChecked ? [...current, table] : current.filter((t) => t !== table);
      return updated;
    });
  };

  const loadData = async () => {
    for (const key in schemas) {
      const selectedT = selectedTables[key];
      const selectedColumns = schemas[key].schema.columns;
      if (!selectedT || selectedT.length === 0) continue;

      const creds = schemas[key].creds;
      const payload = { ...creds, tables: selectedT, columns: selectedColumns, page: 1, limit: 50 };

      try {
        const res = await fetch("http://localhost:8080/table-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setTableData((prev) => ({ ...prev, [key]: data }));
        } else {
          console.error("Table data fetch failed");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderCustomQueryBox = (key) => (
    <div style={{ width: "20vw" }}>
      <CustomQueryBox
        creds={schemas[key].creds}
        onResult={(result) =>
          setCustomQueryResults((prev) => ({ ...prev, [key]: result }))
        }
      />
    </div>
  );

  const renderGraph = (key) => selectedGraphs[key] && (
    <div
      style={{
        marginTop: "15px",
        padding: "10px",
        background: "#fafafa",
        border: "2px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        width: "70%",
        height: "450px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", height: "100%" }}>
        {selectedGraphs[key]}
      </div>
    </div>
  );

  const renderQueryResult = (key) => customQueryResults[key] && (
    <div style={{ marginTop: "10px" }}>
      <h3>Custom Query Result for {key.toUpperCase()}</h3>
      <table border="1" cellPadding="5" style={{ width: "100%", backgroundColor: "#fff" }}>
        <thead>
          <tr>
            {Object.keys(customQueryResults[key][0] || {}).map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customQueryResults[key].map((row, i) => (
            <tr key={i}>
              {Object.entries(row).map(([col, val]) => (
                <td key={col}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTableData = (key) => {
    const data = tableData[key]?.data;
    return data && Object.keys(data).length > 0 && Object.entries(data).map(([tableName, rows]) => (
      <div key={tableName} style={{ marginBottom: "15px" }}>
        <h3>{tableName}</h3>
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="5" style={{ width: "100%", backgroundColor: "#fff" }}>
            <thead>
              <tr>{Object.keys(rows[0] || {}).map((col) => <th key={col}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {Object.entries(row).map(([col, val]) => (
                    <td key={col}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Multi-DB Schema Viewer</h1>
      <DatabaseSelector onAddDatabase={addConnection} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
        {connections.map(({ driver, key }) => (
          <div key={key} style={{ border: "1px solid black", padding: "10px", minWidth: "350px", position: "relative", borderRadius: "8px" }}>
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}>
              {key.toUpperCase()}
            </div>
            <button onClick={() => removeConnection(key)} style={{ position: "absolute", top: "5px", right: "5px" }}>❌</button>
            <CredentialsModal
              driver={driver}
              credentials={credentials[key] || {}}
              onChange={(creds) => updateCredentials(key, creds)}
            />
            <button onClick={() => submitCredentials(key, driver)} style={{ marginTop: "5px", marginBottom: "10px" }}>
              {loadingConnections[key] ? "Connecting..." : "✔ Connect"}
            </button>
            {schemas[key] && (
              <>
                {renderCustomQueryBox(key)}
                <SchemaView
                  driver={driver}
                  schema={schemas[key].schema}
                  onSelectTable={(table, isChecked) => toggleTableSelection(key, table, isChecked)}
                />
                <div style={{ width: "30vw" }}>
                  <Visualise onSelectChart={(chart) => setSelectedGraphs((prev) => ({ ...prev, [key]: chart }))} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {connections.length > 0 && (
        <>
          <button style={{ marginTop: "20px" }} onClick={loadData}>Load Selected Table Data</button>

          <div style={{ marginTop: "20px" }}>
            {connections.map(({ key }) => (
              <div key={key} style={{ background: getColorForKey(key), padding: "15px", borderRadius: "10px", marginBottom: "25px", border: "2px solid #888" }}>
                <h2 style={{ textAlign: "center", marginBottom: "10px" }}>{key.toUpperCase()} Output</h2>
                {renderTableData(key)}
                {renderQueryResult(key)}
                {renderGraph(key)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;
