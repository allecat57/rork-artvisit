import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Award, Heart, DollarSign } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import * as Haptics from "expo-haptics";
import { Venue } from "@/types/venue";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

// Define serif font family with proper fallbacks for all platforms
const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif"
});

interface FeaturedVenueCardProps {
  venue: Venue;
  onPress?: () => void;
  useGoldText?: boolean;
}

export default function FeaturedVenueCard({
  venue,
  onPress,
  useGoldText = false,
}: FeaturedVenueCardProps) {
  const router = useRouter();
  // Early return if venue is undefined or null
  if (!venue || !venue.id) {
    console.warn('FeaturedVenueCard: venue is undefined or missing id');
    return null;
  }

  const { id, name, imageUrl, location, featured = false, admission } = venue;
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = isFavorite(id);

  const handleFavoriteToggle = (e: any) => {
    e.stopPropagation();
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.warn('Haptics not available:', error);
      }
    }
    
    if (favorite) {
      removeFavorite(id);
    } else {
      addFavorite(venue);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/venue/${id}`);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: imageUrl || 'https://via.placeholder.com/400x220' }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(1, 48, 37, 0.7)", "rgba(1, 48, 37, 0.95)"]}
        style={styles.gradient}
      >
        <View style={styles.topContainer}>
          {featured && (
            <View style={styles.featuredBadge}>
              <Award size={14} color={colors.primary} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Heart 
              size={24} 
              color={favorite ? colors.error : colors.white} 
              fill={favorite ? colors.error : "none"}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            typography.heading3, 
            styles.name, 
            useGoldText && styles.goldText
          ]} numberOfLines={2}>{name || 'Unnamed Venue'}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.locationContainer}>
              <MapPin size={16} color={useGoldText ? colors.accent : colors.textSecondary} />
              <Text style={[
                typography.bodySmall, 
                styles.location,
                useGoldText && styles.goldLocationText
              ]} numberOfLines={1}>{location || 'Location not specified'}</Text>
            </View>
            
            {admission && (
              <View style={styles.admissionContainer}>
                <DollarSign size={14} color={useGoldText ? colors.accent : colors.white} />
                <Text style={[
                  typography.bodySmall,
                  styles.admissionText,
                  useGoldText && styles.goldAdmissionText
                ]}>{admission}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  textContainer: {
    padding: 16,
  },
  name: {
    fontFamily,
    fontSize: 18,
    color: colors.white,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  goldText: {
    color: colors.accent,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  location: {
    fontFamily,
    marginLeft: 4,
    color: colors.textSecondary,
    flex: 1,
  },
  goldLocationText: {
    color: colors.accent,
  },
  admissionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  admissionText: {
    fontFamily,
    color: colors.white,
    marginLeft: 4,
    fontWeight: "600",
  },
  goldAdmissionText: {
    color: colors.accent,
  },
  featuredBadge: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  featuredText: {
    ...typography.caption,
    fontFamily,
    color: colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});