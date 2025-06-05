import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, Award, Heart } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import * as Haptics from "expo-haptics";
import { Venue } from "@/types/venue";

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
  onPress: () => void;
  useGoldText?: boolean;
}

export default function FeaturedVenueCard({
  venue,
  onPress,
  useGoldText = false,
}: FeaturedVenueCardProps) {
  if (!venue) {
    return null; // Return null if venue is undefined
  }

  const { id, name, imageUrl, location, featured = false } = venue;
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = isFavorite(id);

  const handleFavoriteToggle = (e: any) => {
    e.stopPropagation();
    
    // Provide haptic feedback on iOS/Android
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
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
        colors={["transparent", "rgba(1, 48, 37, 0.7)", "rgba(1, 48, 37, 0.95)"]}
        style={styles.gradient}
      >
        <View style={styles.topContainer}>
          {featured && (
            <View style={styles.featuredBadge}>
              <Award size={14} color={colors.primary.background} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Heart 
              size={24} 
              color={favorite ? colors.status.error : "white"} 
              fill={favorite ? colors.status.error : "none"}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            typography.heading3, 
            styles.name, 
            useGoldText && styles.goldText
          ]} numberOfLines={2}>{name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color={useGoldText ? "#AC8901" : colors.primary.muted} />
            <Text style={[
              typography.bodySmall, 
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
    fontSize: 18, // Reduced from 20px to 18px to make it less busy
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  goldText: {
    color: "#AC8901",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontFamily,
    marginLeft: 4,
    color: colors.primary.muted,
  },
  goldLocationText: {
    color: "#AC8901",
  },
  featuredBadge: {
    backgroundColor: "#AC8901",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  featuredText: {
    ...typography.caption,
    fontFamily,
    color: colors.primary.background,
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