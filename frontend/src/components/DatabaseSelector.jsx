import React from "react";

function DatabaseSelector({ onAddDatabase }) {
  return (
    <div>
      <label>Choose Database:</label>

      <div
        style={{
          maxHeight: "200px",         // control the height of scroll
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          marginTop: "10px",
          display: "flex",
          flexDirection: "column",    // <-- THIS makes them stack vertically
          gap: "8px",
         width:"7vw"
        }}
      >
        <button onClick={() => onAddDatabase("mysql")}>➕ MySQL</button>
        <button onClick={() => onAddDatabase("postgres")}>➕ Postgres</button>
        <button onClick={() => onAddDatabase("oracle")}>➕ Oracle</button>
        <button onClick={() => onAddDatabase("sqlserver")}>➕ SQL Server</button>
        <button onClick={() => onAddDatabase("sqlite")}>➕ SQLite</button>
        <button onClick={() => onAddDatabase("mongodb")}>➕ MongoDB</button>
        <button onClick={() => onAddDatabase("cassandra")}>➕ Cassandra</button>
        <button onClick={() => onAddDatabase("neo4j")}>➕ Neo4j</button>
        <button onClick={() => onAddDatabase("clickhouse")}>➕ ClickHouse</button>
        <button onClick={() => onAddDatabase("druid")}>➕ Druid</button>
        <button onClick={() => onAddDatabase("firebase")}>➕ Firebase</button>
      </div>
    </div>
  );
}

export default DatabaseSelector;
