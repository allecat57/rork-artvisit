import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  useColorScheme, Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Share2, MapPin, Clock, ArrowRight } from 'lucide-react-native';
import colors from '../../constants/colors';
import { GalleryAnalytics } from '../../utils/artvisit-integration';
import * as Analytics from '../../utils/analytics';
import { fetchGalleryById } from '@/config/supabase';

// Mock artworks data - in a real app, this would come from a separate artworks table
const mockArtworks = [
  { 
    id: '101', 
    title: 'Abstract Harmony', 
    artist: 'Jane Smith', 
    image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '102', 
    title: 'Urban Landscape', 
    artist: 'Michael Johnson', 
    image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '103', 
    title: 'Portrait Study', 
    artist: 'Sarah Wilson', 
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' 
  },
  { 
    id: '104', 
    title: 'Sunset Dreams', 
    artist: 'David Chen', 
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' 
  }
];

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image: string;
}

interface Gallery {
  id: string;
  name: string;
  location: string;
  description?: string;
  image_url: string;
  hours: string;
  rating: number;
  artworks?: Artwork[];
}

export default function GalleryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Use consistent color scheme
  const backgroundColor = isDark ? colors.surface : colors.background;
  const textColor = colors.text;
  const secondaryTextColor = colors.textSecondary;

  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<GalleryAnalytics | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const fetchGallery = async () => {
    if (!id) {
      setError('No gallery ID provided');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching gallery with ID: ${id}`);
      const data = await fetchGalleryById(String(id));
      
      if (data) {
        // Add mock artworks to the gallery data
        const galleryWithArtworks: Gallery = {
          ...data,
          artworks: mockArtworks,
          image_url: data.image_url || 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80',
          hours: data.hours || 'Open today 10AM - 6PM',
          rating: data.rating || 4.8
        };
        
        setGallery(galleryWithArtworks);
        
        // Initialize analytics
        const galleryAnalytics = new GalleryAnalytics({
          id: data.id,
          name: data.name,
          location: data.location
        });
        
        setAnalytics(galleryAnalytics);
        
        // Track gallery view
        galleryAnalytics.trackGalleryView();
        
        // Log screen view to Analytics
        Analytics.logEvent('screen_view', {
          screen_name: 'Gallery Detail',
          screen_class: 'GalleryScreen',
          gallery_id: data.id,
          gallery_name: data.name
        });
      } else {
        setError('Gallery not found');
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [id]);

  useEffect(() => {
    return () => {
      if (analytics) {
        analytics.trackTimeSpent();
      }
    };
  }, [analytics]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>Loading gallery...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.accent }]}
            onPress={fetchGallery}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!gallery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>Gallery not found.</Text>
        </View>
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
      analytics.trackInteraction('share', null, { gallery_name: gallery.name });
    }
    Alert.alert('Share', `Share ${gallery.name} gallery`);
  };
  
  const handleArtworkPress = (artwork: Artwork) => {
    if (analytics) {
      analytics.trackArtworkView(artwork.id, artwork.title);
    }
    router.push(`/gallery/${gallery.id}/artwork/${artwork.id}`);
  };
  
  const handleViewAllArtworks = () => {
    if (analytics) {
      analytics.trackInteraction('view_all_artworks');
    }
    router.push(`/gallery/${gallery.id}/artworks`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: gallery.image_url }} style={styles.image} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{gallery.name}</Text>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleFavoriteToggle}
                activeOpacity={0.7}
              >
                <Heart 
                  size={24} 
                  color={isFavorite ? colors.accent : textColor} 
                  fill={isFavorite ? colors.accent : 'transparent'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Share2 size={24} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={18} color={colors.accent} />
            <Text style={[styles.infoText, { color: secondaryTextColor }]}>{gallery.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={18} color={colors.accent} />
            <Text style={[styles.infoText, { color: secondaryTextColor }]}>{gallery.hours}</Text>
          </View>
          
          {gallery.description && (
            <Text style={[styles.description, { color: textColor }]}>
              {gallery.description}
            </Text>
          )}
          
          {gallery.artworks && gallery.artworks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>Featured Artworks</Text>
                <TouchableOpacity onPress={handleViewAllArtworks} activeOpacity={0.7}>
                  <Text style={[styles.viewAll, { color: colors.accent }]}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.artworksGrid}>
                {gallery.artworks.slice(0, 4).map(artwork => (
                  <TouchableOpacity 
                    key={artwork.id} 
                    style={[styles.artworkCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => handleArtworkPress(artwork)}
                    activeOpacity={0.7}
                  >
                    <Image source={{ uri: artwork.image }} style={styles.artworkImage} />
                    <View style={styles.artworkInfo}>
                      <Text style={[styles.artworkTitle, { color: textColor }]} numberOfLines={1}>
                        {artwork.title}
                      </Text>
                      <Text style={[styles.artworkArtist, { color: secondaryTextColor }]} numberOfLines={1}>
                        {artwork.artist}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={[styles.viewAllButton, { backgroundColor: colors.accent }]}
                onPress={handleViewAllArtworks}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllButtonText}>View All Artworks</Text>
                <ArrowRight size={18} color={colors.background} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAll: {
    fontSize: 16,
    fontWeight: '600',
  },
  artworksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  artworkCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  artworkImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  artworkInfo: {
    padding: 12,
  },
  artworkTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  artworkArtist: {
    fontSize: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  viewAllButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
});