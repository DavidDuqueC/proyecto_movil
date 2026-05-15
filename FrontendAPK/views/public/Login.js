import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    const data = { email, password };

    fetch('http://192.168.0.112:8001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(result) {
        if (result.token) {
          // Guardar token y email
          SecureStore.setItemAsync('userToken', result.token);
          SecureStore.setItemAsync('userEmail', email);

          // Guardar user_id (si viene en la respuesta)
          if (result.user_id) {
            SecureStore.setItemAsync('userId', result.user_id.toString());
          } else {
            // Si no viene, extraer del token o consultar perfil
            console.warn('user_id no está en la respuesta del login');
          }

          onLogin(result.token);
        } else {
          Alert.alert('Error', result.message || 'Credenciales inválidas');
        }
      })
      .catch(function(error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      })
      .finally(function() {
        setLoading(false);
      });
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo y título */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🎬</Text>
          <Text style={styles.title}>UMBRACINEMA</Text>
        </View>
        <Text style={styles.subtitle}>búsqueda de películas</Text>

        {/* Formulario */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="rgba(255,255,255,0.6)"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />

        {/* Botón de login */}
        <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>INICIO DE SESIÓN</Text>
          )}
        </Pressable>

        {/* Línea divisoria */}
        <View style={styles.divider} />

        {/* Botón de registro */}
        <Pressable 
          style={styles.button} 
          onPress={() => Alert.alert('Registro', 'Pantalla en desarrollo')}
        >
          <Text style={styles.buttonText}>REGISTRARSE</Text>
        </Pressable>

        {/* Contacto / teléfono */}
        <View style={styles.contactRow}>
          <Ionicons name="call-outline" size={32} color="rgba(255,255,255,0.7)" />
          <Text style={styles.contactText}>3004866706</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#5822cdb0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(43, 89, 197, 0.24)',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    fontSize: 64,
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 18,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  button: {
    backgroundColor: '#0d124cd5',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    gap: 8,
  },
  contactText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
});