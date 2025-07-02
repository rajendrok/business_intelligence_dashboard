import { View } from 'react-native';
import { ConnectionProvider } from '../Homepage/ConnectionContext';
import HomePage from '../Homepage/HomePage';

export default function App() {
  return (
    <ConnectionProvider>
      <View style={{ flex: 1, marginTop :60 }}>
        <HomePage />
      </View>
    </ConnectionProvider>
  );
}
