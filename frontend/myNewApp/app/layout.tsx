// app/_layout.tsx
import { Slot } from 'expo-router';
import { ConnectionProvider } from '../Homepage/ConnectionContext';

export default function Layout() {
  return (
    <ConnectionProvider>
      <Slot /> {/* This renders index.tsx, join.tsx, etc. */}
    </ConnectionProvider>
  );
}
