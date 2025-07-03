import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
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
  } = useConnectionContext();

  const [joins, setJoins] = useState([]);
  const [joinedData, setJoinedData] = useState([]);
  const [error, setError] = useState(null);

  // Dynamically build sources
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
          driver: cred.driver || "mysql", // Default to mysql if undefined
        },
      }));
  });

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
  }, [JSON.stringify(sources)]); // prevent infinite loop

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
          <TextInput
            style={styles.input}
            placeholder="Left Join Column"
            value={join.left_source_column}
            onChangeText={(text) =>
              handleJoinChange(idx, "left_source_column", text)
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Right Join Column"
            value={join.right_source_column}
            onChangeText={(text) =>
              handleJoinChange(idx, "right_source_column", text)
            }
          />
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
        <Text style={{ color: "red", marginVertical: 10 }}>{error}</Text>
      )}

      {Array.isArray(joinedData) && joinedData.length > 0 && (
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
                    <Text key={j} style={styles.tableCell}>
                      {String(val)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 6,
    marginBottom: 6,
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
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
