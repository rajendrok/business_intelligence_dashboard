import React from "react";

function DatabaseSelector({ onAddDatabase }) {
  return (
    <div>
      <label>Choose Database:</label>
      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button onClick={() => onAddDatabase("mysql")}>➕ MySQL</button>
        <button onClick={() => onAddDatabase("postgres")}>➕ Postgres</button>
        <button onClick={() => onAddDatabase("oracle")}>➕ Oracle</button>
      </div>
    </div>
  );
}

export default DatabaseSelector;
