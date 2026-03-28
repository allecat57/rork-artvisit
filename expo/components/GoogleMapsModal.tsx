import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  Dimensions,
  Linking,
  Platform,
  Alert
} from "react-native";
import { Image } from "expo-image";
import { X, Navigation, MapPin, Clock, Star, Phone, Globe } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";
import { Venue } from "@/types/venue";

const { width, height } = Dimensions.get("window");

interface MapModalProps {
  visible: boolean;
  venue: Venue | null;
  onClose: () => void;
}

export default function MapModal({ 
  visible, 
  venue, 
  onClose
}: MapModalProps) {
  if (!venue) return null;
  
  // In a real app, we would use a maps API to generate a map image
  // For this demo, we'll use a placeholder image
  const mapImageUrl = "https://images.unsplash.com/photo-1569336415962-a4bd9f69c07b?q=80&w=1000";
  
  // Simulate opening maps with directions
  const openMapsWithDirections = () => {
    // In a real app, we would construct a proper maps URL with the venue coordinates
    const mapsUrl = Platform.select({
      ios: `maps://maps.apple.com/?daddr=${encodeURIComponent(venue.location)}`,
      android: `https://maps.google.com/maps?daddr=${encodeURIComponent(venue.location)}`,
      web: `https://maps.google.com/maps?q=${encodeURIComponent(venue.location)}`
    });
    
    if (mapsUrl) {
      Linking.canOpenURL(mapsUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(mapsUrl);
          } else {
            Alert.alert(
              "Cannot Open Maps",
              "Maps app is not installed on your device.",
              [{ text: "OK" }]
            );
          }
        })
        .catch(error => {
          console.error("Error opening Maps:", error);
          Alert.alert(
            "Error",
            "There was an error opening Maps.",
            [{ text: "OK" }]
          );
        });
    }
  };
  
  // Simulate making a phone call
  const makePhoneCall = () => {
    // In a real app, we would get the phone number from the venue data
    const phoneNumber = "+1-555-123-4567";
    const phoneUrl = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert(
            "Cannot Make Call",
            "Your device doesn't support making phone calls.",
            [{ text: "OK" }]
          );
        }
      })
      .catch(error => {
        console.error("Error making phone call:", error);
      });
  };
  
  // Simulate opening the venue website
  const openWebsite = () => {
    // In a real app, we would get the website URL from the venue data
    const websiteUrl = "https://example.com";
    
    Linking.canOpenURL(websiteUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(websiteUrl);
        } else {
          Alert.alert(
            "Cannot Open Website",
            "Your device doesn't support opening this website.",
            [{ text: "OK" }]
          );
        }
      })
      .catch(error => {
        console.error("Error opening website:", error);
      });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.primary.text} />
          </TouchableOpacity>
          
          <View style={styles.mapContainer}>
            <Image
              source={{ uri: mapImageUrl }}
              style={styles.mapImage}
              contentFit="cover"
            />
            
            <View style={styles.mapPinContainer}>
              <MapPin size={32} color={colors.primary.accent} />
            </View>
          </View>
          
          <View style={styles.venueInfoContainer}>
            <Text style={[typography.heading2, styles.venueName]}>{venue.name}</Text>
            <Text style={[typography.bodySmall, styles.venueType]}>{venue.type}</Text>
            
            <View style={styles.ratingContainer}>
              <Star size={16} color={colors.primary.accent} fill={colors.primary.accent} />
              <Text style={styles.rating}>{venue.rating.toFixed(1)}</Text>
              <Text style={styles.reviewCount}>(124 reviews)</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={18} color={colors.primary.muted} />
              <Text style={[typography.body, styles.infoText]}>{venue.location}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={18} color={colors.primary.muted} />
              <Text style={[typography.body, styles.infoText]}>{venue.openingHours}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Phone size={18} color={colors.primary.muted} />
              <TouchableOpacity onPress={makePhoneCall}>
                <Text style={[typography.body, styles.linkText]}>+1-555-123-4567</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.infoItem}>
              <Globe size={18} color={colors.primary.muted} />
              <TouchableOpacity onPress={openWebsite}>
                <Text style={[typography.body, styles.linkText]}>Visit Website</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Button
              title="Get Directions"
              onPress={openMapsWithDirections}
              icon={<Navigation size={18} color={colors.primary.background} />}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.primary.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  mapContainer: {
    height: 250,
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
    marginLeft: -16,
    marginTop: -32,
  },
  venueInfoContainer: {
    padding: 20,
  },
  venueName: {
    marginBottom: 4,
  },
  venueType: {
    color: colors.primary.muted,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rating: {
    ...typography.body,
    color: colors.primary.accent,
    marginLeft: 4,
    fontWeight: "600",
  },
  reviewCount: {
    ...typography.bodySmall,
    color: colors.primary.muted,
    marginLeft: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    color: colors.primary.text,
  },
  linkText: {
    marginLeft: 12,
    color: colors.primary.accent,
    textDecorationLine: "underline",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.primary.border,
  },
});