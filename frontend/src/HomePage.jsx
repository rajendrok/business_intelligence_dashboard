import React, { useState } from "react";
import DatabaseSelector from "./components/DatabaseSelector";
import CredentialsModal from "./components/CredentialsModal";
import SchemaView from "./components/SchemaView";
import CustomQuery from "./components/CustomQuery";

var username = "root";
var password = "Kush@789#";
var host = "dev.wikibedtimestories.com";
var database = "WBS";
var driver = "mysql";
var port = 31347;

function HomePage() {
  const [selectedDb, setSelectedDb] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [schema, setSchema] = useState(null);
  const [selectedTables, setSelectedTables] = useState([]);
  const [credentials, setCredentials] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [queryData, setQueryData] = useState(null);

  const handleSelect = (db) => {
    setSelectedDb(db);
    if (db) setIsOpen(true);
  };

  const handleSubmit = async (creds) => {
    setIsOpen(false);
    setCredentials(creds);
    try {
      const payload = {
        username,
        password,
        host,
        port,
        database,
        driver,
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

  const handleSelectTable = (table, isChecked) => {
    setSelectedTables((prev) =>
      isChecked ? [...prev, table] : prev.filter((t) => t !== table)
    );
  };

  const handleLoadData = async (page = 1, limit = 50) => {
    if (!credentials) return;

    try {
      const payload = {
        username,
        password,
        host,
        port,
        database,
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

  const handleCustomQuery = async (query) => {
    try {
      const payload = {
        username,
        password,
        host,
        port,
        database,
        driver,
        query,
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

      {tableData?.data && Object.keys(tableData.data).length > 0 && (
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
                          <td key={column}>{row[column]}</td>
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
          <br />
        </div>
      )}

      <div style={{ padding: '20px' }}>
        <CustomQuery onExecute={handleCustomQuery} />
      </div>
    </div>
  );
}

export default HomePage;
