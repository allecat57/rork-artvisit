import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Filter, Search } from 'lucide-react-native';
import colors from '../../../constants/colors';
import { GalleryAnalytics } from '../../../utils/artvisit-integration';
import * as Analytics from '../../../utils/analytics';
import { useGalleryStore } from '../../../store/useGalleryStore';

export default function GalleryArtworksScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? colors.light : colors.dark;
  const bgColor = isDark ? colors.dark : colors.light;
  
  const {
    selectedGallery,
    artworks,
    isLoading,
    error,
    fetchGalleryById,
    fetchArtworksByGallery,
    clearError
  } = useGalleryStore();
  
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    if (id && typeof id === 'string') {
      // Clear any previous errors
      clearError();
      
      // Fetch gallery and its artworks
      fetchGalleryById(id);
      fetchArtworksByGallery(id);
    }
  }, [id]);
  
  useEffect(() => {
    if (selectedGallery) {
      // Initialize analytics
      const galleryAnalytics = new GalleryAnalytics({
        id: selectedGallery.id,
        name: selectedGallery.name,
        location: selectedGallery.location
      });
      
      setAnalytics(galleryAnalytics);
      
      // Track interaction
      galleryAnalytics.trackInteraction('view_all_artworks');
      
      // Log screen view to TimeFrame Analytics
      Analytics.sendToTimeFrameAnalytics('screen_view', {
        screen_name: 'Gallery Artworks',
        screen_class: 'GalleryArtworksScreen',
        gallery_id: selectedGallery.id,
        gallery_name: selectedGallery.name,
        artwork_count: artworks.length
      });
    }
    
    return () => {
      // Track time spent when leaving
      if (analytics) {
        analytics.trackTimeSpent();
      }
    };
  }, [selectedGallery, artworks]);
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Loading artworks...</Text>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.errorText, { color: colors.primary }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            clearError();
            if (id && typeof id === 'string') {
              fetchGalleryById(id);
              fetchArtworksByGallery(id);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  if (!selectedGallery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Gallery not found</Text>
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
    router.push(`/gallery/${selectedGallery.id}/artwork/${artwork.id}`);
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
        <Text style={[styles.galleryName, { color: textColor }]}>{selectedGallery.name}</Text>
        <Text style={[styles.artworkCount, { color: textColor }]}>
          {artworks.length} {artworks.length === 1 ? 'artwork' : 'artworks'}
        </Text>
      </View>
      
      {artworks.length > 0 ? (
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
              <Image 
                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }} 
                style={styles.artworkImage} 
              />
              <View style={[styles.artworkInfo, { backgroundColor: isDark ? '#1e1e1e' : '#f5f5f5' }]}>
                <Text style={[styles.artworkTitle, { color: textColor }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.artworkArtist, { color: textColor }]} numberOfLines={1}>
                  {item.artist}{item.year ? `, ${item.year}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textColor }]}>
            No artworks available in this gallery.
          </Text>
        </View>
      )}
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
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});