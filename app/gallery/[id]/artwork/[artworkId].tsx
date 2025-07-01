import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Share2, ArrowLeft, Info, DollarSign } from 'lucide-react-native';
import colors from '../../../../constants/colors';
import { GalleryAnalytics } from '../../../../utils/artvisit-integration';
import * as Analytics from '../../../../utils/analytics';
import { useGalleryStore } from '../../../../store/useGalleryStore';

export default function ArtworkDetailScreen() {
  const { id: galleryId, artworkId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? colors.light : colors.dark;
  const bgColor = isDark ? colors.dark : colors.light;
  
  const {
    selectedGallery,
    selectedArtwork,
    isLoading,
    error,
    fetchGalleryById,
    fetchArtworkById,
    clearError
  } = useGalleryStore();
  
  const [analytics, setAnalytics] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  useEffect(() => {
    if (galleryId && artworkId && typeof galleryId === 'string' && typeof artworkId === 'string') {
      // Clear any previous errors
      clearError();
      
      // Fetch gallery and artwork
      fetchGalleryById(galleryId);
      fetchArtworkById(artworkId);
    }
  }, [galleryId, artworkId]);
  
  useEffect(() => {
    if (selectedGallery && selectedArtwork) {
      // Initialize analytics
      const galleryAnalytics = new GalleryAnalytics({
        id: selectedGallery.id,
        name: selectedGallery.name,
        location: selectedGallery.location
      });
      
      setAnalytics(galleryAnalytics);
      
      // Track artwork view
      galleryAnalytics.trackArtworkView(selectedArtwork.id, selectedArtwork.title);
      
      // Log screen view to TimeFrame Analytics
      Analytics.sendToTimeFrameAnalytics('screen_view', {
        screen_name: 'Artwork Detail',
        screen_class: 'ArtworkDetailScreen',
        gallery_id: selectedGallery.id,
        gallery_name: selectedGallery.name,
        artwork_id: selectedArtwork.id,
        artwork_title: selectedArtwork.title,
        artist: selectedArtwork.artist
      });
    }
    
    return () => {
      // Track time spent when leaving
      if (analytics && selectedArtwork) {
        analytics.trackTimeSpent(selectedArtwork.id);
      }
    };
  }, [selectedGallery, selectedArtwork]);
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Loading artwork...</Text>
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
            if (galleryId && artworkId && typeof galleryId === 'string' && typeof artworkId === 'string') {
              fetchGalleryById(galleryId);
              fetchArtworkById(artworkId);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  if (!selectedArtwork || !selectedGallery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Artwork not found</Text>
      </SafeAreaView>
    );
  }
  
  const handleBack = () => {
    router.back();
  };
  
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    if (analytics) {
      analytics.trackInteraction('favorite_toggle', selectedArtwork.id, { 
        is_favorite: !isFavorite,
        artwork_title: selectedArtwork.title
      });
    }
  };
  
  const handleShare = () => {
    if (analytics) {
      analytics.trackInteraction('share', selectedArtwork.id, { 
        artwork_title: selectedArtwork.title,
        artist: selectedArtwork.artist
      });
    }
    // Implement share functionality
  };
  
  const handlePurchase = () => {
    if (analytics) {
      // Track purchase intent
      analytics.trackInteraction('purchase_intent', selectedArtwork.id, {
        artwork_title: selectedArtwork.title,
        price: selectedArtwork.price
      });
      
      // In a real app, this would navigate to a purchase flow
      // For demo purposes, we'll simulate a completed purchase
      const priceValue = selectedArtwork.price?.startsWith('$') 
        ? parseFloat(selectedArtwork.price.replace('$', '').replace(',', '')) 
        : 0;
        
      if (priceValue > 0) {
        analytics.trackPurchase(selectedArtwork.id, priceValue, 'USD');
      }
    }
    // Navigate to purchase flow or show purchase modal
  };
  
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
    if (analytics) {
      analytics.trackInteraction('toggle_description', selectedArtwork.id, {
        expanded: !showFullDescription
      });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
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
        
        <Image 
          source={{ uri: selectedArtwork.image_url || 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.image} 
        />
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: textColor }]}>{selectedArtwork.title}</Text>
          <Text style={[styles.artist, { color: textColor }]}>
            {selectedArtwork.artist}{selectedArtwork.year ? `, ${selectedArtwork.year}` : ''}
          </Text>
          
          <View style={styles.detailsContainer}>
            {selectedArtwork.medium && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: textColor }]}>Medium:</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{selectedArtwork.medium}</Text>
              </View>
            )}
            
            {selectedArtwork.dimensions && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: textColor }]}>Dimensions:</Text>
                <Text style={[styles.detailValue, { color: textColor }]}>{selectedArtwork.dimensions}</Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: textColor }]}>Gallery:</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>{selectedGallery.name}</Text>
            </View>
          </View>
          
          {selectedArtwork.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionTitle, { color: textColor }]}>Description</Text>
              <Text 
                style={[styles.description, { color: textColor }]}
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {selectedArtwork.description}
              </Text>
              
              {selectedArtwork.description.length > 120 && (
                <TouchableOpacity onPress={toggleDescription} style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>
                    {showFullDescription ? 'Read less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {selectedArtwork.price && (
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <DollarSign size={20} color={colors.primary} />
                <Text style={[styles.price, { color: textColor }]}>{selectedArtwork.price}</Text>
              </View>
              
              {selectedArtwork.price !== 'Not for sale' && (
                <TouchableOpacity 
                  style={[styles.purchaseButton, { backgroundColor: colors.primary }]}
                  onPress={handlePurchase}
                >
                  <Text style={styles.purchaseButtonText}>Purchase</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.infoButton, { borderColor: textColor }]}
            onPress={() => {
              if (analytics) {
                analytics.trackInteraction('view_artwork_details', selectedArtwork.id);
              }
              // Show more details or navigate to details screen
            }}
          >
            <Info size={18} color={textColor} />
            <Text style={[styles.infoButtonText, { color: textColor }]}>More Information</Text>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.8,
  },
  detailsContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 16,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    color: colors.primary,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  purchaseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  purchaseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
});