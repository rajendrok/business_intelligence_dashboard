import React, { useState } from "react";
import { Modal } from "react-native";

import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import styles from "./HomePageStyles";
import { useConnectionContext } from "./ConnectionContext";

const JoinBlock = ({ blockId, isActive, setActiveBlock }) => {
  const [tableModalVisible, setTableModalVisible] = useState(false);

  const [columnModalVisible, setColumnModalVisible] = useState(false);
  const [activeColumnIndex, setActiveColumnIndex] = useState(null);

  const { connections, schemas } = useConnectionContext();
  const [pendingDB, setPendingDB] = useState(null);
  const [selectedTablesList, setSelectedTablesList] = useState([]);
  const [selectedJoins, setSelectedJoins] = useState([]);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({});
  const [joinedData, setJoinedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 300;

  const toggleDropdown = (index) =>
    setExpandedDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

  const handleJoinAndLoad = async () => {
    if (selectedTablesList.length < 2) {
      alert("Select at least 2 tables");
      return;
    }

    const sources = selectedTablesList.map((e, i) => ({
      source_id: `src${i + 1}`,
      type: "database",
      table: e.table,
      credentials: {
        ...schemas[e.db].creds,
        limit: 100,
        offset: 0,
      },
    }));

    const joins = selectedTablesList.slice(1).map((_, i) => ({
      left_source: `src${i + 1}`,
      right_source: `src${i + 2}`,
      left_source_column: selectedColumns[i] || "id", // ✅ FIXED
      right_source_column: selectedColumns[i + 1] || "id", // ✅ FIXED
      type: selectedJoins[i] || "INNER",
    }));

    setLoading(true);
    try {
      console.log(
        "Sending payload:",
        JSON.stringify({ sources, joins }, null, 2)
      );

      const res = await fetch("http://192.168.0.100:8080/multi-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources, joins }),
      });

      const json = await res.json();
      console.log("Backend response:", JSON.stringify(json, null, 2)); // 👈 THIS IS MOST IMPORTANT

      if (json.data && Array.isArray(json.data)) {
        setJoinedData(json.data);
      } else {
        alert("No data found or wrong response format");
        setJoinedData([]);
      }
    } catch (e) {
      console.error("Join Error:", e);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = joinedData
    ? joinedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];
  const totalPages = joinedData ? Math.ceil(joinedData.length / pageSize) : 0;

  return (
    <View
      style={{
        marginVertical: 16,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
      }}
    >
      {/* HEADER ROW */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
      {/* Show preview row when collapsed but joined data is available */}
{!isActive && joinedData?.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={{ marginTop: 8 }}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {selectedTablesList.map((entry, idx) => {
        const col = selectedColumns[idx] || "id";
        return (
          <React.Fragment key={idx}>
            {/* Table + column */}
            <View
              style={{
                backgroundColor: "#e6f0ff",
                borderColor: "#007bff",
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
                marginRight: 6,
              }}
            >
              <Text
                style={{
                  color: "#007bff",
                  fontWeight: "bold",
                  fontSize: 13,
                }}
              >
                {entry.table} ({col})
              </Text>
            </View>

            {/* Join type */}
            {idx < selectedTablesList.length - 1 && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: "#eee",
                  borderRadius: 4,
                  marginRight: 6,
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 13 }}>
                  {selectedJoins[idx] || "INNER"}
                </Text>
              </View>
            )}
          </React.Fragment>
        );
      })}
      {/* Optional: show row count */}
      <View
        style={{
          marginLeft: 8,
          paddingHorizontal: 10,
          paddingVertical: 6,
          backgroundColor: "#2196F3",
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 13 }}>
          Rows: {joinedData.length}
        </Text>
      </View>
    </View>
  </ScrollView>
)}

        <TouchableOpacity
          onPress={() => setActiveBlock(isActive ? null : blockId)}
        >
          <Icon name="plus" size={20} color={isActive ? "red" : "#000"} />
        </TouchableOpacity>
      </View>

      {isActive && (
        <View style>
          {/* TABLE SELECTOR ROW */}
          <ScrollView horizontal style={{ marginVertical: 8 }}>
            {/* DB dropdown */}
            <TouchableOpacity
              onPress={() =>
                setPendingDB(pendingDB ? null : pendingDB || "open")
              }
              style={styles.plusButton}
            >
              <Icon name="plus" size={20} color="#fff" />
            </TouchableOpacity>

            {selectedTablesList.map((entry, idx) => {
              const cols =
                schemas[entry.db]?.schema?.tables?.[entry.table] || [];
              const selCol = selectedColumns[idx];

              return (
                <React.Fragment key={`${entry.db}-${idx}`}>
                  {/* Table Display */}
                  <View
                    style={[
                      styles.dbItem,
                      {
                        marginRight: 6,
                        flexDirection: "row",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={styles.dbText}>
                        {entry.table}
                        {selCol ? ` (${selCol})` : ""}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setActiveColumnIndex(idx);
                          setColumnModalVisible(true);
                        }}
                        style={{ marginLeft: 6 }}
                      >
                        <Icon name="edit-2" size={16} />
                      </TouchableOpacity>
                    </View>

                    {/* ❌ Cancel button */}
                    <TouchableOpacity
  onPress={() => {
    // Remove the table and associated join and column
    const newTables = selectedTablesList.filter((_, i) => i !== idx);

    // Rebuild joins to match new index positions
    const newJoins = {};
    Object.keys(selectedJoins).forEach((k) => {
      const key = parseInt(k);
      if (key < idx) newJoins[key] = selectedJoins[key];
      else if (key > idx) newJoins[key - 1] = selectedJoins[key];
    });

    const newColumns = {};
    Object.keys(selectedColumns).forEach((k) => {
      const key = parseInt(k);
      if (key < idx) newColumns[key] = selectedColumns[key];
      else if (key > idx) newColumns[key - 1] = selectedColumns[key];
    });

    setSelectedTablesList(newTables);
    setSelectedJoins(newJoins);
    setSelectedColumns(newColumns);
    setJoinedData(null); // Optionally clear result on change
  }}
  style={{ marginLeft: 8 }}
>
  <Icon name="x-circle" size={18} color="red" />
</TouchableOpacity>

                  </View>

                  {/* JOIN TYPE SELECTOR (only between tables) */}
                  {idx < selectedTablesList.length - 1 && (
                    <View
                      style={{
                        justifyContent: "center",
                        marginHorizontal: 4,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        backgroundColor: "#ddd",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          const next = {
                            INNER: "LEFT",
                            LEFT: "RIGHT",
                            RIGHT: "FULL",
                            FULL: "INNER",
                          };
                          setSelectedJoins((prev) => ({
                            ...prev,
                            [idx]: next[prev[idx] || "INNER"],
                          }));
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>
                          {selectedJoins[idx] || "INNER"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </React.Fragment>
              );
            })}

            {selectedTablesList.length >= 2 && (
              <TouchableOpacity
                onPress={handleJoinAndLoad}
                style={[styles.joinButton, { backgroundColor: "#2196F3" }]}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff" }}>Load</Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* DB LIST DROPDOWN */}
          {isActive && pendingDB === "open" && (
            <View style={styles.dropdownContainer}>
              <ScrollView>
                {connections
                  .filter((c) => schemas[c.key])
                  .map((c, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setPendingDB(c.key);
                        setTableModalVisible(true); // 👈 THIS IS THE KEY LINE
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownText}>{c.key}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* TABLE LIST */}
          {isActive &&
            pendingDB &&
            pendingDB !== "open" &&
            schemas[pendingDB] && (
              <Modal
                visible={tableModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setTableModalVisible(false)}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      padding: 20,
                      borderRadius: 10,
                      maxHeight: 300,
                      width: "40%",
                      maxHeight: "70%",
                    }}
                  >
                    <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                      Select a Table
                    </Text>
                    <ScrollView>
                      {pendingDB &&
                        Object.keys(
                          schemas[pendingDB]?.schema?.tables || {}
                        ).map((tbl, i) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              setSelectedTablesList((p) => [
                                ...p,
                                { db: pendingDB, table: tbl },
                              ]);
                              setSelectedJoins((p) =>
                                p.length > 0 ? [...p, "INNER"] : p
                              );
                              setTableModalVisible(false);
                              setPendingDB(null);
                            }}
                          >
                            <Text
                              style={{
                                paddingVertical: 8,
                                borderBottomWidth: 1,
                                borderBottomColor: "#ccc",
                              }}
                            >
                              • {tbl}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity
                      onPress={() => {
                        setTableModalVisible(false);
                        setPendingDB(null);
                      }}
                      style={{ marginTop: 10 }}
                    >
                      <Text style={{ color: "red", textAlign: "center" }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}

          {/* RESULT SET */}
          {joinedData && joinedData.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
                Total Rows: {joinedData.length}
              </Text>

              <ScrollView horizontal>
                <View style={{ minWidth: 1000 }}>
                  <ScrollView style={{ maxHeight: 300 }}>
                    {/* Header Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        backgroundColor: "#eee",
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderColor: "#ccc",
                      }}
                    >
                      {Object.keys(paginatedData[0]).map((col, i) => (
                        <View
                          key={i}
                          style={{
                            width: 160, // 👈 fixed width per column
                            paddingHorizontal: 8,
                            marginRight: 4,
                          }}
                        >
                          <Text
                            style={{ fontWeight: "bold" }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {col}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Data Rows */}
                    {paginatedData.map((row, idx) => (
                      <View
                        key={idx}
                        style={{
                          flexDirection: "row",
                          paddingVertical: 6,
                          borderBottomWidth: 1,
                          borderColor: "#eee",
                          backgroundColor: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                        }}
                      >
                        {Object.values(row).map((val, j) => (
                          <View
                            key={j}
                            style={{
                              width: 160, // 👈 same fixed width
                              paddingHorizontal: 8,
                              marginRight: 4,
                            }}
                          >
                            <Text numberOfLines={1} ellipsizeMode="tail">
                              {val != null ? String(val) : ""}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </ScrollView>

              {/* Pagination */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                <TouchableOpacity
                  disabled={currentPage === 1}
                  onPress={() => setCurrentPage((p) => p - 1)}
                >
                  <Text
                    style={{
                      margin: 8,
                      color: currentPage === 1 ? "#ccc" : "#007bff",
                    }}
                  >
                    Prev
                  </Text>
                </TouchableOpacity>
                <Text style={{ margin: 8 }}>
                  {currentPage}/{totalPages}
                </Text>
                <TouchableOpacity
                  disabled={currentPage === totalPages}
                  onPress={() => setCurrentPage((p) => p + 1)}
                >
                  <Text
                    style={{
                      margin: 8,
                      color: currentPage === totalPages ? "#ccc" : "#007bff",
                    }}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Column Selector Modal */}
          <Modal
            visible={columnModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setColumnModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderRadius: 10,
                  maxHeight: "80%",
                  width: "30%",
                }}
              >
                <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                  Select a column
                </Text>
                <ScrollView>
                  {(
                    (activeColumnIndex !== null &&
                      schemas[selectedTablesList[activeColumnIndex]?.db]?.schema
                        ?.tables?.[
                        selectedTablesList[activeColumnIndex]?.table
                      ]) ||
                    []
                  ).map((col, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setSelectedColumns((prev) => ({
                          ...prev,
                          [activeColumnIndex]: col,
                        }));
                        setColumnModalVisible(false);
                        setActiveColumnIndex(null);
                      }}
                    >
                      <Text
                        style={{
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: "#ccc",
                        }}
                      >
                        • {col}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setColumnModalVisible(false)}
                  style={{ marginTop: 10 }}
                >
                  <Text style={{ color: "red", textAlign: "center" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </View>
  );
};

export default function JoinChain() {
  const [blocks, setBlocks] = useState([{ id: 1 }]);
  const [activeId, setActiveId] = useState(null);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {blocks.map((b) => (
        <JoinBlock
          key={b.id}
          blockId={b.id}
          isActive={activeId === b.id}
          setActiveBlock={setActiveId}
        />
      ))}
      <TouchableOpacity
        style={[
          styles.joinButton,
          { backgroundColor: "#4CAF50", marginTop: 20 },
        ]}
        onPress={() => setBlocks((p) => [...p, { id: p.length + 1 }])}
      >
        <Text style={{ color: "#fff" }}>Make New Join</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
