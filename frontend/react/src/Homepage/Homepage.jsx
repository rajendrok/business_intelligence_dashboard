import React, { useState } from "react";
import DatabaseSelector from "../components/DatabaseSelector";
import useConnections from "./useConnections";
import { getColorForKey } from "./colorUtils";
import ConnectionBlock from "./ConnectionBlock";
import TableOutput from "./TableOutput";
import GraphOutput from "./GraphOutput";

export default function HomePage() {
  const {
    connections, addConnection, removeConnection,
    credentials, updateCredentials, submitCredentials,
    schemas, selectedTables, toggleTableSelection, toggleColumnSelection,
    loadData, tableData, customQueryResults, setCustomQueryResults,
    selectedGraphs, setSelectedGraphs, loadingConnections,
  } = useConnections();

  const [showPopup, setShowPopup] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState("");

  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);
  const handleOperationChange = (e) => setSelectedOperation(e.target.value);

  const handlePopupLoadData = () => {
    console.log("Selected Operation:", selectedOperation);
    setShowPopup(false);
    loadData(); // modify later if you want to pass the selectedOperation
  };

  const operations = [
    {
      label: "INNER",
      value: "INNER",
      img: "https://www.ionos.de/digitalguide/fileadmin/DigitalGuide/Screenshots_2018/innerjoin.png", // replace with your image
    },
    {
      label: "FULL OUTER",
      value: "FULL OUTER",
      img: "https://images.ctfassets.net/xwxknivhjv1b/7hIqCjp2AlwIrXQLYvU1aa/a1911afdf05351ea02e9b943897522b7/image5__3_.png",
    },
    {
      label: "LEFT OUTER",
      value: "LEFT OUTER",
      img: "https://dailyblog908.weebly.com/uploads/1/3/7/7/137764733/198687306.jpg",
    },
    {
      label: "RIGHT OUTER",
      value: "RIGHT OUTER",
      img: "https://dotnettutorials.net/wp-content/uploads/2021/11/word-image-419.png",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Multi-DB Schema Viewer</h1>
      <DatabaseSelector onAddDatabase={addConnection} />

      <div style={{ display: "flex", gap: "10px", marginTop: "20px", width: "46vw" }}>
        {connections.map(({ driver, key }) => (
          <ConnectionBlock
            key={key}
            driver={driver}
            dbKey={key}
            schema={schemas[key]}
            credentials={credentials[key] || {}}
            loading={loadingConnections[key]}
            selectedTables={selectedTables[key] || {}}
            onRemove={() => removeConnection(key)}
            onUpdateCreds={(creds) => updateCredentials(key, creds)}
            onSubmitCreds={() => submitCredentials(key, driver)}
            onCustomQuery={(result) => setCustomQueryResults((prev) => ({ ...prev, [key]: result }))}
            onToggleColumn={(table, column, isChecked) => toggleColumnSelection(key, table, column, isChecked)}
            onToggleTable={(table, isChecked) => toggleTableSelection(key, table, isChecked)}
            onSelectChart={(chart) => setSelectedGraphs((prev) => ({ ...prev, [key]: chart }))}
          />
        ))}
      </div>

      {connections.length > 0 && (
        <>
          <button style={{ marginTop: "20px" }} onClick={handleOpenPopup}>
            Load Selected Table Data
          </button>

          <div style={{ marginTop: "20px" }}>
            {connections.map(({ key }) => (
              <div key={key} style={{ background: getColorForKey(key), borderRadius: "10px", padding: "10px" }}>
                <TableOutput
                  dbKey={key}
                  tableData={tableData[key]}
                  customQueryResults={customQueryResults[key]}
                />
                <GraphOutput graph={selectedGraphs[key]} />
              </div>
            ))}
          </div>
        </>
      )}

 {showPopup && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <div
      style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        width: "800px", // increased width to fit 4 images better
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      <h3>Select Set Operation</h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginTop: "10px",
          flexWrap: "wrap",
        }}
      >
        {operations.map((op) => (
          <div
            key={op.value}
            onClick={() => setSelectedOperation(op.value)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "5px",
              border: selectedOperation === op.value ? "3px solid #007BFF" : "2px solid transparent",
              borderRadius: "10px",
              transition: "transform 0.2s, border-color 0.2s",
              width: "22%", // forces better fitting, 4 in a row with small gaps
              minWidth: "100px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = "3px solid orange"; // colored border on hover
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = selectedOperation === op.value
                ? "3px solid #007BFF"
                : "2px solid transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <img
              src={op.img}
              alt={op.label}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "contain",
                marginBottom: "5px",
              }}
            />
            <span style={{ fontSize: "12px", textAlign: "center" }}>{op.label}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button onClick={handlePopupLoadData}>Load Data</button>
        <button onClick={handleClosePopup}>Cancel</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
