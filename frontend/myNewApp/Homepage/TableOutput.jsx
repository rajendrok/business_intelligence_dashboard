import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function TableOutput({ dbKey, tableData, customQueryResults }) {
  const renderTable = (rows, title) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return (
        <Text style={styles.noDataText}>
          No data available for <Text style={{ fontWeight: 'bold' }}>{title}</Text>
        </Text>
      );
    }

    const headers = Object.keys(rows[0]);

    return (
      <View style={styles.tableContainer}>
        <ScrollView horizontal>
          <View>
            {/* Header */}
            <View style={styles.row}>
              {headers.map((col) => (
                <Text key={col} style={[styles.cell, styles.headerCell]}>
                  {col}
                </Text>
              ))}
            </View>

            {/* Rows */}
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {headers.map((col) => (
                  <Text key={col} style={styles.cell}>
                    {String(row[col])}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dbKey.toUpperCase()} Output</Text>

      {/* Table Data */}
      {tableData?.data &&
        Object.entries(tableData.data).map(([tableName, rows]) => (
          <View key={tableName} style={styles.tableSection}>
            <Text style={styles.subtitle}>{tableName}</Text>
            {renderTable(rows, tableName)}
          </View>
        ))}

      {/* Custom Query Result */}
      {Array.isArray(customQueryResults) && customQueryResults.length > 0 && (
        <View style={styles.tableSection}>
          <Text style={styles.subtitle}>Custom Query Result for {dbKey.toUpperCase()}</Text>
          {renderTable(customQueryResults, 'Custom Query')}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#888',
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  subtitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 16,
  },
  noDataText: {
    fontStyle: 'italic',
    color: 'gray',
    marginBottom: 10,
  },
  tableSection: {
    marginBottom: 15,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
    maxHeight: 300,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    padding: 6,
    minWidth: 100,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    textAlign: 'left',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#f2f2f2',
  },
});
