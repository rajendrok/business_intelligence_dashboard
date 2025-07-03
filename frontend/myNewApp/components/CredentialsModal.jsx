import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function CredentialsModal({ credentials, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...credentials,
      driver: credentials?.driver, // ✅ Preserve the driver
      [field]: value,
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#888"
        value={credentials?.username || ''}
        onChangeText={(value) => handleChange('username', value)}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        value={credentials?.password || ''}
        secureTextEntry
        onChangeText={(value) => handleChange('password', value)}
        style={styles.input}
      />
      <TextInput
        placeholder="Host"
        placeholderTextColor="#888"
        value={credentials?.host || ''}
        onChangeText={(value) => handleChange('host', value)}
        style={styles.input}
      />
      <TextInput
        placeholder="Port"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={credentials?.port?.toString() || ''}
        onChangeText={(value) => handleChange('port', value)}
        style={styles.input}
      />
      <TextInput
        placeholder="Database Name"
        placeholderTextColor="#888"
        value={credentials?.database || ''}
        onChangeText={(value) => handleChange('database', value)}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 10, // RN >= 0.71, otherwise use marginBottom
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
});
