import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet } from 'react-native';

export default function CustomQueryBox({ creds, onResult }) {
  const [sqlQuery, setSqlQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!sqlQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...creds,
        query: sqlQuery,
      };

      const res = await fetch('http://localhost:8080/custom-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        onResult(data.data);
      } else {
        setError(data.error || 'Query failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Run Custom SQL Query</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={4}
        placeholder="Write your SELECT query here..."
        value={sqlQuery}
        onChangeText={setSqlQuery}
      />
      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <Button title="Submit Query" onPress={handleSubmit} />
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 15,
    textAlign: 'center',
  },
});
