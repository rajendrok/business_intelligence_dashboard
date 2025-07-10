import { Feather as Icon } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
  Button,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DatabaseSelector from "../components/DataBaseSelector.jsx";
import FileUploader from "../components/FileUploader.jsx";
import { getColorForKey } from "./ColorUtils.jsx";
import ConnectionBlock from "./ConnectionBlock.jsx";
import GraphOutput from "./GraphOutput.jsx";
import styles from "./HomePageStyles";
import Sidebar from "./Sidebar";
import TableOutput from "./TableOutput.jsx";
import { useConnectionContext } from "./ConnectionContext";

export default function HomePage() {
  const {
    connections,
    addConnection,
    removeConnection,
    credentials,
    updateCredentials,
    submitCredentials,
    schemas,
    selectedTables,
    toggleTableSelection,
    toggleColumnSelection,
    loadData,
    tableData,
    customQueryResults,
    setCustomQueryResults,
    selectedGraphs,
    setSelectedGraphs,
    loadingConnections,
  } = useConnectionContext();

  const [showPopup, setShowPopup] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState("");
  const [dropdownStates, setDropdownStates] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("DataSources");

  const [showDBList, setShowDBList] = useState(false);
  const [pendingDB, setPendingDB] = useState(null);

  const [selectedTablesList, setSelectedTablesList] = useState([]); // [{db, table}]
  const [selectedJoins, setSelectedJoins] = useState([]);

  const slideAnim = useRef(new Animated.Value(-220)).current;

  const toggleSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: isSidebarOpen ? -220 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePopupLoadData = () => {
    setShowPopup(false);
    loadData();
  };

  const operations = [
    { label: "INNER", value: "INNER" },
    { label: "FULL OUTER", value: "FULL OUTER" },
    { label: "LEFT OUTER", value: "LEFT OUTER" },
    { label: "RIGHT OUTER", value: "RIGHT OUTER" },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 5,
          }}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}

      {/* Sidebar Drawer */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 220,
          transform: [{ translateX: slideAnim }],
          backgroundColor: "#fff",
          zIndex: 10,
        }}
      >
        <Sidebar
          onSelectPage={(page) => {
            setActivePage(page);
            toggleSidebar();
          }}
          activePage={activePage}
        />
      </Animated.View>

      {/* Hamburger */}
      {!isSidebarOpen && (
        <TouchableOpacity
          onPress={toggleSidebar}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 20,
            backgroundColor: "#fff",
            padding: 6,
            borderRadius: 20,
            elevation: 4,
          }}
        >
          <Icon name={"menu"} size={24} color="#333" />
        </TouchableOpacity>
      )}

      <ScrollView style={styles.page}>
        <Text style={styles.title}>Multi-DB Schema Viewer</Text>

        {activePage === "DataSources" && (
          <>
            <DatabaseSelector onAddDatabase={addConnection} />

            <View style={styles.gridContainer}>
              {connections.map((conn) => (
                <View key={conn.key} style={styles.connectionCard}>
                  <ConnectionBlock
                    driver={conn.driver}
                    dbKey={conn.key}
                    schema={schemas[conn.key]}
                    credentials={credentials[conn.key] || {}}
                    loading={loadingConnections[conn.key]}
                    selectedTables={selectedTables[conn.key] || {}}
                    onRemove={() => removeConnection(conn.key)}
                    onUpdateCreds={(creds) => updateCredentials(conn.key, creds)}
                    onSubmitCreds={() => submitCredentials(conn.key, conn.driver)}
                    onCustomQuery={(result) =>
                      setCustomQueryResults((prev) => ({ ...prev, [conn.key]: result }))
                    }
                    onToggleColumn={(table, col, isChecked) =>
                      toggleColumnSelection(conn.key, table, col, isChecked)
                    }
                    onToggleTable={(table, isChecked) =>
                      toggleTableSelection(conn.key, table, isChecked)
                    }
                    onSelectChart={(chart) =>
                      setSelectedGraphs((prev) => ({ ...prev, [conn.key]: chart }))
                    }
                    showForm={dropdownStates[conn.key]}
                    onToggleForm={() =>
                      setDropdownStates((prev) => ({
                        ...prev,
                        [conn.key]: !prev[conn.key],
                      }))
                    }
                  />
                </View>
              ))}
            </View>

            {/* Join Chain Section */}
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

                {selectedTablesList.map((entry, idx) => (
                  <React.Fragment key={`${entry.db}_${entry.table}_${idx}`}>
                    <View style={styles.dbItem}>
                      <Text style={styles.dbText}>{entry.table}</Text>
                    </View>
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
                ))}
              </ScrollView>

              {/* Dropdown for DB List */}
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

              {/* Dropdown for Table List */}
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

            {/* Load Data */}
            {selectedTablesList.length < 2 && (
              <Text style={{ textAlign: "center", color: "red", marginTop: 10 }}>
                Please select at least 2 tables to join.
              </Text>
            )}
            <View style={styles.loadButton}>
              <Button
                title="Load Selected Table Data"
                onPress={() => setShowPopup(true)}
                disabled={selectedTablesList.length < 2}
              />
            </View>

            {/* Output */}
            {connections.map(({ key }) => (
              <View key={key} style={[styles.resultBox, { backgroundColor: getColorForKey(key) }]}>
                <TableOutput
                  dbKey={key}
                  tableData={tableData[key]}
                  customQueryResults={customQueryResults[key]}
                />
                <GraphOutput graph={selectedGraphs[key]} />
              </View>
            ))}
          </>
        )}

        {activePage === "FileUploads" && <FileUploader />}
      </ScrollView>

      {/* Join Modal */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Join Operation</Text>
            <View style={styles.operationGrid}>
              {operations.map((op) => (
                <TouchableOpacity
                  key={op.value}
                  onPress={() => setSelectedOperation(op.value)}
                  style={[
                    styles.opCard,
                    selectedOperation === op.value && styles.opCardSelected,
                  ]}
                >
                  <Image source={{ uri: op.img }} style={styles.opImage} />
                  <Text style={styles.opLabel}>{op.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <Button title="Load Data" onPress={handlePopupLoadData} />
              <Button title="Cancel" onPress={() => setShowPopup(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
