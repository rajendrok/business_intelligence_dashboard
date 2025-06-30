import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

const databases = [
  { name: 'MySQL', driver: 'mysql', icon: require('../assets/Mysql.png') },
  { name: 'PostgreSQL', driver: 'postgres', icon: require('../assets/Postgresql.png') },
  { name: 'MongoDB', driver: 'mongodb', icon: require('../assets/mongodb.png') },
  { name: 'SQLite', driver: 'sqlite', icon: require('../assets/Sqlite.png') },
  { name: 'Oracle', driver: 'oracle', icon: require('../assets/Oracle.png') },
  { name: 'SQL Server', driver: 'sqlserver', icon: require('../assets/Sqlserver.png') },
];

export default function DatabaseOptions({ onAddDatabase }) {
  return (
    <FlatList
      data={databases}
      keyExtractor={(item) => item.name}
      numColumns={3}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => onAddDatabase(item.driver)}
        >
          <Image source={item.icon} style={styles.icon} resizeMode="contain" />
          <Text style={styles.text}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    padding: 16,
    elevation: 4, // for Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
});
