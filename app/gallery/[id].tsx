import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Share2, MapPin, Clock, ArrowRight, Calendar } from 'lucide-react-native';
import colors from '../../constants/colors';
import { GalleryAnalytics } from '../../utils/artvisit-integration';
import * as Analytics from '../../utils/analytics';
import ReservationModal from '../../components/ReservationModal';
import { useVenueStore } from '../../store/useVenueStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Venue } from '../../types/venue';

// Mock data - in a real app, fetch this from your API
const galleries = [
  {
    id: '1',
    name: 'Modern Art Gallery',
    description: 'A contemporary art gallery featuring works from emerging artists around the world.',
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80',
    hours: '10:00 AM - 6:00 PM',
    admission: '$15',
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
    admission: '$20',
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
  const textColor = isDark ? colors.light : colors.dark;
  const bgColor = isDark ? colors.dark : colors.light;
  
  const [gallery, setGallery] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  
  const { addReservation } = useVenueStore();
  const { user, isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Find gallery from mock data
    const foundGallery = galleries.find(g => g.id === id);
    setGallery(foundGallery);
    
    if (foundGallery) {
      // Initialize analytics
      const galleryAnalytics = new GalleryAnalytics({
        id: foundGallery.id,
        name: foundGallery.name,
        location: foundGallery.location
      });
      
      setAnalytics(galleryAnalytics);
      
      // Track gallery view
      galleryAnalytics.trackGalleryView();
      
      // Log screen view to TimeFrame Analytics
      Analytics.sendToTimeFrameAnalytics('screen_view', {
        screen_name: 'Gallery Detail',
        screen_class: 'GalleryScreen',
        gallery_id: foundGallery.id,
        gallery_name: foundGallery.name
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
        <Text style={[styles.loadingText, { color: textColor }]}>Loading gallery...</Text>
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
    // Implement share functionality
  };
  
  const handleArtworkPress = (artwork) => {
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

  const handleMakeReservation = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (analytics) {
      analytics.trackInteraction('make_reservation_clicked', null, { gallery_name: gallery.name });
    }
    
    setReservationModalVisible(true);
  };

  const handleReservationComplete = (venue: Venue, date: Date, timeSlot: string) => {
    if (!user) return;
    
    // Create reservation object
    const reservation = {
      id: `res_${Date.now()}`,
      userId: user.id,
      venueId: venue.id,
      date: date.toISOString().split('T')[0],
      time: timeSlot,
      partySize: 2,
      status: 'confirmed' as const,
      confirmationCode: `GR${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      specialRequests: '',
      type: 'venue' as const
    };
    
    // Add to store
    addReservation(reservation);
    
    // Track analytics
    if (analytics) {
      analytics.trackInteraction('reservation_completed', null, { 
        gallery_name: gallery.name,
        date: date.toISOString(),
        time_slot: timeSlot
      });
    }
    
    // Close modal
    setReservationModalVisible(false);
  };

  // Convert gallery to venue format for reservation system
  const galleryAsVenue: Venue = {
    id: `gallery_${gallery.id}`,
    name: gallery.name,
    type: 'Art Gallery',
    description: gallery.description,
    imageUrl: gallery.image,
    location: gallery.location,
    distance: '0 mi',
    rating: 4.5,
    openingHours: gallery.hours,
    admission: gallery.admission,
    featured: false,
    category: 'galleries',
    coordinates: {
      latitude: 40.7589,
      longitude: -73.9851
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
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
            <Text style={[styles.infoText, { color: textColor }]}>{gallery.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={18} color={colors.primary} />
            <Text style={[styles.infoText, { color: textColor }]}>{gallery.hours}</Text>
          </View>
          
          <Text style={[styles.description, { color: textColor }]}>
            {gallery.description}
          </Text>
          
          {/* Reservation Button */}
          <TouchableOpacity 
            style={[styles.reservationButton, { backgroundColor: colors.primary }]}
            onPress={handleMakeReservation}
          >
            <Calendar size={20} color="#fff" />
            <Text style={styles.reservationButtonText}>Make Reservation</Text>
          </TouchableOpacity>
          
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>Featured Artworks</Text>
              <TouchableOpacity onPress={handleViewAllArtworks}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.artworksGrid}>
              {gallery.artworks.map(artwork => (
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
            
            <TouchableOpacity 
              style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
              onPress={handleViewAllArtworks}
            >
              <Text style={styles.viewAllButtonText}>View All Artworks</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Reservation Modal */}
      <ReservationModal
        visible={reservationModalVisible}
        venue={galleryAsVenue}
        onClose={() => setReservationModalVisible(false)}
        onReserve={handleReservationComplete}
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
  reservationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  reservationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
});