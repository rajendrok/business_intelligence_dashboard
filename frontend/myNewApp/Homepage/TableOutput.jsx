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
          <View style={{ minWidth: 1000 }}>
            {/* Header */}
            <View style={styles.headerRow}>
              {headers.map((col, i) => (
                <View key={i} style={styles.headerCell}>
                  <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">
                    {col}
                  </Text>
                </View>
              ))}
            </View>

            {/* Rows */}
            <ScrollView style={{ maxHeight: 300 }}>
              {rows.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={[
                    styles.dataRow,
                    { backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f9f9f9' },
                  ]}
                >
                  {headers.map((col, j) => (
                    <View key={j} style={styles.dataCell}>
                      <Text numberOfLines={1} ellipsizeMode="tail">
                        {row[col] != null ? String(row[col]) : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
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
    marginBottom: 6,
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
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 6,
  },
  headerCell: {
    width: 160,
    paddingHorizontal: 8,
    marginRight: 4,
  },
  headerText: {
    fontWeight: 'bold',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  dataCell: {
    width: 160,
    paddingHorizontal: 8,
    marginRight: 4,
  },
});
