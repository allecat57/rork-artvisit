import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Share2, MapPin, Clock, ArrowRight } from 'lucide-react-native';
import colors from '../../constants/colors';
import { GalleryAnalytics } from '../../utils/artvisit-integration';
import * as Analytics from '../../utils/analytics';
import { useGalleryStore } from '../../store/useGalleryStore';

export default function GalleryScreen() {
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
  const [isFavorite, setIsFavorite] = useState(false);
  
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
      
      // Track gallery view
      galleryAnalytics.trackGalleryView();
      
      // Log screen view to TimeFrame Analytics
      Analytics.sendToTimeFrameAnalytics('screen_view', {
        screen_name: 'Gallery Detail',
        screen_class: 'GalleryScreen',
        gallery_id: selectedGallery.id,
        gallery_name: selectedGallery.name
      });
    }
    
    return () => {
      // Track time spent when leaving
      if (analytics) {
        analytics.trackTimeSpent();
      }
    };
  }, [selectedGallery]);
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Loading gallery...</Text>
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
  
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    if (analytics) {
      analytics.trackInteraction('favorite_toggle', null, { is_favorite: !isFavorite });
    }
  };
  
  const handleShare = () => {
    if (analytics) {
      analytics.trackInteraction('share', null, { gallery_name: selectedGallery.name });
    }
    // Implement share functionality
  };
  
  const handleArtworkPress = (artwork) => {
    if (analytics) {
      analytics.trackArtworkView(artwork.id, artwork.title);
    }
    router.push(`/gallery/${selectedGallery.id}/artwork/${artwork.id}`);
  };
  
  const handleViewAllArtworks = () => {
    if (analytics) {
      analytics.trackInteraction('view_all_artworks');
    }
    router.push(`/gallery/${selectedGallery.id}/artworks`);
  };

  // Get first few artworks for preview
  const previewArtworks = artworks.slice(0, 2);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView>
        <Image 
          source={{ uri: selectedGallery.image_url || 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80' }} 
          style={styles.image} 
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{selectedGallery.name}</Text>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleFavoriteToggle}
              >
                <Heart 
                  size={24} 
                  color={isFavorite ? colors.primary : textColor} 
                  fill={isFavorite ? colors.primary : 'transparent'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Share2 size={24} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: textColor }]}>{selectedGallery.location}</Text>
          </View>
          
          {selectedGallery.hours && (
            <View style={styles.infoRow}>
              <Clock size={18} color={colors.primary} />
              <Text style={[styles.infoText, { color: textColor }]}>{selectedGallery.hours}</Text>
            </View>
          )}
          
          {selectedGallery.description && (
            <Text style={[styles.description, { color: textColor }]}>
              {selectedGallery.description}
            </Text>
          )}
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Featured Artworks</Text>
              {artworks.length > 2 && (
                <TouchableOpacity onPress={handleViewAllArtworks}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {previewArtworks.length > 0 ? (
              <>
                <View style={styles.artworksGrid}>
                  {previewArtworks.map(artwork => (
                    <TouchableOpacity 
                      key={artwork.id} 
                      style={styles.artworkCard}
                      onPress={() => handleArtworkPress(artwork)}
                    >
                      <Image 
                        source={{ uri: artwork.image_url || 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }} 
                        style={styles.artworkImage} 
                      />
                      <View style={styles.artworkInfo}>
                        <Text style={[styles.artworkTitle, { color: textColor }]} numberOfLines={1}>
                          {artwork.title}
                        </Text>
                        <Text style={[styles.artworkArtist, { color: textColor }]} numberOfLines={1}>
                          {artwork.artist}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {artworks.length > 2 && (
                  <TouchableOpacity 
                    style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
                    onPress={handleViewAllArtworks}
                  >
                    <Text style={styles.viewAllButtonText}>View All Artworks</Text>
                    <ArrowRight size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={[styles.noArtworksText, { color: textColor }]}>
                No artworks available in this gallery.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
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
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    color: colors.primary,
    fontSize: 14,
  },
  artworksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  artworkCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  artworkImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  artworkInfo: {
    padding: 8,
  },
  artworkTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  artworkArtist: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  viewAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  noArtworksText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 20,
  },
});