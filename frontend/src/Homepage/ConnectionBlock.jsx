import React from "react";
import CredentialsModal from "../components/CredentialsModal";
import CustomQueryBox from "../components/CustomQueryBox";
import SchemaView from "../components/SchemaView";
import Visualise from "../components/Visualise/visualise";

export default function ConnectionBlock({
  driver, dbKey, schema, credentials, loading, selectedTables,
  onRemove, onUpdateCreds, onSubmitCreds, onCustomQuery, onToggleColumn, onToggleTable, onSelectChart
}) {
  return (
    <div style={{ border: "1px solid black", padding: "10px", minWidth: "350px", position: "relative", borderRadius: "8px" }}>
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}>{dbKey.toUpperCase()}</div>
      <button onClick={onRemove} style={{ position: "absolute", top: "5px", right: "5px" }}>❌</button>

      <CredentialsModal driver={driver} credentials={credentials} onChange={onUpdateCreds} />
      <button onClick={onSubmitCreds} style={{ marginTop: "5px", marginBottom: "10px" }}>
        {loading ? "Connecting..." : "✔ Connect"}
      </button>

      {schema && (
        <>
          <CustomQueryBox creds={schema.creds} onResult={onCustomQuery} />
          <SchemaView
            schema={schema.schema}
            selectedTables={selectedTables}
            onToggleColumn={onToggleColumn}
            onToggleTable={onToggleTable}
          />
          <Visualise onSelectChart={onSelectChart} />
        </>
      )}
    </div>
  );
}
