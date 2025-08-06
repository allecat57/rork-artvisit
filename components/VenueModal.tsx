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
import { Venue } from '@/types/venue';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');
const MODAL_HEIGHT = screenHeight * 0.75;

interface VenueModalProps {
  visible: boolean;
  venue: Venue | null;
  onClose: () => void;
}

export default function VenueModal({ visible, venue, onClose }: VenueModalProps) {
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const [translateY] = useState(new Animated.Value(MODAL_HEIGHT));
  
  const favorite = venue ? isFavorite(venue.id) : false;

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
    if (!venue) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (favorite) {
      removeFavorite(venue.id);
    } else {
      addFavorite(venue);
    }
  };

  const handleViewDetails = () => {
    if (!venue) return;
    handleClose();
    setTimeout(() => {
      router.push(`/venue/${venue.id}`);
    }, 300);
  };

  if (!venue) return null;

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
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Image 
              source={{ uri: venue.imageUrl }} 
              style={styles.image}
            />
            
            <View style={styles.details}>
              <View style={styles.titleRow}>
                <View style={styles.titleContainer}>
                  <Text style={styles.name}>{venue.name}</Text>
                  <Text style={styles.type}>{venue.type}</Text>
                </View>
                
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={handleFavoriteToggle}
                  >
                    <Heart 
                      size={24} 
                      color={favorite ? colors.status.error : colors.muted} 
                      fill={favorite ? colors.status.error : 'none'}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={24} color={colors.muted} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.ratingContainer}>
                <Star size={16} color={colors.accent} fill={colors.accent} />
                <Text style={styles.rating}>{venue.rating.toFixed(1)}</Text>
              </View>
              
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <MapPin size={16} color={colors.muted} />
                  <Text style={styles.infoText}>{venue.location}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Clock size={16} color={colors.muted} />
                  <Text style={styles.infoText}>{venue.openingHours}</Text>
                </View>
              </View>
              
              <Text style={styles.description}>
                Discover amazing artworks and exhibitions at this beautiful venue. 
                Experience world-class collections and immerse yourself in culture.
              </Text>
              
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={handleViewDetails}
              >
                <Text style={styles.viewDetailsText}>View Full Details</Text>
                <ArrowRight size={20} color={colors.white} />
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
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
    backgroundColor: colors.surface,
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
    color: colors.text,
    marginBottom: 4,
  },
  type: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
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
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  description: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  viewDetailsButton: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewDetailsText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },
});