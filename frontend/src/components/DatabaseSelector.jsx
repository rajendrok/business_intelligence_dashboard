import React from "react";

function DatabaseSelector({ onAddDatabase }) {
  return (
    <div>
      <label>Choose Database:</label>

      <div
        style={{
          maxWidth: "100%",            // allow full width of parent
          overflowX: "auto",           // enable horizontal scroll
          whiteSpace: "nowrap",        // keep buttons in one line
          border: "1px solid #ccc",
          padding: "10px",
          marginTop: "10px",
        }}
      >
        <button onClick={() => onAddDatabase("mysql")} style={{ marginRight: "8px" }}>➕ MySQL</button>
        <button onClick={() => onAddDatabase("postgres")} style={{ marginRight: "8px" }}>➕ Postgres</button>
        <button onClick={() => onAddDatabase("oracle")} style={{ marginRight: "8px" }}>➕ Oracle</button>
        <button onClick={() => onAddDatabase("sqlserver")} style={{ marginRight: "8px" }}>➕ SQL Server</button>
        <button onClick={() => onAddDatabase("sqlite")} style={{ marginRight: "8px" }}>➕ SQLite</button>
        <button onClick={() => onAddDatabase("mongodb")} style={{ marginRight: "8px" }}>➕ MongoDB</button>
        <button onClick={() => onAddDatabase("cassandra")} style={{ marginRight: "8px" }}>➕ Cassandra</button>
        <button onClick={() => onAddDatabase("neo4j")} style={{ marginRight: "8px" }}>➕ Neo4j</button>
        <button onClick={() => onAddDatabase("clickhouse")} style={{ marginRight: "8px" }}>➕ ClickHouse</button>
        <button onClick={() => onAddDatabase("druid")} style={{ marginRight: "8px" }}>➕ Druid</button>
        <button onClick={() => onAddDatabase("firebase")} style={{ marginRight: "8px" }}>➕ Firebase</button>
      </div>
    </div>
  );
}

export default DatabaseSelector;
