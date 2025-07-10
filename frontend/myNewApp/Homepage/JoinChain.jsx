import React, { useState } from "react";
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

export default function JoinChain() {
  const { connections, schemas } = useConnectionContext();
  const [showDBList, setShowDBList] = useState(false);
  const [pendingDB, setPendingDB] = useState(null);
  const [selectedTablesList, setSelectedTablesList] = useState([]);
  const [selectedJoins, setSelectedJoins] = useState([]);
  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  const [selectedColumns, setSelectedColumns] = useState({});
  const [tableRawData, setTableRawData] = useState({});
  const [joinedData, setJoinedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 300;

  const toggleDropdown = (index) => {
    setExpandedDropdowns((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleJoinAndLoad = async () => {
    if (selectedTablesList.length < 2) {
      alert("Please select at least 2 tables");
      return;
    }

    const sources = selectedTablesList.map((entry, index) => ({
      source_id: `src${index + 1}`,
      type: "database",
      table: entry.table,
      credentials: {
        ...schemas[entry.db].creds,
        limit: 100,
        offset: 0,
      },
    }));

    const joins = selectedTablesList.slice(1).map((_, index) => ({
      left_source: `src${index + 1}`,
      right_source: `src${index + 2}`,
      left_column: selectedColumns[index] || "id",
      right_column: selectedColumns[index + 1] || "id",
      type: selectedJoins[index] || "INNER",
    }));

    const payload = { sources, joins };
    console.log("Sending payload:", JSON.stringify(payload, null, 2));

    try {
      setLoading(true);
      const response = await fetch("http://192.168.0.100:8080/multi-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Join result:", result);

      if (Array.isArray(result.data) && result.data.length > 0) {
        setJoinedData(result.data);
        setCurrentPage(1);
      } else {
        alert("No data received or empty result.");
        setJoinedData([]);
      }
    } catch (err) {
      console.error("Join failed:", err);
      alert("Failed to load joined data.");
    } finally {
      setLoading(false);
    }
  };

  const paginatedData = joinedData
    ? joinedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  const totalPages = joinedData ? Math.ceil(joinedData.length / pageSize) : 0;

return (
  <View>
    {/* SECTION 1: Top row with + icon and selected tables */}
    <ScrollView
      horizontal
      contentContainerStyle={styles.dbSelectorScroll}
      style={styles.dbSelectorRow}
    >
      {/* + Icon */}
      <TouchableOpacity
        onPress={() => {
          setShowDBList(!showDBList);
          setPendingDB(null);
        }}
        style={styles.plusButton}
      >
        <Icon name="plus" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Selected Tables with Column + Join Option */}
      {selectedTablesList.map((entry, idx) => {
        const columns = schemas[entry.db]?.schema?.tables?.[entry.table] ?? [];
        const selectedCol = selectedColumns[idx];

        return (
          <React.Fragment key={`${entry.db}_${entry.table}_${idx}`}>
            <View style={[styles.dbItem, { marginRight: 6 }]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.dbText}>
                  {entry.table}
                  {selectedCol ? ` (${selectedCol})` : ""}
                </Text>
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
                  <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Select a column:
                  </Text>
                  <ScrollView>
                    {columns.map((col, i) => (
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          setSelectedColumns((prev) => ({
                            ...prev,
                            [idx]: col,
                          }));
                          toggleDropdown(idx);
                        }}
                      >
                        <Text
                          style={{
                            paddingVertical: 4,
                            paddingLeft: 8,
                            color: selectedCol === col ? "#007bff" : "#000",
                            fontWeight: selectedCol === col ? "bold" : "normal",
                          }}
                        >
                          • {col}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Join Type Selector */}
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

      {/* Load Data Button */}
      {selectedTablesList.length >= 2 && (
        <TouchableOpacity
          onPress={handleJoinAndLoad}
          style={[
            styles.joinButton,
            { backgroundColor: "#2196F3", marginLeft: 10 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Load Data
            </Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>

    {/* SECTION 2: DB List Dropdown */}
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

    {/* SECTION 3: Table Dropdown from selected DB */}
    {pendingDB && schemas[pendingDB] && (
      <View style={styles.dropdownContainer}>
        <ScrollView>
          {Object.keys(schemas[pendingDB]?.schema?.tables || {}).map(
            (table, index) => {
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
                    setSelectedTablesList((prev) => [
                      ...prev,
                      { db: pendingDB, table },
                    ]);
                    if (selectedTablesList.length > 0) {
                      setSelectedJoins((prev) => [...prev, "INNER"]);
                    }
                    setPendingDB(null);

                    fetch("http://192.168.0.100:8080/table-data", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        driver: schemas[pendingDB].creds.driver,
                        ...schemas[pendingDB].creds,
                        tables: {
                          [table]: schemas[pendingDB].schema.tables[table],
                        },
                        limit: 100,
                        offset: 0,
                      }),
                    })
                      .then((res) => res.json())
                      .then((res) => {
                        if (!res || !res.data) return;
                        const dataKeys = Object.keys(res.data);
                        const matchedKey = dataKeys.find(
                          (key) => key.toLowerCase() === table.toLowerCase()
                        );
                        setTableRawData((prev) => ({
                          ...prev,
                          [table]: matchedKey ? res.data[matchedKey] : [],
                        }));
                      });
                  }}
                  style={styles.dropdownItem}
                >
                  <Text style={styles.dropdownText}>
                    {table} {alreadyExists ? "(already selected)" : ""}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </ScrollView>
      </View>
    )}

    {/* SECTION 4: Joined Table Result Display */}
    {joinedData && Array.isArray(joinedData) && joinedData.length > 0 && (
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 4 }}>
          Joined Table Result:
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: "#1976D2",
            marginBottom: 8,
          }}
        >
          Total Rows: {joinedData.length}
        </Text>

        {/* Table Scrollable Display */}
        <ScrollView horizontal>
          <ScrollView style={{ maxHeight: 300 }}>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "#eee",
                borderBottomWidth: 1,
              }}
            >
              {Object.keys(paginatedData[0]).map((col, index) => (
                <Text
                  key={index}
                  style={{
                    padding: 8,
                    minWidth: 120,
                    fontWeight: "bold",
                    borderRightWidth: 1,
                    borderColor: "#ccc",
                  }}
                >
                  {col}
                </Text>
              ))}
            </View>

            {paginatedData.map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                  backgroundColor: rowIndex % 2 === 0 ? "#fafafa" : "#fff",
                }}
              >
                {Object.values(row).map((value, colIndex) => (
                  <Text
                    key={colIndex}
                    style={{
                      padding: 8,
                      minWidth: 120,
                      borderRightWidth: 1,
                      borderColor: "#f0f0f0",
                    }}
                  >
                    {String(value)}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>
        </ScrollView>

        {/* Pagination Controls */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <TouchableOpacity
            disabled={currentPage === 1}
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            style={{ marginHorizontal: 10 }}
          >
            <Text style={{ color: currentPage === 1 ? "#ccc" : "#007bff" }}>
              Previous
            </Text>
          </TouchableOpacity>

          <Text style={{ fontWeight: "bold" }}>
            Page {currentPage} of {totalPages}
          </Text>

          <TouchableOpacity
            disabled={currentPage === totalPages}
            onPress={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            style={{ marginHorizontal: 10 }}
          >
            <Text style={{ color: currentPage === totalPages ? "#ccc" : "#007bff" }}>
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  </View>
);


}
