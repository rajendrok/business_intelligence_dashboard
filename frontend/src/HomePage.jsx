import React, { useState } from "react";
import DatabaseSelector from "./components/DatabaseSelector";
import CredentialsModal from "./components/CredentialsModal";
import SchemaView from "./components/SchemaView";
import CustomQueryBox from "./components/CustomQueryBox"; // ✅ Import one-file SQL query UI

function HomePage() {
  const [connections, setConnections] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [selectedTables, setSelectedTables] = useState({});
  const [tableData, setTableData] = useState({});
  const [loadingConnections, setLoadingConnections] = useState({});
  const [credentials, setCredentials] = useState({});

  const handleAddConnection = (driver) => {
    if (connections.find((c) => c.driver === driver)) return;
    setConnections((prev) => [...prev, { driver }]);
  };

  const handleRemoveConnection = (driver) => {
    setConnections((prev) => prev.filter((c) => c.driver !== driver));
    setSchemas((prev) => {
      const updated = { ...prev };
      delete updated[driver];
      return updated;
    });
    setSelectedTables((prev) => {
      const updated = { ...prev };
      delete updated[driver];
      return updated;
    });
    setTableData((prev) => {
      const updated = { ...prev };
      delete updated[driver];
      return updated;
    });
    setCredentials((prev) => {
      const updated = { ...prev };
      delete updated[driver];
      return updated;
    });
  };

  const handleCredentialChange = (driver, newCreds) => {
    setCredentials((prev) => ({ ...prev, [driver]: newCreds }));
  };

  const handleCredentialSubmit = async (driver) => {
    const creds = credentials[driver];
    if (!creds) return;

    setLoadingConnections((prev) => ({ ...prev, [driver]: true }));

    try {
      const payload = {
        username: creds.username,
        password: creds.password,
        host: creds.host,
        port: Number(creds.port),
        database: creds.database,
        driver,
      };
      const res = await fetch("http://localhost:8080/db-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setSchemas((prev) => ({ ...prev, [driver]: { schema: data.schema, creds: payload } }));
      } else {
        console.error("API Error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConnections((prev) => ({ ...prev, [driver]: false }));
    }
  };

  const handleSelectTable = (driver, table, isChecked) => {
    setSelectedTables((prev) => {
      const updated = { ...prev };
      if (!updated[driver]) updated[driver] = [];
      updated[driver] = isChecked
        ? [...updated[driver], table]
        : updated[driver].filter((t) => t !== table);
      return updated;
    });
  };

  const handleLoadData = async () => {
    for (const driver in schemas) {
      const selected = selectedTables[driver];
      if (!selected || selected.length === 0) continue;

      const creds = schemas[driver].creds;
      const payload = {
        ...creds,
        tables: selected,
        page: 1,
        limit: 50,
      };

      try {
        const res = await fetch("http://localhost:8080/table-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setTableData((prev) => ({ ...prev, [driver]: data }));
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
      <h1>Multi-DB Schema Viewer</h1>
      <DatabaseSelector onAddDatabase={handleAddConnection} />

      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        {connections.map(({ driver }) => (
          <div
            key={driver}
            style={{ border: "1px solid black", padding: "10px", minWidth: "300px", position: "relative" }}
          >
            <button
              onClick={() => handleRemoveConnection(driver)}
              style={{ position: "absolute", top: "5px", right: "5px" }}
            >
              ❌
            </button>

            <CredentialsModal
              driver={driver}
              credentials={credentials[driver] || {}}
              onChange={(creds) => handleCredentialChange(driver, creds)}
            />

            <button
              onClick={() => handleCredentialSubmit(driver)}
              style={{ marginTop: "5px", marginBottom: "10px" }}
            >
              {loadingConnections[driver] ? "Connecting..." : "✔ Connect"}
            </button>

            {schemas[driver] && (
              <>
                <SchemaView
                  driver={driver}
                  schema={schemas[driver].schema}
                  onSelectTable={(table, isChecked) => handleSelectTable(driver, table, isChecked)}
                />

                {/* ✅ SQL Query Section for this driver */}
                <CustomQueryBox creds={schemas[driver].creds} />
              </>
            )}
          </div>
        ))}
      </div>

      {Object.keys(schemas).length > 0 && (
        <button style={{ marginTop: "20px" }} onClick={handleLoadData}>
          Load Selected Table Data
        </button>
      )}

      {/* ✅ Normal Table Data */}
      {Object.entries(tableData).map(([driver, data]) => (
        <div key={driver} style={{ marginTop: "20px" }}>
          <h2>{driver.toUpperCase()} Table Data</h2>
          {data?.data && Object.keys(data.data).length > 0 ? (
            Object.entries(data.data).map(([tableName, rows]) => (
              <div key={tableName} style={{ marginBottom: "20px" }}>
                <h3>{tableName}</h3>
                <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
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
                        {Object.keys(row).map((col) => (
                          <td key={col}>{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <p>No data available for {driver}.</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default HomePage;
