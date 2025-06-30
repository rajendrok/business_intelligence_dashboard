import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function GraphOutput({ graph }) {
  if (!graph) return null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.graphBox}>
        {graph}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 15,
    alignItems: 'center',
  },
  graphBox: {
    padding: 10,
    backgroundColor: '#fafafa',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    width: '90%',
    height: 450,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3, // for Android shadow
  },
});
