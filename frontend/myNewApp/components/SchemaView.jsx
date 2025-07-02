import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';

export default function SchemaView({ schema, selectedTables, onToggleColumn, onToggleTable }) {
  if (!schema) return null;

  return (
    <ScrollView style={styles.wrapper}>
      {/* Tables Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Tables</Text>
        <ScrollView style={styles.scrollable}>
          {Object.entries(schema.tables || {}).map(([table, columns]) => (
            <TableAccordion
              key={table}
              table={table}
              columns={columns}
              selectedColumns={selectedTables[table]}
              onToggleColumn={onToggleColumn}
              onToggleTable={onToggleTable}
            />
          ))}
        </ScrollView>
      </View>

      {/* Views Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Views</Text>
        <ScrollView style={styles.scrollable}>
          {Object.entries(schema.views || {}).map(([view, columns]) => (
            <TableAccordion
              key={view}
              table={view}
              columns={columns}
              selectedColumns={selectedTables[view]}
              onToggleColumn={onToggleColumn}
              onToggleTable={onToggleTable}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function TableAccordion({ table, columns, selectedColumns, onToggleColumn, onToggleTable }) {
  const [open, setOpen] = useState(false);
  const tableChecked = selectedColumns !== undefined;

  return (
    <View style={styles.accordion}>
      <View style={styles.row}>
        <Switch
          value={tableChecked}
          onValueChange={(val) => onToggleTable(table, val)}
        />
        <TouchableOpacity onPress={() => setOpen((prev) => !prev)}>
          <Text style={styles.tableLabel}>
            {open ? '[-]' : '[+]'} {table}
          </Text>
        </TouchableOpacity>
      </View>

      {open && tableChecked && (
        <View style={styles.columnList}>
          {columns.map((col) => (
            <View key={col} style={styles.columnItem}>
              <Switch
                value={(selectedColumns || []).includes(col)}
                onValueChange={(val) => onToggleColumn(table, col, val)}
              />
              <Text style={styles.columnText}>{col}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  sectionHeader: {
    backgroundColor: '#eee',
    padding: 8,
    fontSize: 16,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  scrollable: {
    maxHeight: 200,
    marginTop: 5,
  },
  accordion: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 5,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tableLabel: {
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 15,
  },
  columnList: {
    paddingLeft: 20,
    marginTop: 8,
  },
  columnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  columnText: {
    marginLeft: 8,
  },
});
