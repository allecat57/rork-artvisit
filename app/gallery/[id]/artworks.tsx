import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Filter, Search } from 'lucide-react-native';
import colors from '../../../constants/colors';
import { GalleryAnalytics } from '../../../utils/artvisit-integration';
import * as Analytics from '../../../utils/analytics';

// Mock data - in a real app, fetch this from your API
const galleries = [
  {
    id: '1',
    name: 'Modern Art Gallery',
    location: 'New York, NY',
    artworks: [
      { id: '101', title: 'Abstract Harmony', artist: 'Jane Smith', year: '2021', image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '102', title: 'Urban Landscape', artist: 'Michael Johnson', year: '2019', image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '103', title: 'Geometric Patterns', artist: 'Sarah Williams', year: '2020', image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '104', title: 'Digital Dreams', artist: 'Alex Chen', year: '2022', image: 'https://images.unsplash.com/photo-1573221566340-81bdde00e00b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '105', title: 'Neon City', artist: 'David Park', year: '2021', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '106', title: 'Minimalist Composition', artist: 'Emma White', year: '2019', image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    id: '2',
    name: 'Classical Art Museum',
    location: 'London, UK',
    artworks: [
      { id: '201', title: 'Portrait of a Lady', artist: 'Leonardo da Vinci', year: '1503', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '202', title: 'Sunset over the Sea', artist: 'Claude Monet', year: '1872', image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '203', title: 'The Starry Night', artist: 'Vincent van Gogh', year: '1889', image: 'https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '204', title: 'The Birth of Venus', artist: 'Sandro Botticelli', year: '1485', image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
    ]
  }
];

export default function GalleryArtworksScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? colors.light : colors.dark;
  const bgColor = isDark ? colors.dark : colors.light;
  
  const [gallery, setGallery] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    // Find gallery from mock data
    const foundGallery = galleries.find(g => g.id === id);
    
    if (foundGallery) {
      setGallery(foundGallery);
      setArtworks(foundGallery.artworks);
      
      // Initialize analytics
      const galleryAnalytics = new GalleryAnalytics({
        id: foundGallery.id,
        name: foundGallery.name,
        location: foundGallery.location
      });
      
      setAnalytics(galleryAnalytics);
      
      // Track interaction
      galleryAnalytics.trackInteraction('view_all_artworks');
      
      // Log screen view to TimeFrame Analytics
      Analytics.sendToTimeFrameAnalytics('screen_view', {
        screen_name: 'Gallery Artworks',
        screen_class: 'GalleryArtworksScreen',
        gallery_id: foundGallery.id,
        gallery_name: foundGallery.name,
        artwork_count: foundGallery.artworks.length
      });
    }
    
    return () => {
      // Track time spent when leaving
      if (analytics) {
        analytics.trackTimeSpent();
      }
    };
  }, [id]);
  
  if (!gallery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Loading artworks...</Text>
      </SafeAreaView>
    );
  }
  
  const handleBack = () => {
    router.back();
  };
  
  const handleArtworkPress = (artwork) => {
    if (analytics) {
      analytics.trackArtworkView(artwork.id, artwork.title);
    }
    router.push(`/gallery/${gallery.id}/artwork/${artwork.id}`);
  };
  
  const handleFilter = () => {
    if (analytics) {
      analytics.trackInteraction('filter_artworks');
    }
    // Implement filter functionality
  };
  
  const handleSearch = () => {
    if (analytics) {
      analytics.trackInteraction('search_artworks');
    }
    // Implement search functionality
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: textColor }]}>Artworks</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSearch}>
            <Search size={24} color={textColor} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleFilter}>
            <Filter size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.galleryInfo}>
        <Text style={[styles.galleryName, { color: textColor }]}>{gallery.name}</Text>
        <Text style={[styles.artworkCount, { color: textColor }]}>
          {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
        </Text>
      </View>
      
      <FlatList
        data={artworks}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.artworkCard}
            onPress={() => handleArtworkPress(item)}
          >
            <Image source={{ uri: item.image }} style={styles.artworkImage} />
            <View style={[styles.artworkInfo, { backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5' }]}>
              <Text style={[styles.artworkTitle, { color: textColor }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.artworkArtist, { color: textColor }]} numberOfLines={1}>
                {item.artist}, {item.year}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  galleryInfo: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  galleryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artworkCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContent: {
    padding: 8,
  },
  artworkCard: {
    flex: 1,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  artworkImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  artworkInfo: {
    padding: 12,
  },
  artworkTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artworkArtist: {
    fontSize: 12,
    opacity: 0.7,
  },
});