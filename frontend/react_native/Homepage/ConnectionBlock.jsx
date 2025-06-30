import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import CredentialsModal from '../components/CredentialsModal';
import CustomQueryBox from '../components/CustomQueryBox';
import SchemaView from '../components/SchemaView';
import Visualise from '../components/Visualise/visualise';

export default function ConnectionBlock({
  driver,
  dbKey,
  schema,
  credentials,
  loading,
  selectedTables,
  onRemove,
  onUpdateCreds,
  onSubmitCreds,
  onCustomQuery,
  onToggleColumn,
  onToggleTable,
  onSelectChart,
}) {
  const [showBlock, setShowBlock] = useState(false);

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.container}>
        {/* Header row */}
        <View style={styles.header}>
          <Text style={styles.heading}>{dbKey?.toUpperCase?.() || 'DB'}</Text>

          {/* Toggle and Remove */}
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setShowBlock(!showBlock)} style={styles.iconButton}>
              <Text style={styles.toggleIcon}>{showBlock ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRemove} style={styles.iconButton}>
              <Text style={styles.removeText}>❌</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown Block */}
        {showBlock && (
          <View style={styles.innerBlock}>
            <CredentialsModal credentials={credentials} onChange={onUpdateCreds} />

            <View style={styles.connectBtn}>
              {loading ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <Button title="✔ Connect" onPress={onSubmitCreds} color="#007AFF" />
              )}
            </View>

            {schema && (
              <ScrollView style={styles.scrollSection}>
                <CustomQueryBox creds={schema.creds} onResult={onCustomQuery} />
                <SchemaView
                  schema={schema.schema}
                  selectedTables={selectedTables}
                  onToggleColumn={onToggleColumn}
                  onToggleTable={onToggleTable}
                />
                <Text style={styles.chartHeader}>📊 Select a Chart to Visualize</Text>
                <Visualise onSelectChart={onSelectChart} />
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    width: '48%',
    marginBottom: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef6ff',
    padding: 10,
    borderRadius: 8,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#007AFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#d9eaff',
  },
  toggleIcon: {
    fontSize: 18,
    color: '#007AFF',
  },
  removeText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  innerBlock: {
    marginTop: 12,
    backgroundColor: '#f9fafe',
    borderRadius: 10,
    padding: 10,
  },
  connectBtn: {
    marginVertical: 10,
    alignItems: 'center',
  },
  scrollSection: {
    marginTop: 10,
    maxHeight: 400,
  },
  chartHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
});
