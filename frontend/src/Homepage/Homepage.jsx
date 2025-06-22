import React from "react";
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

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Multi-DB Schema Viewer</h1>
      <DatabaseSelector onAddDatabase={addConnection} />

      <div style={{ display: "flex", gap: "10px", marginTop: "20px", width: "46vw", paddingLeft: "10vw" }}>
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
          <button style={{ marginTop: "20px" }} onClick={loadData}>Load Selected Table Data</button>
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
    </div>
  );
}
