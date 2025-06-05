import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Award, Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import * as Haptics from 'expo-haptics';
import { Venue } from '@/types/venue';

interface FeaturedVenueCardProps {
  venue?: Venue;
  onPress?: () => void;
  useGoldText?: boolean;
}

export default function FeaturedVenueCard({
  venue,
  onPress,
  useGoldText = false,
}: FeaturedVenueCardProps) {
  // Early return if no venue
  if (!venue) return null;

  const { id, name, imageUrl, location, featured = false } = venue;
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = id ? isFavorite(id) : false;

  const handleFavoriteToggle = (e: any) => {
    e.stopPropagation();
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (!id) return;
    
    if (favorite) {
      removeFavorite(id);
    } else {
      addFavorite(venue);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      >
        <View style={styles.topContainer}>
          {featured && (
            <View style={styles.featuredBadge}>
              <Award size={14} color="#fff" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Heart 
              size={24} 
              color={favorite ? colors.status.error : '#fff'} 
              fill={favorite ? colors.status.error : 'none'}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.name,
            useGoldText && styles.goldText
          ]} numberOfLines={2}>{name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color={useGoldText ? '#AC8901' : '#fff'} />
            <Text style={[
              styles.location,
              useGoldText && styles.goldLocationText
            ]}>{location}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card.light,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  goldText: {
    color: '#AC8901',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
  },
  goldLocationText: {
    color: '#AC8901',
  },
  featuredBadge: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});