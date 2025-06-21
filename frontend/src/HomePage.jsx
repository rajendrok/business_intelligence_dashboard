import React, { useState } from "react";
import DatabaseSelector from "./components/DatabaseSelector";
import CredentialsModal from "./components/CredentialsModal";
import SchemaView from "./components/SchemaView";
import CustomQueryBox from "./components/CustomQueryBox";
import Visualise from "./components/Visualise/visualise";
import "./index.css";

function HomePage() {
  const [connections, setConnections] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [selectedTables, setSelectedTables] = useState({});
  const [tableData, setTableData] = useState({});
  const [customQueryResults, setCustomQueryResults] = useState({});
  const [loadingConnections, setLoadingConnections] = useState({});
  const [credentials, setCredentials] = useState({});
  const [selectedCharts, setSelectedCharts] = useState({});

  const addConnection = (driver) => {
    const count = connections.filter((c) => c.driver === driver).length + 1;
    const key = `${driver}_${count}`;
    setConnections((prev) => [...prev, { driver, key }]);
  };

  const removeConnection = (key) => {
    setConnections((prev) => prev.filter((c) => c.key !== key));
    setSchemas((prev) => removeKey(prev, key));
    setSelectedTables((prev) => removeKey(prev, key));
    setTableData((prev) => removeKey(prev, key));
    setCustomQueryResults((prev) => removeKey(prev, key));
    setCredentials((prev) => removeKey(prev, key));
    setLoadingConnections((prev) => removeKey(prev, key));
    setSelectedCharts((prev) => removeKey(prev, key));
  };

  const removeKey = (obj, key) => {
    const updated = { ...obj };
    delete updated[key];
    return updated;
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
        console.error("API Error");
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
      const selected = selectedTables[key];
      if (!selected || selected.length === 0) continue;

      const creds = schemas[key].creds;
      const payload = { ...creds, tables: selected, page: 1, limit: 50 };

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
          console.error("API Error while loading table data");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Multi-DB Schema Viewer</h1>
      <DatabaseSelector onAddDatabase={addConnection} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
        {connections.map(({ driver, key }) => (
          <div
            key={key}
            style={{
              border: "1px solid black",
              padding: "10px",
              minWidth: "320px",
              maxWidth: "400px",
              position: "relative",
              overflowX: "auto",
            }}
          >
            <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}>
              {key.toUpperCase()}
            </div>

            <button
              onClick={() => removeConnection(key)}
              style={{ position: "absolute", top: "5px", right: "5px" }}
            >
              ❌
            </button>

            <CredentialsModal
              driver={driver}
              credentials={credentials[key] || {}}
              onChange={(creds) => updateCredentials(key, creds)}
            />

            <button
              onClick={() => submitCredentials(key, driver)}
              style={{ marginTop: "5px", marginBottom: "10px" }}
            >
              {loadingConnections[key] ? "Connecting..." : "✔ Connect"}
            </button>

            {schemas[key] && (
              <>
                <CustomQueryBox
                  creds={schemas[key].creds}
                  onResult={(result) =>
                    setCustomQueryResults((prev) => ({ ...prev, [key]: result }))
                  }
                />

                <SchemaView
                  driver={driver}
                  schema={schemas[key].schema}
                  onSelectTable={(table, isChecked) => toggleTableSelection(key, table, isChecked)}
                />

                <div>
                  <h3>Graphs</h3>
                  <Visualise onSelectChart={(chart) => setSelectedCharts((prev) => ({ ...prev, [key]: chart }))} />
                </div>

                {selectedCharts[key] && (
                  <div style={{ marginTop: "10px", padding: "10px", border: "1px solid gray" }}>
                    {selectedCharts[key]}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {connections.length > 0 && (
        <>
          <button style={{ marginTop: "20px" }} onClick={loadData}>
            Load Selected Table Data
          </button>

          <div style={{ marginTop: "20px" }}>
            {connections.map(({ key }) => (
              <div key={key} style={{ marginBottom: "20px" }}>
                {tableData[key] && Object.keys(tableData[key].data || {}).length > 0 && (
                  <>
                    {Object.entries(tableData[key].data).map(([tableName, rows]) => (
                      <div key={tableName} style={{ marginBottom: "10px" }}>
                        <h3>{tableName}</h3>
                        <div style={{ overflowX: "auto" }}>
                          <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
                            <thead>
                              <tr>
                                {Object.keys(rows[0] || {}).map((col) => (
                                  <th key={col}>{col}</th>
                                ))}
                              </tr>
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
                    ))}
                  </>
                )}

                {customQueryResults[key] && Array.isArray(customQueryResults[key]) && (
                  <div style={{ marginTop: "20px" }}>
                    <h3>Custom Query Result for {key.toUpperCase()}</h3>
                    <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
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
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HomePage;