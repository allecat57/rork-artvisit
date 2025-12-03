import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, MapPin, Clock, Star, Heart, Share2, ArrowRight } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const MODAL_HEIGHT = screenHeight * 0.75;

interface Gallery {
  id: string;
  name: string;
  description?: string;
  location: string;
  hours?: string;
  rating?: number;
  category?: string;
  image?: string;
}

interface GalleryModalProps {
  visible: boolean;
  gallery: Gallery | null;
  onClose: () => void;
}

export default function GalleryModal({ visible, gallery, onClose }: GalleryModalProps) {
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const [translateY] = useState(new Animated.Value(MODAL_HEIGHT));
  
  const favorite = gallery ? isFavorite(gallery.id) : false;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: MODAL_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100 || gestureState.vy > 0.5) {
        handleClose();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleClose = () => {
    Animated.spring(translateY, {
      toValue: MODAL_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      onClose();
    });
  };

  const handleFavoriteToggle = () => {
    if (!gallery) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (favorite) {
      removeFavorite(gallery.id);
    } else {
      // Convert gallery to venue format for favorites store
      const venueFormat = {
        id: gallery.id,
        name: gallery.name,
        location: gallery.location,
        type: gallery.category || 'Gallery',
        description: gallery.description || 'A beautiful gallery space.',
        rating: gallery.rating || 4.8,
        imageUrl: gallery.image || 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80',
        openingHours: gallery.hours || '10:00 AM - 6:00 PM',
        distance: '0 mi',
        admission: 'Free',
        featured: false,
        category: gallery.category || 'Gallery'
      };
      addFavorite(venueFormat);
    }
  };

  const handleViewDetails = () => {
    if (!gallery) return;
    handleClose();
    setTimeout(() => {
      router.push(`/gallery/${gallery.id}`);
    }, 300);
  };

  const handleReserveVisit = () => {
    if (!gallery) return;
    handleClose();
    setTimeout(() => {
      router.push('/reservations');
    }, 300);
  };

  if (!gallery) return null;

  const galleryImage = gallery.image || 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        >
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
        
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandle} />
          
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
              >
                <X size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
            
            <Image 
              source={{ uri: galleryImage }} 
              style={styles.image}
            />
            
            <View style={styles.details}>
              <View style={styles.titleRow}>
                <View style={styles.titleContainer}>
                  <Text style={styles.name}>{gallery.name}</Text>
                  <Text style={styles.type}>{gallery.category || 'Art Museum'}</Text>
                </View>
                
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleFavoriteToggle}
                  >
                    <Heart 
                      size={24} 
                      color={favorite ? colors.status.error : colors.white} 
                      fill={favorite ? colors.status.error : 'none'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={24} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.ratingContainer}>
                <Star size={16} color={colors.accent} fill={colors.accent} />
                <Text style={styles.rating}>{(gallery.rating || 4.8).toFixed(1)}</Text>
              </View>
              
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <MapPin size={16} color={colors.white} />
                  <Text style={styles.infoText}>{gallery.location}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Clock size={16} color={colors.white} />
                  <Text style={styles.infoText}>{gallery.hours || '10:00 AM - 6:00 PM'}</Text>
                </View>
              </View>
              
              <Text style={styles.description}>
                {gallery.description || 'Discover amazing artworks and exhibitions at this beautiful gallery. Experience world-class collections and immerse yourself in culture.'}
              </Text>
              
              <TouchableOpacity 
                style={styles.reserveButton}
                onPress={handleReserveVisit}
              >
                <Text style={styles.reserveButtonText}>Reserve Visit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: '#2D5A3D', // Green background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  details: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    ...typography.heading2,
    color: colors.white,
    marginBottom: 4,
  },
  type: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    ...typography.bodyMedium,
    color: colors.accent,
    marginLeft: 6,
    fontWeight: '600',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    ...typography.bodyMedium,
    color: colors.white,
    marginLeft: 8,
    flex: 1,
  },
  description: {
    ...typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: 24,
  },
  reserveButton: {
    backgroundColor: '#B8860B', // Golden/bronze color for the button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  reserveButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});