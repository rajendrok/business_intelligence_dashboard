
import React from "react";
import "./DatabaseSelector.css"; // CSS file for styling


const databases = [
  { name: "MySQL", driver: "mysql", icon: "/icons/Mysql.png" },
  { name: "PostgreSQL", driver: "postgres", icon: "icons/postgresql.png" },
  { name: "MongoDB", driver: "mongodb", icon: "/icons/mongodb.png" },
  { name: "SQLite", driver: "sqlite", icon: "/icons/sqlite.png" },
  { name: "Oracle", driver: "oracle", icon: "/icons/oracle.png" },
  { name: "SQL Server", driver: "sqlserver", icon: "/icons/sqlserver.png" },
];





function DatabaseSelector({ onAddDatabase }) {
  return (
    <div className="grid-container">
      {databases.map((db) => (
        <div
          className="card"
          key={db.driver}
          onClick={() => onAddDatabase(db.driver)}
        >
          <img src={db.icon} alt={db.name} className="icon" />
          
        </div>
      ))}
    </div>
  );
}

export default DatabaseSelector;
