import { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './src/screeens/LoginScreen';
import { HomeScreen } from './src/screeens/HomeScreen';

export default function App() {
  const [phone, setPhone] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const storedToken = await AsyncStorage.getItem('credsetu_token');
        const storedPhone = await AsyncStorage.getItem('credsetu_phone');
        if (storedToken && storedPhone) {
          setPhone(storedPhone);
        }
      } catch (e) {
        console.error('Error checking auth state', e);
      } finally {
        setInitializing(false);
      }
    }
    checkAuth();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0f172a" />
      </View>
    );
  }

  if (!phone) {
    return <LoginScreen onLogin={setPhone} />;
  }

  return <HomeScreen phone={phone} onLogout={() => setPhone(null)} />;
}
