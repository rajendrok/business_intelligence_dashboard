import React from "react";

export default function GraphOutput({ graph }) {
  if (!graph) return null;

  return (
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
      <div style={{ width: "100%", height: "100%" }}>{graph}</div>
    </div>
  );
}
