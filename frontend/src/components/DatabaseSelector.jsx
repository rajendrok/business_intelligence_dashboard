// src/components/DatabaseSelector.js
import React from "react";

function DatabaseSelector({ onSelect }) {
    return (
        <div>
            <label>Choose Database:</label>
            <select onChange={(e) => onSelect(e.target.value)}>
                <option value="">Select</option>
                <option value="mysql">MySQL</option>
                <option value="postgres">Postgres</option>
                <option value="oracle">Oracle</option>
            </select>
        </div>
    )
}

export default DatabaseSelector;
