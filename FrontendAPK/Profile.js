import * as React from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const navigation = useNavigation();
  
  const [savedMovies, setSavedMovies] = React.useState([
    { id: '1', title: 'Blue Velvet', year: '1986', director: 'David Lynch' },
    { id: '2', title: 'Chinatown', year: '1974', director: 'Roman Polanski' },
    { id: '3', title: 'ZODIAC', year: '2007', director: 'David Fincher' },
  ]);

  const renderSavedMovie = ({ item }) => (
    <TouchableOpacity style={styles.movieItem}>
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieDetails}>{item.year} • {item.director}</Text>
      </View>
      <TouchableOpacity style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5822cdbe" />
      
      {/* Header con botón de regreso */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <Text style={styles.clapperIcon}>🎬</Text>
          <Text style={styles.headerTitle}>UMBRACINEMA</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Información del usuario */}
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={100} color="#0d124cd5" />
        </View>
        <Text style={styles.userName}>Usuario Cinéfilo</Text>
        <Text style={styles.userEmail}>usuario@umbracinema.com</Text>
      </View>

      {/* Sección de películas guardadas */}
      <View style={styles.savedSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MIS PELÍCULAS FAVORITAS</Text>
        </View>
        
        <FlatList
          data={savedMovies}
          renderItem={renderSavedMovie}
          keyExtractor={(item) => item.id}
          style={styles.moviesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={50} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No hay películas guardadas</Text>
              <Text style={styles.emptySubtext}>Busca películas y guárdalas aquí</Text>
            </View>
          }
        />
      </View>

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
        <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
      </TouchableOpacity>
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
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clapperIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  placeholder: {
    width: 44,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 5,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  savedSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  editButton: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 1,
  },
  moviesList: {
    flex: 1,
  },
  movieItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  movieDetails: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 15,
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginTop: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,107,107,0.1)',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 55,
    gap: 10,
  },
  logoutText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
});