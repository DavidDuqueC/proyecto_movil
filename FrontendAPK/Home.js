import * as React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


export default function HomeScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = React.useState('');

  const searchResults = [
    { id: '1', title: 'Blue Velvet' },
    { id: '2', title: 'Chinatown' },
    { id: '3', title: 'ZODIAC' },
    { id: '4', title: 'THE LAST MOVIE' },
    { id: '5', title: 'FAMILY KIDNICK AND EYES WIDE SHUT' },
  ];

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <Text style={styles.resultText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5822cdbe" />
      
      {/* Header con logo y botón de perfil */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.clapperIcon}>🎬</Text>
          <View>
            <Text style={styles.headerTitle}>UMBRACINEMA</Text>
          </View>
        </View>
        
        {/* Botón de perfil como ícono de persona */}
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
        />
      </View>

      {/* Título de resultados */}
      <Text style={styles.sectionTitle}>RESULTADOS...</Text>

      {/* Lista de resultados */}
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => item.id}
        style={styles.resultsList}
        showsVerticalScrollIndicator={false}
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
  headerSubtitle: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 2,
  },
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 24,
    color: '#fff',
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
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#999',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
  },
});