import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useConnectionContext } from "./ConnectionContext";

export default function JoinPage() {
  const { selectedTables, credentials } = useConnectionContext();
  const [joinResult, setJoinResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const buildPayload = () => {
    const sources = [];
    const joins = [];
    const selected = [];

    Object.entries(selectedTables).forEach(([dbKey, tables]) => {
      Object.entries(tables).forEach(([tableName, isSelected]) => {
        if (isSelected) {
          selected.push({ dbKey, tableName });
        }
      });
    });

    selected.forEach(({ dbKey, tableName }) => {
      const creds = credentials[dbKey];
      if (!creds || !creds.driver) return; // Only handle DB sources

      const sourceId = `${dbKey}_${tableName}`;

      sources.push({
        source_id: sourceId,
        type: "database",
        table: tableName,
        credentials: {
          username: creds.username,
          password: creds.password,
          host: creds.host,
          port: Number(creds.port),
          database: creds.database,
          driver: creds.driver,
          limit: 0,
          offset: 0,
          query: "",
          tables: {},
        },
      });
    });

    for (let i = 0; i < sources.length - 1; i++) {
      joins.push({
        left: sources[i].source_id,
        right: sources[i + 1].source_id,
        left_column: "id",
        right_column: "id",
        type: "INNER",
      });
    }

    return { sources, joins };
  };

  const callJoinAPI = async () => {
    const payload = buildPayload();

    if (payload.sources.length < 2) {
      alert("Select at least two *database* tables to join.");
      return;
    }

    setLoading(true);
    setJoinResult(null);

    const localIP = "192.168.0.100"; // your machine IP
    const host = Platform.OS === "android" ? "http://10.0.2.2" : `http://${localIP}`;

    try {
      const response = await fetch(`${host}:8080/multi-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      setJoinResult(data);
    } catch (err) {
      alert("Failed to fetch join data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Selected Tables</Text>

      {Object.entries(selectedTables).length === 0 ? (
        <Text style={styles.noSelection}>No tables selected.</Text>
      ) : (
        Object.entries(selectedTables).map(([dbKey, tables]) =>
          Object.entries(tables).map(
            ([tableName, isSelected]) =>
              isSelected && (
                <View key={`${dbKey}-${tableName}`} style={styles.tableBlock}>
                  <Text style={styles.tableTitle}>{`${dbKey} - ${tableName}`}</Text>
                </View>
              )
          )
        )
      )}

      <Button
        title="Run Join on Selected Tables"
        onPress={callJoinAPI}
        disabled={loading}
      />

      {loading && (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      )}

      {joinResult && Array.isArray(joinResult) && joinResult.length > 0 && (
        <ScrollView horizontal style={styles.resultBox}>
          <View>
            <View style={styles.tableRowHeader}>
              {Object.keys(joinResult[0]).map((key) => (
                <Text key={key} style={styles.tableCellHeader}>
                  {key}
                </Text>
              ))}
            </View>
            {joinResult.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.tableRow}>
                {Object.values(row).map((value, colIndex) => (
                  <Text key={colIndex} style={styles.tableCell}>
                    {String(value)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  noSelection: {
    fontStyle: "italic",
    color: "#888",
    marginBottom: 16,
  },
  tableBlock: {
    backgroundColor: "#eee",
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultBox: {
    marginTop: 24,
    backgroundColor: "#f9f9f9",
    padding: 8,
    borderRadius: 6,
    maxHeight: 400,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#ddd",
    paddingVertical: 8,
  },
  tableCell: {
    minWidth: 100,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  tableCellHeader: {
    minWidth: 100,
    paddingHorizontal: 8,
    fontWeight: "bold",
    fontSize: 12,
  },
});
