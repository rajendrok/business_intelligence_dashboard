import React, { useRef, useState } from "react";
import {
  Animated,
  Button,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Feather as Icon } from "@expo/vector-icons";
import DatabaseSelector from "../components/DataBaseSelector.jsx";
import FileUploader from "../components/FileUploader.jsx";
import { getColorForKey } from "./ColorUtils.jsx";
import ConnectionBlock from "./ConnectionBlock.jsx";
import GraphOutput from "./GraphOutput.jsx";
import TableOutput from "./TableOutput.jsx";
import Sidebar from "./Sidebar";
import styles from "./HomePageStyles";
import { useConnectionContext } from "./ConnectionContext";
import JoinChain from "./JoinChain.jsx";

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
  const slideAnim = useRef(new Animated.Value(-220)).current;
  const { width } = useWindowDimensions();

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

  const isMobile = width < 600;
  const cardWidth = isMobile ? "100%" : "33.33%";

  return (
    <View style={{ flex: 1 }}>
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

            {/* ✅ Responsive Credential Grid */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {connections.map((conn) => (
                <View
                  key={conn.key}
                  style={{
                    width: cardWidth,
                    padding: 8,
                  }}
                >
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 8,
                      backgroundColor: "#fff",
                      padding: 8,
                      width: "95%", // 👈 make it wider inside
                      alignSelf: "center", // 👈 center it inside the outer block
                      backgroundColor: "lightblue",
                    }}
                  >
                    <ConnectionBlock
                      driver={conn.driver}
                      dbKey={conn.key}
                      schema={schemas[conn.key]}
                      credentials={credentials[conn.key] || {}}
                      loading={loadingConnections[conn.key]}
                      selectedTables={selectedTables[conn.key] || {}}
                      onRemove={() => removeConnection(conn.key)}
                      onUpdateCreds={(creds) =>
                        updateCredentials(conn.key, creds)
                      }
                      onSubmitCreds={() =>
                        submitCredentials(conn.key, conn.driver)
                      }
                      onCustomQuery={(result) =>
                        setCustomQueryResults((prev) => ({
                          ...prev,
                          [conn.key]: result,
                        }))
                      }
                      onToggleColumn={(table, col, isChecked) =>
                        toggleColumnSelection(conn.key, table, col, isChecked)
                      }
                      onToggleTable={(table, isChecked) =>
                        toggleTableSelection(conn.key, table, isChecked)
                      }
                      onSelectChart={(chart) =>
                        setSelectedGraphs((prev) => ({
                          ...prev,
                          [conn.key]: chart,
                        }))
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
                </View>
              ))}
            </View>

            {/* JoinChain handles + icon and joins */}
            <JoinChain />

            <View style={styles.loadButton}>
              <Button
                title="Load Selected Table Data"
                onPress={() => setShowPopup(true)}
              />
            </View>

            {connections.map(({ key }) => (
              <View
                key={key}
                style={[
                  styles.resultBox,
                  { backgroundColor: getColorForKey(key) },
                ]}
              >
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
