// MovieDetailScreen.js
import * as React from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.1.188:8001/api';

export default function MovieDetailScreen({ route, navigation }) {
  const { movie } = route.params; // movie puede venir de OMDB (Home) o del backend (Profile)
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Normalizar datos (OMDB vs backend)
  const title = movie.Title || movie.titulo;
  const year = movie.Year || movie.anio;
  const director = movie.Director || movie.director;
  const poster = movie.Poster || movie.poster_url;
  const synopsis = movie.Plot || movie.sinopsis || 'Sinopsis no disponible';
  const genre = movie.Genre || (movie.generos ? movie.generos.join(', ') : 'No especificado');

  React.useEffect(() => {
    checkIfFavorite();
  }, []);

  const checkIfFavorite = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const favorites = await response.json();
      // Buscar por ID (OMDB usa imdbID, backend usa id)
      const movieId = movie.imdbID || movie.id;
      const fav = favorites.some(fav => (fav.id === movieId || fav.imdbID === movieId));
      setIsFavorite(fav);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para guardar favoritos');
      return;
    }
    const movieId = movie.imdbID || movie.id;
    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const response = await fetch(`${API_BASE_URL}/favorites/${movieId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setIsFavorite(false);
          Alert.alert('Eliminado', 'Película eliminada de favoritos');
        }
      } else {
        // Agregar a favoritos - primero necesitamos el ID numérico (backend)
        // Si viene de OMDB, no tenemos un id numérico en nuestro catálogo.
        // Aquí asumimos que la película ya existe en el backend.
        // Para simplificar, enviaremos un título y si no existe, fallará.
        // Mejor: consultar si existe en backend, si no, crearla (opcional).
        // Por ahora solo funciona si la película ya está en tu catálogo.
        const response = await fetch(`${API_BASE_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ movie_id: movieId })
        });
        if (response.ok) {
          setIsFavorite(true);
          Alert.alert('Agregado', 'Película agregada a favoritos');
        } else {
          const data = await response.json();
          Alert.alert('Error', data.error || 'No se pudo agregar a favoritos');
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Ocurrió un error');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5822cdbe" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header con botón atrás y favorito */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DETALLES</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorite ? '#ff6b6b' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Póster */}
      <Image
        source={{ uri: poster !== 'N/A' ? poster : 'https://via.placeholder.com/300x450?text=No+Poster' }}
        style={styles.poster}
      />

      {/* Información */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.detail}><Text style={styles.bold}>Director:</Text> {director}</Text>
        <Text style={styles.detail}><Text style={styles.bold}>Año:</Text> {year}</Text>
        <Text style={styles.detail}><Text style={styles.bold}>Géneros:</Text> {genre}</Text>
        <Text style={styles.synopsisTitle}>Sinopsis</Text>
        <Text style={styles.synopsis}>{synopsis}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>CALIFICACIÓN:</Text>
          <Text style={styles.ratingValue}>4.5</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5822cdbe',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5822cdbe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  favButton: {
    padding: 8,
  },
  poster: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  detail: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  synopsisTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  synopsis: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  ratingLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingValue: {
    color: '#ffcc00',
    fontSize: 18,
    fontWeight: 'bold',
  },
});