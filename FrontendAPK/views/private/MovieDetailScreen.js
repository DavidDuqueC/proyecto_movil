import * as React from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.1.188:8001/api';
const OMDB_API_KEY = 'ed07482e';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

export default function MovieDetailScreen({ route, navigation }) {
  const { movie } = route.params;
  const [details, setDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isFavorite, setIsFavorite] = React.useState(false);

  const hasFullDetails = movie && (movie.Director || movie.director || movie.Plot);

  React.useEffect(() => {
    if (hasFullDetails) {
      setDetails(movie);
      setLoading(false);
    } else if (movie.imdbID) {
      fetchMovieDetails(movie.imdbID);
    } else {
      Alert.alert('Error', 'No se pudieron cargar los detalles');
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (details) {
      checkIfFavorite();
    }
  }, [details]);

  const fetchMovieDetails = (imdbID) => {
    const url = `${OMDB_BASE_URL}?i=${imdbID}&apikey=${OMDB_API_KEY}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          setDetails(data);
        } else {
          Alert.alert('Error', data.Error || 'No se encontraron detalles');
        }
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Error', 'No se pudo conectar con OMDB');
      })
      .finally(() => setLoading(false));
  };

  const checkIfFavorite = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const favorites = await response.json();
      const movieId = details.imdbID || details.id;
      const fav = favorites.some(fav => (fav.id === movieId || fav.imdbID === movieId));
      setIsFavorite(fav);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFavorite = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para guardar favoritos');
      return;
    }
    const movieId = details.imdbID || details.id;
    try {
      if (isFavorite) {
        await fetch(`${API_BASE_URL}/favorites/${movieId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setIsFavorite(false);
        Alert.alert('Eliminado', 'Película eliminada de favoritos');
      } else {
        await fetch(`${API_BASE_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ movie_id: movieId })
        });
        setIsFavorite(true);
        Alert.alert('Agregado', 'Película agregada a favoritos');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error');
    }
  };

  const getRating = () => {
    if (details && details.Ratings) {
      const rotten = details.Ratings.find(r => r.Source === 'Rotten Tomatoes');
      if (rotten) return rotten.Value;
      const imdb = details.Ratings.find(r => r.Source === 'Internet Movie Database');
      if (imdb) return imdb.Value;
    }
    return 'N/D';
  };

  if (loading || !details) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5822cdbe" />
      </View>
    );
  }

  const title = details.Title || details.titulo;
  const year = details.Year || details.anio;
  const director = details.Director || details.director || 'No disponible';
  const poster = details.Poster || details.poster_url;
  const synopsis = details.Plot || details.sinopsis || 'Sinopsis no disponible';
  const genre = details.Genre || (details.generos ? details.generos.join(', ') : 'No especificado');
  const rating = getRating();

  return (
    <ScrollView style={styles.container}>
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

      <Image
        source={{ uri: poster !== 'N/A' ? poster : 'https://via.placeholder.com/300x450?text=No+Poster' }}
        style={styles.poster}
      />

      <View style={styles.infoContainer}>
        {/* Rating ahora aparece de primero */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingValue}>{rating}</Text>
          <Text style={styles.ratingLabel}>RottenTomatoe SCORE</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        
        <Text style={styles.detail}><Text style={styles.bold}>Director:</Text> {director}</Text>
        <Text style={styles.detail}><Text style={styles.bold}>Año:</Text> {year}</Text>
        <Text style={styles.detail}><Text style={styles.bold}>Géneros:</Text> {genre}</Text>
        
        <Text style={styles.synopsisTitle}>Sinopsis</Text>
        <Text style={styles.synopsis}>{synopsis}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5822cdbe' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5822cdbe' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: { padding: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 3 },
  favButton: { padding: 8 },
  poster: { width: '76%', height: 400, resizeMode: 'cover', alignSelf: 'center', borderBottomLeftRadius: 5, borderBottomRightRadius: 5 },
  infoContainer: { padding: 25 },
  
  // Estilo del Rating al inicio
  ratingBadge: { alignSelf: 'center', alignItems: 'center', marginBottom: 10, backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
  ratingLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  ratingValue: { color: '#ffcc00', fontSize: 22, fontWeight: '900' },

  title: { color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 20, textAlign: 'center', letterSpacing: 0.5 },
  detail: { color: '#fff', fontSize: 16, marginBottom: 10, fontWeight: '300', letterSpacing: 0.3 },
  bold: { fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  synopsisTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 25, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  synopsis: { color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 26, marginBottom: 30, fontWeight: '400' },
});