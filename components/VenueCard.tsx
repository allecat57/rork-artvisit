import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";
import { Image } from "expo-image";
import { MapPin, Clock, Star, Navigation, AlertCircle, Heart } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useLocationStore } from "@/store/useLocationStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import * as Haptics from "expo-haptics";
import * as Analytics from "@/utils/analytics";
import { Venue } from "@/types/venue";
import { useRouter } from "expo-router";

// Define serif font family with proper fallbacks for all platforms
const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif"
});

interface VenueCardProps {
  venue: Venue;
  onPress?: () => void;
}

export default function VenueCard({
  venue,
  onPress,
}: VenueCardProps) {
  const router = useRouter();
  const { id, name, type, imageUrl, rating, distance, openingHours } = venue;
  const { currentLocation, locationError } = useLocationStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  
  // Extract distance value to determine if it's within desired radius
  const distanceValue = parseFloat(distance.split(" ")[0]);
  const isNearby = distanceValue <= 10; // Highlight venues within 10 miles
  const isWithinRadius = distanceValue <= 50; // Check if within 50 mile radius

  const favorite = isFavorite(id);

  const handleFavoriteToggle = (e: any) => {
    e.stopPropagation();
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (favorite) {
      // Log unfavorite event
      Analytics.logEvent('unfavorite_venue', {
        venue_id: id,
        venue_name: name,
        venue_type: type
      });
      
      removeFavorite(id);
    } else {
      // Log favorite event
      Analytics.logEvent('favorite_venue', {
        venue_id: id,
        venue_name: name,
        venue_type: type
      });
      
      addFavorite(venue);
    }
  };

  const handleCardPress = () => {
    // Log venue card click
    Analytics.logEvent("venue_card_click", {
      venue_id: id,
      venue_name: name,
      venue_type: type,
      distance: distance
    });
    
    if (onPress) {
      onPress();
    } else {
      router.push(`/venue/${id}`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={[typography.heading3, styles.name]} numberOfLines={1}>{name}</Text>
            <Text style={[typography.caption, styles.type]}>{type}</Text>
          </View>
          <View style={styles.rightHeader}>
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={handleFavoriteToggle}
            >
              <Heart 
                size={20} 
                color={favorite ? colors.status.error : colors.muted} 
                fill={favorite ? colors.status.error : "none"}
              />
            </TouchableOpacity>
            <View style={styles.ratingContainer}>
              <Star size={14} color={colors.accent} fill={colors.accent} />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoContainer}>
          {currentLocation ? (
            <View style={[
              styles.infoItem, 
              styles.distanceItem,
              isNearby ? styles.nearbyItem : isWithinRadius ? styles.withinRadiusItem : styles.farItem
            ]}>
              {isWithinRadius ? (
                <Navigation 
                  size={14} 
                  color={isNearby ? colors.status.success : colors.accent} 
                />
              ) : (
                <AlertCircle size={14} color={colors.status.warning} />
              )}
              <Text 
                style={[
                  typography.caption, 
                  styles.infoText,
                  isNearby ? styles.nearbyText : isWithinRadius ? styles.withinRadiusText : styles.farText
                ]}
              >
                {distance}
                {!isWithinRadius && " (outside radius)"}
              </Text>
            </View>
          ) : locationError ? (
            <View style={[styles.infoItem, styles.locationErrorItem]}>
              <AlertCircle size={14} color={colors.status.error} />
              <Text style={[typography.caption, styles.locationErrorText]}>Location unavailable</Text>
            </View>
          ) : (
            <View style={styles.infoItem}>
              <MapPin size={14} color={colors.muted} />
              <Text style={[typography.caption, styles.infoText]}>{distance}</Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Clock size={14} color={colors.muted} />
            <Text style={[typography.caption, styles.infoText]}>{openingHours}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  image: {
    height: 140,
    width: "100%",
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  rightHeader: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  name: {
    fontFamily,
    fontSize: 18,
    flex: 1,
    marginRight: 8,
  },
  type: {
    fontFamily,
    color: colors.muted,
    marginTop: 2,
  },
  favoriteButton: {
    padding: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(172, 137, 1, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  rating: {
    fontFamily,
    ...typography.bodySmall,
    color: colors.accent,
    marginLeft: 4,
    fontWeight: "600",
  },
  infoContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  distanceItem: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nearbyItem: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  withinRadiusItem: {
    backgroundColor: "rgba(172, 137, 1, 0.15)",
  },
  farItem: {
    backgroundColor: "rgba(255, 152, 0, 0.15)",
  },
  locationErrorItem: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  infoText: {
    fontFamily,
    marginLeft: 4,
  },
  nearbyText: {
    fontFamily,
    color: colors.status.success,
    fontWeight: "500",
  },
  withinRadiusText: {
    fontFamily,
    color: colors.accent,
    fontWeight: "500",
  },
  farText: {
    fontFamily,
    color: colors.status.warning,
    fontWeight: "500",
  },
  locationErrorText: {
    fontFamily,
    color: colors.status.error,
    marginLeft: 4,
  },
});