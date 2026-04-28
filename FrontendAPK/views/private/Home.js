import * as React from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator, Alert, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Configuración de OMDB (cambia TU_API_KEY por la que obtuviste)
const OMDB_API_KEY = 'ed07482e';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = React.useState('');
  const [movies, setMovies] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Buscar películas en OMDB usando .then
  const searchMovies = () => {
    if (!searchText.trim()) {
      Alert.alert('Aviso', 'Escribe el título de una película');
      return;
    }

    setLoading(true);
    setError('');
    const url = `${OMDB_BASE_URL}?s=${encodeURIComponent(searchText)}&apikey=${OMDB_API_KEY}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          setMovies(data.Search);
        } else {
          setMovies([]);
          setError(data.Error || 'No se encontraron resultados');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Error de conexión con la API');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Al presionar una película, navegar a detalle (IMDb ID)
  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const renderMovie = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleMoviePress(item)}
    >
      <Image
        source={{ uri: item.Poster !== 'N/A' ? item.Poster : 'https://via.placeholder.com/300x450?text=No+Poster' }}
        style={styles.poster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.resultText}>{item.Title} ({item.Year})</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5822cdbe" />

      {/* Header con logo y botón de perfil */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.clapperIcon}>🎬</Text>
          <Text style={styles.headerTitle}>UMBRACINEMA</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={44} color="#0d124cd5" />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="búsqueda de películas"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={searchMovies}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={searchMovies}>
            <Ionicons name="arrow-forward-circle" size={24} color="#0d124cd5" />
          </TouchableOpacity>
        )}
      </View>

      {/* Título de resultados */}
      <Text style={styles.sectionTitle}>RESULTADOS...</Text>

      {/* Estado de carga */}
      {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />}

      {/* Mensaje de error */}
      {error && !loading && <Text style={styles.errorText}>{error}</Text>}

      {/* Lista de resultados */}
      <FlatList
        data={movies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.imdbID}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && !error && (
            <Text style={styles.emptyText}>Busca una película para comenzar</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5822cdbe',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clapperIcon: {
    fontSize: 32,
    color: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 30,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    letterSpacing: 1,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  poster: {
    width: 50,
    height: 75,
    marginRight: 12,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  movieInfo: {
    flex: 1,
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ffaa66',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});