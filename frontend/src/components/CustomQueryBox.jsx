import React, { useState } from "react";

function CustomQueryBox({ creds }) {
  const [sqlQuery, setSqlQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!sqlQuery.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

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
        setResult(data.data);
      } else {
        setError(data.error || "Query failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to render the query result table
  function renderQueryResult() {
    if (error) {
      return <p style={{ color: "red" }}>{error}</p>;
    }

    if (result && Array.isArray(result) && result.length > 0) {
      return (
        <div style={{ marginTop: "30px" }}>
          <h3>Query Result</h3>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {Object.keys(result[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, i) => (
                <tr key={i}>
                  {Object.keys(row).map((col) => (
                    <td key={col}>{String(row[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (result && Array.isArray(result) && result.length === 0) {
      return <p style={{ marginTop: "30px" }}>No data available.</p>;
    }

    return null;
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Run Custom SQL Query</h2>
      <div style={{ position: "relative", width: "100%" }}>
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
            style={{
              marginTop: "-10px",
              whiteSpace: "nowrap"
            }}
          >
            {loading ? "Running..." : "Submit Query"}
          </button>
        </div>
      </div>

      {/* Add space after the button */}
      <div style={{ height: "24px" }} />

      {renderQueryResult()}

      {/* Space for new object/graph below */}
      <div style={{ marginTop: "40px" }} />
    </div>
  );
}

export default CustomQueryBox;
