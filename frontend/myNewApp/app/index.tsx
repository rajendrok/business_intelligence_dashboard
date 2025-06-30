// app/index.tsx
import { View, Text } from 'react-native';
import HomePage from '../Homepage/HomePage'; // adjust path as needed

export default function Home() {
  return (
    <View style={{ flex: 1 , marginTop :40}}>
      <HomePage />
    </View>
  );
}
// import { View, Text } from 'react-native';
//
// export default function Home() {
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Hello Expo Web</Text>
//     </View>
//   );
// }
