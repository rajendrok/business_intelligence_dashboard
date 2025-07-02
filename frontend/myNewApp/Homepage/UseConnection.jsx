import { useState } from 'react';
import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

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
    const count = connections.filter(c => c.driver === driver).length + 1;
    setConnections(prev => [...prev, { driver, key: `${driver}_${count}` }]);
  };

  const removeConnection = (key) => {
    const removeKey = obj => {
      const copy = { ...obj };
      delete copy[key];
      return copy;
    };
    setConnections(prev => prev.filter(c => c.key !== key));
    [setSchemas, setCredentials, setLoadingConnections, setSelectedTables, setTableData, setCustomQueryResults, setSelectedGraphs]
      .forEach(fn => fn(prev => removeKey(prev)));
  };

  const updateCredentials = (key, creds) =>
    setCredentials(prev => ({ ...prev, [key]: creds }));

  const submitCredentials = async (key, driver) => {
    const creds = credentials[key];
    if (!creds) return;

    const normalized = { ...creds, port: Number(creds.port), driver };
    setLoadingConnections(prev => ({ ...prev, [key]: true }));

    try {
      const res = await fetch(`${BASE_URL}/db-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      });
      if (res.ok) {
        const data = await res.json();
        setSchemas(prev => ({
          ...prev,
          [key]: { schema: data.schema, creds: normalized },
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConnections(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleTableSelection = (dbKey, table, isChecked) => {
    setSelectedTables(prev => {
      const updated = { ...prev };
      const tbls = { ...(updated[dbKey] || {}) };
      if (isChecked) tbls[table] = tbls[table] || [];
      else delete tbls[table];
      updated[dbKey] = tbls;
      return updated;
    });
  };

  const toggleColumnSelection = (dbKey, table, column, isChecked) => {
    setSelectedTables(prev => {
      const updated = { ...prev };
      const tbls = { ...(updated[dbKey] || {}) };
      const cols = tbls[table] || [];
      tbls[table] = isChecked ? [...new Set([...cols, column])] : cols.filter(c => c !== column);
      updated[dbKey] = tbls;
      return updated;
    });
  };

  const loadData = async () => {
    for (const key in schemas) {
      const tablesWithCols = selectedTables[key];
      if (!tablesWithCols || !Object.keys(tablesWithCols).length) continue;

      try {
        const res = await fetch(`${BASE_URL}/table-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...schemas[key].creds,
            tables: tablesWithCols,
            limit: 10,
            offset: 0,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setTableData(prev => ({ ...prev, [key]: data }));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return {
    connections,
    addConnection,
    removeConnection,
    credentials,
    updateCredentials,
    submitCredentials,
    schemas,
    selectedTables,
    toggleTableSelection,
    toggleColumnSelection,
    loadData,
    tableData,
    customQueryResults,
    setCustomQueryResults,
    selectedGraphs,
    setSelectedGraphs,
    loadingConnections,
  };
}
