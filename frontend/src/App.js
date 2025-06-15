import React, { useState } from "react";
import DatabaseSelector from "./components/DatabaseSelector";
import CredentialsModal from "./components/CredentialsModal";
import SchemaView from "./components/SchemaView";
import CustomQuery from "./components/CustomQuery";

var username = "root"
var password = "Kush@789#"
var host = "dev.wikibedtimestories.com"
var database = "WBS"
var driver = "mysql"
var port = 31347

// Main App
function App() {
  const [selectedDb, setSelectedDb] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [schema, setSchema] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);

  const [credentials, setCredentials] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [queryData, setQueryData] = useState(null);

  // Handle database select
  const handleSelect = (db) => {
    setSelectedDb(db);
    if (db) setIsOpen(true);
  };

  // Handle credentials submission and fetch schema
  const handleSubmit = async (creds) => {
    setIsOpen(false);
    setCredentials(creds);
    try {
      // const payload = {
      //   username: creds.username,
      //   password: creds.password,
      //   host: creds.host,
      //   port: Number(creds.port),
      //   database: creds.database,
      //   driver: selectedDb
      // };
      const payload = {
        username: username,
        password: password,
        host: host,
        port: port,
        database: database,
        driver: driver
      };
      const res = await fetch("http://localhost:8080/db-schema", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSchema(data.schema);
      } else {
        console.error('API Error');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle table select/unselect
  const handleSelectTable = (table, isChecked) => {
    setSelectedTables((prev) => {
      if (isChecked) {
        return [...prev, table];
      } else {
        return prev.filter((t) => t !== table);
      }
    });
  };

  // Handle loading table data
  const handleLoadData = async (page = 1, limit = 50) => {
    if (!credentials) return;

    try {
      const payload = {
        username: username,
        password: password,
        host: host,
        port: port,
        database: database,
        driver: selectedDb,
        tables: selectedTables,
        page,
        limit,
      };
      const res = await fetch("http://localhost:8080/table-data", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      } else {
        console.error('API Error while loading table data');
      }
    } catch (err) {
      console.error(err);
    }
  };
  // Handle custom query execution
  const handleCustomQuery = async (query) => {
    try {
      const payload = {
        username: username,
        password: password,
        host: host,
        port: port,
        database: database,
        driver: driver,
        query: query,
      };
      const res = await fetch("http://localhost:8080/custom-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setQueryData(data);
      } else {
        console.error('API Error while executing custom query');
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div style={{ padding: '20px' }}>
      <h1>Database Schema Viewer</h1>
      <DatabaseSelector onSelect={handleSelect} />
      <CredentialsModal isOpen={isOpen} onSubmit={handleSubmit} onClose={() => setIsOpen(false)} />
      {schema && (
        <>
          <SchemaView schema={schema} onSelectTable={handleSelectTable} />
          <br />
          <button onClick={() => handleLoadData(1, 50)}>Load Selected Table Data</button>
        </>
      )}

      {tableData && tableData.data && Object.keys(tableData.data).length > 0 && (
        <div>
          <h2>Table Data</h2>
          {Object.entries(tableData.data).map(([tableName, rows]) => (
            <div key={tableName}>
              <h3>{tableName}</h3>
              {Array.isArray(rows) && rows.length > 0 ? (
                <table border="1" cellPadding="10">
                  <thead>
                    <tr>
                      {Object.keys(rows[0] || {}).map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows?.map((row, i) => (
                      <tr key={i}>
                        {Object.keys(row).map((column) => (
                          <td key={column}>
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No data available</p>
              )}

            </div>
          ))}
        </div>
      )}
      <div style={{ padding: '20px' }}>
        {/*existing components*/}
        <CustomQuery onExecute={handleCustomQuery} />
        <TableView tableData={queryData} />
      </div>

    </div>
  )
}

export default App;
