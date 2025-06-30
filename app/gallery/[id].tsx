import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Image } from "expo-image";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Share,
  Heart,
  Star
} from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import ReservationModal from "@/components/ReservationModal";
import { useVenueStore } from "@/store/useVenueStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useVisitHistoryStore } from "@/store/useVisitHistoryStore";
import * as Analytics from "@/utils/analytics";

const { width } = Dimensions.get("window");

export default function GalleryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getVenueById } = useVenueStore();
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const { addVisit } = useVisitHistoryStore();
  
  const [venue, setVenue] = useState<any>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  
  const venueId = Array.isArray(id) ? id[0] : id;
  const isVenueFavorite = venue ? isFavorite(venue.id) : false;
  
  useEffect(() => {
    if (venueId) {
      const venueData = getVenueById(venueId);
      setVenue(venueData);
      
      if (venueData) {
        // Track page view
        Analytics.logEvent("venue_detail_view", {
          venue_id: venueData.id,
          venue_name: venueData.name,
          venue_type: venueData.type
        });
        
        // Add to visit history
        addVisit({
          id: `visit-${Date.now()}`,
          venueId: venueData.id,
          visitDate: new Date().toISOString(),
          duration: 0 // Will be updated when user leaves
        });
      }
    }
  }, [venueId]);
  
  const handleBack = () => {
    if (venue) {
      Analytics.logEvent("venue_detail_back", {
        venue_id: venue.id,
        venue_name: venue.name
      });
    }
    router.back();
  };
  
  const handleShare = () => {
    if (venue) {
      Analytics.logEvent("venue_share", {
        venue_id: venue.id,
        venue_name: venue.name
      });
      
      Alert.alert(
        "Share Venue",
        `Share ${venue.name} with friends!`,
        [{ text: "OK" }]
      );
    }
  };
  
  const handleFavoriteToggle = () => {
    if (venue) {
      if (isVenueFavorite) {
        removeFavorite(venue.id);
        Analytics.logEvent("venue_unfavorite", {
          venue_id: venue.id,
          venue_name: venue.name
        });
      } else {
        addFavorite(venue);
        Analytics.logEvent("venue_favorite", {
          venue_id: venue.id,
          venue_name: venue.name
        });
      }
    }
  };
  
  const handleArtworkPress = (artwork: any) => {
    setSelectedArtwork(artwork);
    if (venue) {
      Analytics.logEvent("artwork_view", {
        venue_id: venue.id,
        artwork_id: artwork.id,
        artwork_title: artwork.title
      });
      
      router.push(`/gallery/${venue.id}/artwork/${artwork.id}`);
    }
  };
  
  const handleMakeReservation = () => {
    if (venue) {
      Analytics.logEvent("reservation_start", {
        venue_id: venue.id,
        venue_name: venue.name
      });
    }
    setShowReservationModal(true);
  };

  const handleReservationComplete = (venue: any, date: Date, timeSlot: string) => {
    setShowReservationModal(false);
    Alert.alert(
      "Reservation Confirmed!",
      `Your visit to ${venue.name} has been scheduled for ${date.toLocaleDateString()} at ${timeSlot}.`,
      [
        {
          text: "View Reservations",
          onPress: () => router.push("/reservations")
        },
        { text: "OK" }
      ]
    );
  };
  
  if (!venue) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Venue not found</Text>
          <Button title="Go Back" onPress={handleBack} />
        </View>
      </SafeAreaView>
    );
  }
  
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share size={20} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleFavoriteToggle}>
          <Heart 
            size={20} 
            color={isVenueFavorite ? colors.status.error : colors.text}
            fill={isVenueFavorite ? colors.status.error : "transparent"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderVenueInfo = () => (
    <View style={styles.venueInfo}>
      <Text style={styles.venueName}>{venue.name}</Text>
      
      <View style={styles.infoRow}>
        <MapPin size={16} color={colors.muted} />
        <Text style={styles.infoText}>{venue.location}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Clock size={16} color={colors.muted} />
        <Text style={styles.infoText}>{venue.openingHours}</Text>
      </View>
      
      <Text style={styles.description}>{venue.description}</Text>
    </View>
  );
  
  const renderArtworks = () => {
    if (!venue.artworks || venue.artworks.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.artworksSection}>
        <Text style={styles.sectionTitle}>Featured Artworks</Text>
        <FlatList
          data={venue.artworks}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.artworkCard}
              onPress={() => handleArtworkPress(item)}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.artworkImage}
                contentFit="cover"
              />
              <View style={styles.artworkInfo}>
                <Text style={styles.artworkTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.artworkArtist} numberOfLines={1}>
                  {item.artist}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.artworksList}
        />
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: venue.imageUrl }}
            style={styles.venueImage}
            contentFit="cover"
          />
          {renderHeader()}
        </View>
        
        <View style={styles.content}>
          {renderVenueInfo()}
          {renderArtworks()}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <DollarSign size={16} color={colors.muted} />
          <Text style={styles.priceText}>{venue.admission}</Text>
        </View>
        
        <Button
          title="Make Reservation"
          onPress={handleMakeReservation}
          icon={<Calendar size={18} color={colors.primary} />}
          style={styles.reservationButton}
        />
      </View>
      
      <ReservationModal
        visible={showReservationModal}
        venue={venue}
        onClose={() => setShowReservationModal(false)}
        onReserve={handleReservationComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
  },
  venueImage: {
    width: width,
    height: 300,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 20,
  },
  venueInfo: {
    marginBottom: 24,
  },
  venueName: {
    ...typography.heading1,
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    marginLeft: 8,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginTop: 12,
  },
  artworksSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 16,
  },
  artworksList: {
    paddingLeft: 0,
  },
  artworkCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
  },
  artworkImage: {
    width: "100%",
    height: 120,
  },
  artworkInfo: {
    padding: 12,
  },
  artworkTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  artworkArtist: {
    ...typography.caption,
    color: colors.muted,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.primary,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceText: {
    ...typography.heading3,
    color: colors.text,
    marginLeft: 4,
  },
  reservationButton: {
    flex: 1,
    marginLeft: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
});