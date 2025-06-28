import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import DatabaseSelector from '../components/DataBaseSelector';
import useConnections from './UseConnection';
import { getColorForKey } from './ColorUtils';
import ConnectionBlock from './ConnectionBlock';
import TableOutput from './TableOutput';
import GraphOutput from './GraphOutput';

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

  const toggleDropdown = (key) => {
    setDropdownStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePopupLoadData = () => {
    console.log('Selected Operation:', selectedOperation);
    setShowPopup(false);
    loadData();
  };

  const operations = [
    {
      label: 'INNER',
      value: 'INNER',
      img: 'https://www.ionos.de/digitalguide/fileadmin/DigitalGuide/Screenshots_2018/innerjoin.png',
    },
    {
      label: 'FULL OUTER',
      value: 'FULL OUTER',
      img: 'https://images.ctfassets.net/xwxknivhjv1b/7hIqCjp2AlwIrXQLYvU1aa/a1911afdf05351ea02e9b943897522b7/image5__3_.png',
    },
    {
      label: 'LEFT OUTER',
      value: 'LEFT OUTER',
      img: 'https://dailyblog908.weebly.com/uploads/1/3/7/7/137764733/198687306.jpg',
    },
    {
      label: 'RIGHT OUTER',
      value: 'RIGHT OUTER',
      img: 'https://dotnettutorials.net/wp-content/uploads/2021/11/word-image-419.png',
    },
  ];

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Multi-DB Schema Viewer</Text>
      <DatabaseSelector onAddDatabase={addConnection} />

      <View style={styles.gridContainer}>
        {connections.map((conn) => (
          <ConnectionBlock
            key={conn.key}
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
        ))}
      </View>

      {connections.length > 0 && (
        <>
          <View style={styles.loadButton}>
            <Button title="Load Selected Table Data" onPress={() => setShowPopup(true)} />
          </View>

          {connections.map(({ key }) => (
            <View
              key={key}
              style={[styles.resultBox, { backgroundColor: getColorForKey(key) }]}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  loadButton: {
    marginVertical: 20,
  },
  resultBox: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
    maxWidth: 800,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  operationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  opCard: {
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 10,
    marginBottom: 10,
  },
  opCardSelected: {
    borderColor: '#007BFF',
  },
  opImage: {
    width: 80,
    height: 80,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  opLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
