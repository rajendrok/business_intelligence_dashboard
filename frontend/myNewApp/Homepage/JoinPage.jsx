import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Button,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useConnectionContext } from "./ConnectionContext";

export default function JoinPage() {
  const {
    selectedTables,
    credentials,
    tableData,
    columnsBySource, // ✅ Comes from HomePage
  } = useConnectionContext();

  const [joins, setJoins] = useState([]);
  const [joinedData, setJoinedData] = useState([]);
  const [error, setError] = useState(null);

  const sources = Object.entries(selectedTables).flatMap(([dbKey, tables]) => {
    const cred = credentials[dbKey];
    if (!cred) return [];
    return Object.keys(tables)
      .filter((tableName) => tables[tableName])
      .map((tableName) => ({
        source_id: `${dbKey}_${tableName}`,
        type: "database",
        table: tableName,
        credentials: {
          host: cred.host,
          port: parseInt(cred.port || "3306", 10),
          username: cred.username,
          password: cred.password,
          database: cred.database,
          driver: cred.driver || "mysql",
        },
      }));
  });

  // Build join structure automatically on source change
  useEffect(() => {
    if (sources.length >= 2) {
      const newJoins = [];
      for (let i = 0; i < sources.length - 1; i++) {
        newJoins.push({
          left_source: sources[i].source_id,
          right_source: sources[i + 1].source_id,
          left_source_column: "",
          right_source_column: "",
          type: "INNER",
        });
      }
      setJoins(newJoins);
    }
  }, [JSON.stringify(sources)]);

  const handleJoinChange = (index, key, value) => {
    const updated = [...joins];
    updated[index][key] = value;
    setJoins(updated);
  };

  const performJoin = async () => {
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/multi-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources, joins }),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Join failed.");
        return;
      }

      setJoinedData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(err.message || "Failed to fetch join data.");
    }
  };

  return (
    <ScrollView style={{ padding: 10 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Multi-Table Join</Text>

      {joins.map((join, idx) => (
        <View key={idx} style={styles.joinBlock}>
          <Text style={styles.label}>
            Join {join.left_source} ⨝ {join.right_source}
          </Text>

          <Picker
            selectedValue={join.left_source_column}
            onValueChange={(val) => handleJoinChange(idx, "left_source_column", val)}
            style={styles.picker}
          >
            <Picker.Item label="Select Left Column" value="" />
            {(columnsBySource[join.left_source] || []).map((col, i) => (
              <Picker.Item key={i} label={col} value={col} />
            ))}
          </Picker>

          <Picker
            selectedValue={join.right_source_column}
            onValueChange={(val) => handleJoinChange(idx, "right_source_column", val)}
            style={styles.picker}
          >
            <Picker.Item label="Select Right Column" value="" />
            {(columnsBySource[join.right_source] || []).map((col, i) => (
              <Picker.Item key={i} label={col} value={col} />
            ))}
          </Picker>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={join.type}
              onValueChange={(val) => handleJoinChange(idx, "type", val)}
              mode="dropdown"
              style={styles.picker}
            >
              <Picker.Item label="INNER" value="INNER" />
              <Picker.Item label="LEFT" value="LEFT" />
              <Picker.Item label="RIGHT" value="RIGHT" />
              <Picker.Item label="FULL" value="FULL" />
            </Picker>
          </View>
        </View>
      ))}

      <Button title="Perform Join" onPress={performJoin} />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}

      {Array.isArray(joinedData) && joinedData.length > 0 && (
        <>
          <Text style={{ marginTop: 10, fontWeight: "bold" }}>
            Total Rows: {joinedData.length}
          </Text>
          <ScrollView horizontal style={styles.tableScrollX}>
            <ScrollView style={styles.tableScrollY}>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  {Object.keys(joinedData[0]).map((col, idx) => (
                    <Text key={idx} style={styles.tableHeader}>
                      {col}
                    </Text>
                  ))}
                </View>
                {joinedData.map((row, i) => (
                  <View key={i} style={styles.tableRow}>
                    {Object.values(row).map((val, j) => (
                      <ScrollView key={j} horizontal style={styles.tableCell}>
                        <Text>{String(val)}</Text>
                      </ScrollView>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  joinBlock: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 6,
  },
  picker: {
    height: 40,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableScrollX: {
    marginTop: 15,
  },
  tableScrollY: {
    maxHeight: 400,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    padding: 6,
    minWidth: 100,
    fontWeight: "bold",
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableCell: {
    padding: 6,
    minWidth: 100,
    maxWidth: 100,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  errorBox: {
    backgroundColor: "#ffe5e5",
    borderLeftWidth: 4,
    borderLeftColor: "#ff4d4d",
    padding: 10,
    marginVertical: 10,
    borderRadius: 6,
  },
  errorTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#cc0000",
    marginBottom: 4,
  },
  errorMessage: {
    color: "#660000",
  },
});
