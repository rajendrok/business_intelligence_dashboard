import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  Image,

  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DatabaseSelector from '../components/DataBaseSelector.jsx';
import useConnections from './UseConnection.jsx';
import { getColorForKey } from './ColorUtils.jsx';
import ConnectionBlock from './ConnectionBlock.jsx';
import TableOutput from './TableOutput.jsx';
import GraphOutput from './GraphOutput.jsx';
import Sidebar from './Sidebar';
import styles from './HomePageStyles';

export default function HomePage() {
  const {
    connections, addConnection, removeConnection,
    credentials, updateCredentials, submitCredentials,
    schemas, selectedTables, toggleTableSelection, toggleColumnSelection,
    loadData, tableData, customQueryResults, setCustomQueryResults,
    selectedGraphs, setSelectedGraphs, loadingConnections,
  } = useConnections();

  const [showPopup, setShowPopup] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState('');
  const [dropdownStates, setDropdownStates] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('DataSources'); // new state for active page

  const slideAnim = useRef(new Animated.Value(-220)).current;

  const toggleSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: isSidebarOpen ? -220 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSelectPage = (page) => {
    setActivePage(page);
    toggleSidebar();
  };

  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 500;

  const toggleDropdown = (key) => {
    setDropdownStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePopupLoadData = () => {
    console.log('Selected Operation:', selectedOperation);
    setShowPopup(false);
    loadData();
  };

  const operations = [
    { label: 'INNER', value: 'INNER', img: 'https://www.ionos.de/digitalguide/fileadmin/DigitalGuide/Screenshots_2018/innerjoin.png' },
    { label: 'FULL OUTER', value: 'FULL OUTER', img: 'https://images.ctfassets.net/xwxknivhjv1b/7hIqCjp2AlwIrXQLYvU1aa/a1911afdf05351ea02e9b943897522b7/image5__3_.png' },
    { label: 'LEFT OUTER', value: 'LEFT OUTER', img: 'https://dailyblog908.weebly.com/uploads/1/3/7/7/137764733/198687306.jpg' },
    { label: 'RIGHT OUTER', value: 'RIGHT OUTER', img: 'https://dotnettutorials.net/wp-content/uploads/2021/11/word-image-419.png' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Overlay when sidebar is open */}
      {isSidebarOpen && (
        <TouchableOpacity
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex: 5,
          }}
          activeOpacity={1}
          onPress={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: 220,
        transform: [{ translateX: slideAnim }],
        backgroundColor: '#fff',
        zIndex: 10,
      }}>
    <Sidebar onSelectPage={setActivePage} activePage={activePage} />

      </Animated.View>

      {/* Toggle button (hide when sidebar is open) */}
      {!isSidebarOpen && (
        <TouchableOpacity
          onPress={toggleSidebar}
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 20,
            backgroundColor: '#fff',
            padding: 6,
            borderRadius: 20,
            elevation: 4,
          }}
        >
          <Icon name={'menu'} size={24} color="#333" />
        </TouchableOpacity>
      )}

      {/* Main content */}
      <ScrollView style={styles.page}>
        <Text style={styles.title}>Multi-DB Schema Viewer</Text>

        {/* Show only if activePage === 'DataSources' */}
        {activePage === 'DataSources' && (
          <>
            <DatabaseSelector onAddDatabase={addConnection} />
            <View style={[styles.gridContainer, { flexDirection: isSmallScreen ? 'column' : 'row' }]}>
              {connections.map((conn) => (
                <View
                  key={conn.key}
                  style={[
                    styles.connectionCard,
                    { flexBasis: isSmallScreen ? '100%' : '48%', minWidth: isSmallScreen ? '100%' : 160 },
                  ]}
                >
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
                    onToggleForm={() => toggleDropdown(conn.key)}
                  />
                </View>
              ))}
            </View>

            {connections.length > 0 && (
              <>
                <View style={styles.loadButton}>
                  <Button title="Load Selected Table Data" onPress={() => setShowPopup(true)} />
                </View>
                {connections.map(({ key }) => (
                  <View key={key} style={[styles.resultBox, { backgroundColor: getColorForKey(key) }]}>
                    <TableOutput dbKey={key} tableData={tableData[key]} customQueryResults={customQueryResults[key]} />
                    <GraphOutput graph={selectedGraphs[key]} />
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* Add other pages here like: activePage === 'Dashboard' && <Dashboard /> etc. */}
      </ScrollView>

      {/* Modal */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Set Operation</Text>
            <View style={styles.operationGrid}>
              {operations.map((op) => (
                <TouchableOpacity
                  key={op.value}
                  onPress={() => setSelectedOperation(op.value)}
                  style={[styles.opCard, selectedOperation === op.value && styles.opCardSelected]}
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
