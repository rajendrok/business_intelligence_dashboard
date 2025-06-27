
import React, { useState } from "react";
import DatabaseSelector from "../components/DatabaseSelector";
import useConnections from "./useConnections";
import { getColorForKey } from "./colorUtils";
import ConnectionBlock from "./ConnectionBlock";
import TableOutput from "./TableOutput";
import GraphOutput from "./GraphOutput";
import ConnectionCard from "../components/ConnectionCard";
import { databases } from "../utils/databaseList";



export default function HomePage() {


const getDbIcon = (driver) => {
  const db = databases.find((db) => db.driver.toLowerCase() === driver.toLowerCase());
  return db?.icon || null;
};



  const {
    connections, addConnection, removeConnection,
    credentials, updateCredentials, submitCredentials,
    schemas, selectedTables, toggleTableSelection, toggleColumnSelection,
    loadData, tableData, customQueryResults, setCustomQueryResults,
    selectedGraphs, setSelectedGraphs, loadingConnections,
  } = useConnections();

  const [showPopup, setShowPopup] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState("");
  const [expandedConnections, setExpandedConnections] = useState({});

  const toggleExpand = (key) => {
    setExpandedConnections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);
  const handleOperationChange = (e) => setSelectedOperation(e.target.value);

  const handlePopupLoadData = () => {
    console.log("Selected Operation:", selectedOperation);
    setShowPopup(false);
    loadData();
  };

  const operations = [
    {
      label: "INNER",
      value: "INNER",
      img: "https://www.ionos.de/digitalguide/fileadmin/DigitalGuide/Screenshots_2018/innerjoin.png",
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

      <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginTop: "20px",
  }}
 >
  {connections.map(({ driver, key }) => {
    const isExpanded = expandedConnections[key];

    return (
      <div
        key={key}
        style={{
          width: "22%",
          minWidth: "260px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: isExpanded
            ? "0 4px 12px rgba(0, 0, 0, 0.15)"
            : "0 1px 3px rgba(0, 0, 0, 0.08)",
          border: "1px solid #e5e5e5",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={() => toggleExpand(key)}
        >
    <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
  <img
    src={
      driver === "postgres"
        ? "/icons/postgresql.png"
        : driver === "mysql"
        ? "/icons/mysql.png"
        : driver === "mongodb"
        ?"/icons/mongodb.png"
        :driver === "sqlite"
        ?"icons/sqlite.png"
        :driver ==="oracle"
        ?"/icons/oracle.png"
        :driver ==="sqlserver"
        ?"/icons/sqlserver.png"
        :driver ===""
        // Fallback icon
    }
    alt={`${driver} logo`}
    width="32"
    height="32"
    style={{ marginRight: "10px" }}
  />
  <div>
    <div style={{ fontWeight: "600", fontSize: "16px" }}>
      {key.toUpperCase()}
    </div>
    <div style={{ fontSize: "13px", color: "#666" }}>{driver}</div>
  </div>
</div>

          <span style={{ fontSize: "20px" }}>
            {isExpanded ? "▲" : "▼"}
          </span>
        </div>

        {isExpanded && (
          <div style={{ padding: "16px", paddingTop: "0px" }}>
            <ConnectionBlock
              driver={driver}
              dbKey={key}
              schema={schemas[key]}
              credentials={credentials[key] || {}}
              loading={loadingConnections[key]}
              selectedTables={selectedTables[key] || {}}
              onRemove={() => removeConnection(key)}
              onUpdateCreds={(creds) => updateCredentials(key, creds)}
              onSubmitCreds={() => submitCredentials(key, driver)}
              onCustomQuery={(result) =>
                setCustomQueryResults((prev) => ({ ...prev, [key]: result }))
              }
              onToggleColumn={(table, column, isChecked) =>
                toggleColumnSelection(key, table, column, isChecked)
              }
              onToggleTable={(table, isChecked) =>
                toggleTableSelection(key, table, isChecked)
              }
              onSelectChart={(chart) =>
                setSelectedGraphs((prev) => ({ ...prev, [key]: chart }))
              }
            />
          </div>
        )}
      </div>
    );
  })}
</div>


    {connections.length > 0 && (
  <>
    <button
      onClick={handleOpenPopup}
      style={{
        marginTop: "20px",
        padding: "10px 20px",
        backgroundColor: "#007BFF",
        color: "white",
        fontSize: "16px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = "#0056b3";
        e.target.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = "#007BFF";
        e.target.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
      }}
    >
      Load Selected Table Data
    </button>

    <div style={{ marginTop: "20px" }}>
      {connections.map(({ key }) => (
        <div
          key={key}
          style={{
            background: getColorForKey(key),
            borderRadius: "10px",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            width: "800px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}>
            <h3>Select Set Operation</h3>
            <div style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              marginTop: "10px",
              flexWrap: "wrap",
            }}>
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
                    width: "22%",
                    minWidth: "100px",
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
            <div style={{
              marginTop: "20px",
              display: "flex",
              justifyContent: "space-between",
            }}>
              <button onClick={handlePopupLoadData}>Load Data</button>
              <button onClick={handleClosePopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}