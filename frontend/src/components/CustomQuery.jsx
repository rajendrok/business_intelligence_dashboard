import React from "react";

function TableView({ tableData }) {
    if (!tableData) return null;

    // If it's custom query, it's likely a flat array of rows
    if (Array.isArray(tableData)) {
        if (tableData.length === 0) {
            return <p>No data available</p>;
        }
        return (
            <div>
                <h2>Query Result</h2>
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            {Object.keys(tableData[0] || {}).map((column) => (
                                <th key={column}>{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData?.map((row, i) => (
                            <tr key={i}>
                                {Object.keys(row).map((column) => (
                                    <td key={column}>
                                        {String(row[column])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    } else if (tableData?.data) {
        // If it's from your table API
        return (
            <div>
                <h2>Table Data</h2>
                {Object.entries(tableData.data).map(([tableName, rows]) => (
                    <div key={tableName}>
                        <h3>{tableName}</h3>
                        {Array.isArray(rows) && rows.length > 0 ? (
                            <table border="1" cellPadding="10">
                                <thead>
                                    <tr>
                                        {Object.keys(rows[0] || {}).map((column) => (
                                            <th key={column}>{column}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows?.map((row, i) => (
                                        <tr key={i}>
                                            {Object.keys(row).map((column) => (
                                                <td key={column}>
                                                    {String(row[column])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No data available</p>
                        )}

                    </div>
                ))}
            </div>
        )
    } else {
        return <p>No data to show</p>;
    }
}

export default TableView;
