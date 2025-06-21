import React, { useState } from "react";

function CustomQueryBox({ creds, onResult }) {
  const [sqlQuery, setSqlQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!sqlQuery.trim()) return;
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...creds,
        query: sqlQuery,
      };

      const res = await fetch("http://localhost:8080/custom-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        onResult(data.data); // ✅ Send result up to HomePage
      } else {
        setError(data.error || "Query failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Run Custom SQL Query</h2>
      <textarea
        rows="4"
        style={{ width: "100%", marginBottom: "10px", resize: "vertical" }}
        value={sqlQuery}
        onChange={(e) => setSqlQuery(e.target.value)}
        placeholder="Write your SELECT query here..."
      />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ whiteSpace: "nowrap" }}
        >
          {loading ? "Running..." : "Submit Query"}
        </button>
      </div>

      {/* Error display */}
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

export default CustomQueryBox;
