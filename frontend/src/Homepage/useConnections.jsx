import { useState } from "react";

export default function useConnections() {
  const [connections, setConnections] = useState([]);
  const [schemas, setSchemas] = useState({});
  const [credentials, setCredentials] = useState({});
  const [loadingConnections, setLoadingConnections] = useState({});
  const [selectedTables, setSelectedTables] = useState({});
  const [tableData, setTableData] = useState({});
  const [customQueryResults, setCustomQueryResults] = useState({});
  const [selectedGraphs, setSelectedGraphs] = useState({});

  const addConnection = (driver) => {
    const count = connections.filter((c) => c.driver === driver).length + 1;
    setConnections((prev) => [...prev, { driver, key: `${driver}_${count}` }]);
  };

  const removeConnection = (key) => {
    const removeKey = (obj) => {
      const updated = { ...obj };
      delete updated[key];
      return updated;
    };
    setConnections((prev) => prev.filter((c) => c.key !== key));
    [setSchemas, setCredentials, setLoadingConnections, setSelectedTables, setTableData, setCustomQueryResults, setSelectedGraphs]
      .forEach((setFn) => setFn((prev) => removeKey(prev)));
  };

  const updateCredentials = (key, creds) => setCredentials((prev) => ({ ...prev, [key]: creds }));

  const submitCredentials = async (key, driver) => {
    const creds = credentials[key];
    if (!creds) return;

    const normalizedCreds = {
      ...creds,
      port: Number(creds.port),
      driver,
    };

    setLoadingConnections((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await fetch("http://localhost:8080/db-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedCreds), // ✅ send normalized creds
      });

      if (res.ok) {
        const data = await res.json();
        setSchemas((prev) => ({
          ...prev,
          [key]: {
            schema: data.schema,
            creds: normalizedCreds, // ✅ store normalized creds directly
          },
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConnections((prev) => ({ ...prev, [key]: false }));
    }
  };
  
  const toggleTableSelection = (dbKey, table, isChecked) => {
    setSelectedTables((prev) => {
      const updated = { ...prev };
      const tableMap = updated[dbKey] || {};
      if (isChecked) tableMap[table] = tableMap[table] || [];
      else delete tableMap[table];
      updated[dbKey] = { ...tableMap };
      return updated;
    });
  };

  const toggleColumnSelection = (dbKey, table, column, isChecked) => {
    setSelectedTables((prev) => {
      const updated = { ...prev };
      const tableMap = updated[dbKey] || {};
      const columns = tableMap[table] || [];
      tableMap[table] = isChecked ? [...new Set([...columns, column])] : columns.filter((c) => c !== column);
      updated[dbKey] = tableMap;
      return updated;
    });
  };

  const loadData = async () => {
    for (const key in schemas) {
      const tablesWithColumns = selectedTables[key];
      if (!tablesWithColumns || Object.keys(tablesWithColumns).length === 0) continue;

      try {
        const res = await fetch("http://localhost:8080/table-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...schemas[key].creds, tables: tablesWithColumns, limit: 10, offset: 0 }),
        });

        if (res.ok) {
          const data = await res.json();
          setTableData((prev) => ({ ...prev, [key]: data }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return {
    connections, addConnection, removeConnection,
    credentials, updateCredentials, submitCredentials,
    schemas, selectedTables, toggleTableSelection, toggleColumnSelection,
    loadData, tableData, customQueryResults, setCustomQueryResults,
    selectedGraphs, setSelectedGraphs, loadingConnections,
  };
}
