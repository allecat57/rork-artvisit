import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import { MapPin, Navigation, ExternalLink } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Venue } from "@/types/venue";

interface MapPreviewProps {
  venue: Venue;
  userLocation?: { latitude: number; longitude: number } | null;
  onNavigate?: () => void;
  onExpand?: () => void;
}

const { width } = Dimensions.get("window");

export default function MapPreview({ venue, userLocation, onNavigate, onExpand }: MapPreviewProps) {
  // In a real app, we would use a maps API to generate a map image
  // For this demo, we'll use a placeholder image
  const mapImageUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69c07b?q=80&w=1000";
  
  // Format address for display
  const formattedAddress = venue.location;
  
  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      // In a real app, we would open maps with directions
      console.log("Navigate to venue");
    }
  };
  
  const handleExpand = () => {
    if (onExpand) {
      onExpand();
    } else {
      // In a real app, we would open a full-screen map
      console.log("Expand map");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MapPin size={16} color={colors.primary.accent} />
          <Text style={styles.title}>Location</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.mapContainer}
        onPress={handleExpand}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: mapImageUrl }}
          style={styles.mapImage}
          contentFit="cover"
        />
        
        <View style={styles.mapPinContainer}>
          <MapPin size={24} color={colors.primary.accent} />
        </View>
        
        <View style={styles.mapOverlay}>
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={handleExpand}
          >
            <ExternalLink size={16} color={colors.primary.background} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      
      <View style={styles.addressContainer}>
        <Text style={styles.address}>{formattedAddress}</Text>
        
        <TouchableOpacity 
          style={styles.directionsButton}
          onPress={handleNavigate}
        >
          <Navigation size={16} color={colors.primary.background} />
          <Text style={styles.directionsText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    ...typography.heading3,
    fontSize: 16,
    marginLeft: 8,
  },
  mapContainer: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPinContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -24,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  expandButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.primary.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addressContainer: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  address: {
    ...typography.body,
    flex: 1,
    marginRight: 12,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  directionsText: {
    ...typography.bodySmall,
    color: colors.primary.background,
    fontWeight: "600",
    marginLeft: 4,
  },
});