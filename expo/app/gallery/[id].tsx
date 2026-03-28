import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Share2, MapPin, Clock, ArrowRight, ArrowLeft } from 'lucide-react-native';
import colors from '../../constants/colors';
import * as Analytics from '../../utils/analytics';
import TimeFrameAPI from '../../utils/timeframe-api';
import { useVenueStore } from '../../store/useVenueStore';

interface Gallery {
  id: string;
  name: string;
  description: string;
  location: string;
  image: string;
  hours: string;
  admission?: string;
  phone?: string;
  website?: string;
}

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image: string;
  sold?: boolean;
}

// Mock data as fallback
const mockGalleries = [
  {
    id: '1',
    name: 'Modern Art Gallery',
    description: 'A contemporary art gallery featuring works from emerging artists around the world.',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    hours: '10:00 AM - 6:00 PM',
    artworks: [
      { id: '101', title: 'Abstract Harmony', artist: 'Jane Smith', image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '102', title: 'Urban Landscape', artist: 'Michael Johnson', image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
    ]
  },
  {
    id: '2',
    name: 'Classical Art Museum',
    description: 'A prestigious museum housing classical art from the Renaissance to the 19th century.',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1574182245530-967d9b3831af?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    hours: '9:00 AM - 5:00 PM',
    artworks: [
      { id: '201', title: 'Portrait of a Lady', artist: 'Leonardo da Vinci', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
      { id: '202', title: 'Sunset over the Sea', artist: 'Claude Monet', image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80' },
    ]
  }
];

export default function GalleryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? colors.text : colors.text;
  const bgColor = isDark ? colors.background : colors.background;
  
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getVenueById } = useVenueStore();
  
  useEffect(() => {
    const loadGalleryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🏛️ Loading gallery data for ID:', id);
        
        // First, try to get gallery from venue store (for TimeFrame galleries)
        const venue = getVenueById(`timeframe-${id}`);
        if (venue) {
          console.log('✅ Found TimeFrame gallery in venue store:', venue.name);
          
          // Convert venue to gallery format
          const galleryData: Gallery = {
            id: Array.isArray(id) ? id[0] : id,
            name: venue.name,
            description: venue.description,
            location: venue.location,
            image: venue.imageUrl,
            hours: venue.openingHours,
            admission: venue.admission,
            phone: venue.phone,
            website: venue.website
          };
          
          setGallery(galleryData);
          
          // Try to load artworks from TimeFrame API
          try {
            const artworksResponse = await TimeFrameAPI.getGalleryArtworks(parseInt(id as string));
            if (artworksResponse.success && artworksResponse.data) {
              setArtworks(artworksResponse.data);
              console.log(`✅ Loaded ${artworksResponse.data.length} artworks`);
            }
          } catch (artworkError) {
            console.warn('⚠️ Could not load artworks:', artworkError);
            // Use sample artworks as fallback
            setArtworks([
              { id: `${id}01`, title: 'Featured Artwork 1', artist: 'Contemporary Artist', image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?w=800&h=600&fit=crop' },
              { id: `${id}02`, title: 'Featured Artwork 2', artist: 'Modern Artist', image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&h=600&fit=crop' },
            ]);
          }
          
        } else {
          // Fallback to mock data
          console.log('⚠️ Gallery not found in venue store, using mock data');
          const foundGallery = mockGalleries.find(g => g.id === id);
          if (foundGallery) {
            setGallery(foundGallery);
            setArtworks(foundGallery.artworks || []);
          } else {
            throw new Error('Gallery not found');
          }
        }
        
      } catch (err: any) {
        console.error('❌ Error loading gallery:', err);
        setError(err?.message || 'Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadGalleryData();
    }
  }, [id, getVenueById]);
  
  useEffect(() => {
    if (gallery) {
      // Log screen view
      Analytics.logEvent('gallery_view', {
        gallery_id: gallery.id,
        gallery_name: gallery.name,
        gallery_location: gallery.location
      });
    }
  }, [gallery]);
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ title: 'Loading...', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading gallery...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error || !gallery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Stack.Screen options={{ title: 'Gallery Not Found', headerShown: true }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>
            {error || 'Gallery not found'}
          </Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.accent }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={18} color="white" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    Analytics.logEvent('gallery_favorite_toggle', {
      gallery_id: gallery?.id,
      gallery_name: gallery?.name,
      is_favorite: !isFavorite
    });
  };
  
  const handleShare = () => {
    Analytics.logEvent('gallery_share', {
      gallery_id: gallery?.id,
      gallery_name: gallery?.name
    });
    // Implement share functionality
  };
  
  const handleArtworkPress = (artwork: Artwork) => {
    Analytics.logEvent('artwork_view', {
      artwork_id: artwork.id,
      artwork_title: artwork.title,
      gallery_id: gallery?.id
    });
    router.push(`/gallery/${gallery?.id}/artwork/${artwork.id}`);
  };
  
  const handleViewAllArtworks = () => {
    Analytics.logEvent('view_all_artworks', {
      gallery_id: gallery?.id,
      gallery_name: gallery?.name
    });
    router.push(`/gallery/${gallery?.id}/artworks`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <Stack.Screen options={{ 
        title: gallery.name,
        headerShown: true,
        headerStyle: { backgroundColor: bgColor },
        headerTintColor: textColor
      }} />
      <ScrollView>
        <Image source={{ uri: gallery.image }} style={styles.image} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{gallery.name}</Text>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleFavoriteToggle}
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
              >
                <Share2 size={24} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={18} color={colors.accent} />
            <Text style={[styles.infoText, { color: textColor }]}>{gallery.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={18} color={colors.accent} />
            <Text style={[styles.infoText, { color: textColor }]}>{gallery.hours}</Text>
          </View>
          
          <Text style={[styles.description, { color: textColor }]}>
            {gallery.description}
          </Text>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Featured Artworks</Text>
              <TouchableOpacity onPress={handleViewAllArtworks}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.artworksGrid}>
              {artworks.map(artwork => (
                <TouchableOpacity 
                  key={artwork.id} 
                  style={styles.artworkCard}
                  onPress={() => handleArtworkPress(artwork)}
                >
                  <Image source={{ uri: artwork.image }} style={styles.artworkImage} />
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
            
            {artworks.length === 0 && (
              <View style={styles.noArtworksContainer}>
                <Text style={[styles.noArtworksText, { color: textColor }]}>
                  No artworks available at the moment
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.viewAllButton, { backgroundColor: colors.accent }]}
              onPress={handleViewAllArtworks}
            >
              <Text style={styles.viewAllButtonText}>View All Artworks</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
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
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noArtworksContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noArtworksText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
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
    color: colors.accent,
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
});