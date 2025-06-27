import React from "react";

function CredentialsModal({ credentials, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...credentials,
      [field]: value,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <input
        placeholder="Username"
        value={credentials?.username || ""}
        onChange={(e) => handleChange("username", e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={credentials?.password || ""}
        onChange={(e) => handleChange("password", e.target.value)}
      />
      <input
        placeholder="Host"
        value={credentials?.host || ""}
        onChange={(e) => handleChange("host", e.target.value)}
      />
      <input
        placeholder="Port"
        type="number"
        value={credentials?.port || ""}
        onChange={(e) => handleChange("port", e.target.value)}
      />
      <input
        placeholder="Database Name"
        value={credentials?.database || ""}
        onChange={(e) => handleChange("database", e.target.value)}
      />
    </div>
  );
}

export default CredentialsModal;
