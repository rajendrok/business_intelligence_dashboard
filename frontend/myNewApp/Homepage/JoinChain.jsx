import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import styles from "./HomePageStyles";
import { useConnectionContext } from "./ConnectionContext";

export default function JoinChain() {
  const { connections, schemas } = useConnectionContext();
  const [showDBList, setShowDBList] = useState(false);
  const [pendingDB, setPendingDB] = useState(null);
  const [selectedTablesList, setSelectedTablesList] = useState([]);
  const [selectedJoins, setSelectedJoins] = useState([]);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});

  const toggleDropdown = (index) => {
    setExpandedDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <View style={styles.dbSelectorRow}>
      <ScrollView horizontal contentContainerStyle={styles.dbSelectorScroll}>
        <TouchableOpacity
          onPress={() => {
            setShowDBList(!showDBList);
            setPendingDB(null);
          }}
          style={styles.plusButton}
        >
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>

        {selectedTablesList.map((entry, idx) => {
          const columns = schemas[entry.db]?.schema?.tables?.[entry.table] ?? [];

          return (
            <React.Fragment key={`${entry.db}_${entry.table}_${idx}`}>
              <View style={[styles.dbItem, { position: "relative", marginRight: 6 }]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.dbText}>{entry.table}</Text>

                  <TouchableOpacity
                    onPress={() => toggleDropdown(idx)}
                    style={{ marginLeft: 6 }}
                  >
                    <Icon
                      name={expandedDropdowns[idx] ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setSelectedTablesList((prev) => {
                      const updated = [...prev];
                      updated.splice(idx, 1);
                      return updated;
                    });
                    setSelectedJoins((prev) => {
                      const updated = [...prev];
                      if (idx > 0) updated.splice(idx - 1, 1);
                      else updated.splice(0, 1);
                      return updated;
                    });
                    setExpandedDropdowns((prev) => {
                      const updated = { ...prev };
                      delete updated[idx];
                      return updated;
                    });
                  }}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    backgroundColor: "#ccc",
                    borderRadius: 10,
                    padding: 2,
                    zIndex: 1,
                  }}
                >
                  <Icon name="x" size={12} color="black" />
                </TouchableOpacity>
              </View>

              {expandedDropdowns[idx] && (
                <View
                  style={{
                    backgroundColor: "#f0f0f0",
                    borderRadius: 6,
                    marginTop: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    maxHeight: 140,
                    width: 200,
                  }}
                >
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Columns:</Text>
                  <ScrollView>
                    {Array.isArray(columns) && columns.length > 0 ? (
                      columns.map((col, i) => (
                        <Text
                          key={i}
                          style={{
                            paddingVertical: 2,
                            paddingLeft: 8,
                            color: "#000",
                          }}
                        >
                          • {col}
                        </Text>
                      ))
                    ) : (
                      <Text style={{ padding: 4, fontStyle: "italic" }}>
                        No columns
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}

              {idx < selectedTablesList.length - 1 && (
                <TouchableOpacity
                  onPress={() => {
                    const joins = ["INNER", "LEFT", "RIGHT", "FULL OUTER"];
                    setSelectedJoins((prev) => {
                      const next = [...prev];
                      const currentIdx = joins.indexOf(prev[idx] || "INNER");
                      next[idx] = joins[(currentIdx + 1) % joins.length];
                      return next;
                    });
                  }}
                  style={styles.joinButton}
                >
                  <Text>{selectedJoins[idx]}</Text>
                </TouchableOpacity>
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>

      {showDBList && (
        <View style={styles.dropdownContainer}>
          <ScrollView>
            {connections
              .filter((conn) => schemas[conn.key])
              .map((conn, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setPendingDB(conn.key);
                    setShowDBList(false);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownText}>{conn.key}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}

      {pendingDB && schemas[pendingDB] && (
        <View style={styles.dropdownContainer}>
          <ScrollView>
            {Object.keys(schemas[pendingDB]?.schema?.tables || {}).map((table, index) => {
              const alreadyExists = selectedTablesList.some(
                (entry) => entry.db === pendingDB && entry.table === table
              );
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (alreadyExists) {
                      setPendingDB(null);
                      return;
                    }
                    setSelectedTablesList((prev) => [...prev, { db: pendingDB, table }]);
                    if (selectedTablesList.length > 0) {
                      setSelectedJoins((prev) => [...prev, "INNER"]);
                    }
                    setPendingDB(null);
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownText}>
                    {table} {alreadyExists ? "(already selected)" : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
