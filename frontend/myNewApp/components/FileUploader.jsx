import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
    ActivityIndicator, FlatList,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';

export default function FileUploader() {
  const [files, setFiles] = useState([]);
  const [isPicking, setIsPicking] = useState(false);

  const pickFiles = async () => {
    if (isPicking) return;

    try {
      setIsPicking(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result?.assets?.length > 0) {
        const newFiles = result.assets.slice(0, 3); // limit to 3 files max
        setFiles((prev) => [...prev, ...newFiles].slice(0, 3)); // max 3 files in total
      }
    } catch (err) {
      console.error('Error picking document: ', err);
    } finally {
      setIsPicking(false);
    }
  };

  const removeFile = (uri) => {
    setFiles((prev) => prev.filter((file) => file.uri !== uri));
  };

  const renderFileItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => removeFile(item.uri)} style={styles.closeButton}>
        <Feather name="x" size={20} color="#666" />
      </TouchableOpacity>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{item.name}</Text>
      <Text style={styles.label}>Size:</Text>
      <Text style={styles.value}>{(item.size / 1024).toFixed(2)} KB</Text>
      <Text style={styles.label}>Type:</Text>
      <Text style={styles.value}>{item.mimeType || 'Unknown'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📁 Upload Files (Max 3)</Text>

      <TouchableOpacity
        style={[styles.uploadButton, isPicking && { opacity: 0.6 }]}
        onPress={pickFiles}
        disabled={isPicking || files.length >= 3}
      >
        <MaterialIcons name="upload-file" size={24} color="#fff" />
        <Text style={styles.uploadText}>
          {isPicking ? 'Opening...' : 'Choose Files'}
        </Text>
        {isPicking && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
      </TouchableOpacity>

      <FlatList
        data={files}
        renderItem={renderFileItem}
        keyExtractor={(item) => item.uri}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    marginTop: 30,
    backgroundColor: '#f4f6fa',
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4c68d7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  card: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 1,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginTop: 10,
  },
  value: {
    color: '#222',
    fontSize: 16,
  },
});
