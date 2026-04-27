import * as React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

// Importa las pantallas (ajusta las rutas según tu estructura)
import LoginScreen from '../FrontendAPK/views/public/Login';
import HomeScreen from '../FrontendAPK/views/private/Home';
import ProfileScreen from '../FrontendAPK/views/private/Profile';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);

  // Verificar si existe un token guardado al iniciar la app
  React.useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        setUserToken(token);
      } catch (error) {
        console.log('Error al leer token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkToken();
  }, []);

  // Función para manejar el login exitoso
  const handleLogin = (token) => {
    setUserToken(token);
  };

  // Función para manejar el logout
  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userEmail');
    setUserToken(null);
  };

  if (isLoading) {
    // Puedes mostrar un splash screen o un indicador
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5822cdbe' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          // Usuario autenticado: muestra las pantallas privadas
          <>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} token={userToken} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} token={userToken} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        ) : (
          // Usuario no autenticado: muestra Login
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}