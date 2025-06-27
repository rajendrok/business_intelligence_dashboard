
import React, { useState } from "react";

export default function ConnectionCard({ db, children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "16px",
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "#fff",
        boxShadow: expanded
          ? "0 4px 12px rgba(0,0,0,0.15)"
          : "0 1px 3px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.3s ease",
        marginBottom: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <img
          src={db.icon}
          alt={db.name}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: "#f0f0f0",
            padding: 6,
            marginRight: 12,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "600", fontSize: "16px" }}>
            {db.label || "Production DB"}
          </div>
          <div style={{ color: "#555", fontSize: "13px" }}>{db.name}</div>
          <div style={{ color: "#aaa", fontSize: "12px" }}>
            {db.host || "prod-db.company.com"}
          </div>
        </div>
        <div style={{ fontSize: "18px", color: "#888" }}>
          {expanded ? "▲" : "▼"}
        </div>
      </div>

      {/* Status */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "green", fontSize: "13px" }}>● Connected</span>
        <span style={{ fontSize: "12px", color: "#888" }}>
          Last sync: 2 mins ago
        </span>
      </div>

      {/* Expandable Content */}
      {expanded && (
        <div
          style={{
            marginTop: 16,
            background: "#fafafa",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          {children || <div>Your form or connection UI here.</div>}
        </div>
      )}
    </div>
  );
}
