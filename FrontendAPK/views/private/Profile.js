import * as React from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity,
  FlatList, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.1.188:8001/api';

export default function ProfileScreen({ onLogout }) {
  const navigation = useNavigation();
  const [favorites, setFavorites] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [userEmail, setUserEmail] = React.useState('');
  const [userName, setUserName] = React.useState('Cinéfilo');

  React.useEffect(() => {
    loadUserData();
    loadFavorites();
  }, []);

  const loadUserData = () => {
    SecureStore.getItemAsync('userEmail')
      .then(email => {
        if (email) setUserEmail(email);
      })
      .catch(error => console.error('Error loading user data:', error));
  };

  const loadFavorites = () => {
    SecureStore.getItemAsync('userToken')
      .then(token => {
        if (!token) {
          Alert.alert('Sesión expirada', 'Por favor inicia sesión nuevamente');
          onLogout();
          return Promise.reject('No token');
        }
        return fetch(`${API_BASE_URL}/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      })
      .then(response => {
        if (response.status === 401) {
          SecureStore.deleteItemAsync('userToken');
          SecureStore.deleteItemAsync('userEmail');
          onLogout();
          return Promise.reject('Unauthorized');
        }
        return response.json();
      })
      .then(data => {
        setFavorites(data);
      })
      .catch(error => {
        if (error !== 'No token' && error !== 'Unauthorized') {
          console.error('Error loading favorites:', error);
          Alert.alert('Error', 'No se pudieron cargar tus películas favoritas');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const removeFavorite = (movieId, movieTitle) => {
    Alert.alert(
      'Eliminar favorito',
      `¿Quieres eliminar "${movieTitle}" de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            SecureStore.getItemAsync('userToken')
              .then(token => {
                if (!token) return Promise.reject('No token');
                return fetch(`${API_BASE_URL}/favorites/${movieId}`, {
                  method: 'DELETE',
                  headers: { 'Authorization': `Bearer ${token}` }
                });
              })
              .then(response => {
                if (response.ok) {
                  setFavorites(prev => prev.filter(movie => movie.id !== movieId));
                  Alert.alert('Éxito', 'Película eliminada de favoritos');
                } else {
                  Alert.alert('Error', 'No se pudo eliminar el favorito');
                }
              })
              .catch(error => {
                console.error(error);
                Alert.alert('Error', 'Ocurrió un error al eliminar');
              });
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            SecureStore.getItemAsync('userToken')
              .then(token => {
                if (token) {
                  return fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  }).catch(() => {});
                }
              })
              .finally(() => {
                SecureStore.deleteItemAsync('userToken');
                SecureStore.deleteItemAsync('userEmail');
                onLogout();
              });
          }
        }
      ]
    );
  };

  const renderFavorite = ({ item }) => (
    <TouchableOpacity style={styles.movieItem}>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.titulo}</Text>
        <Text style={styles.movieDetails}>{item.anio} • {item.director}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFavorite(item.id, item.titulo)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5822cdbe" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.clapperIcon}>🎬</Text>
          <Text style={styles.headerTitle}>UMBRACINEMA</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#0d124cd5" />
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>

      <View style={styles.savedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MIS PELÍCULAS FAVORITAS</Text>
          <Text style={styles.countText}>{favorites.length} películas</Text>
        </View>
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id.toString()}
          style={styles.moviesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={50} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No hay películas favoritas</Text>
              <Text style={styles.emptySubtext}>Busca películas y agrégalas a favoritos</Text>
            </View>
          }
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
        <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
      </TouchableOpacity>
    </View>
  );
}

// Los estilos permanecen igual que en tu código original...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5822cdbe', paddingHorizontal: 20, paddingTop: 60 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clapperIcon: { fontSize: 24, color: '#fff' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  placeholder: { width: 44 },
  profileInfo: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { marginBottom: 15 },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  userEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 20 },
  savedSection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', letterSpacing: 1 },
  countText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  moviesList: { flex: 1 },
  movieItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  movieInfo: { flex: 1 },
  movieTitle: { color: '#fff', fontSize: 16, marginBottom: 4 },
  movieDetails: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  deleteButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
  emptyText: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 15 },
  emptySubtext: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 5 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,107,107,0.1)', paddingVertical: 12, borderRadius: 8, marginTop: 20, marginBottom: 35, gap: 10 },
  logoutText: { color: '#ff6b6b', fontSize: 14, fontWeight: '600', letterSpacing: 1 },
});