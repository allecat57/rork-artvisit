import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image as RNImage } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { MapPin, Clock, Phone, Globe, Star, ArrowLeft, Calendar } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useVenueStore } from "@/store/useVenueStore";
import { useAuthStore } from "@/store/useAuthStore";
import ReservationModal from "@/components/ReservationModal";
import Button from "@/components/Button";
import * as Analytics from "@/utils/analytics";

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getVenueById } = useVenueStore();
  const { isAuthenticated } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  
  const venue = getVenueById(id);
  
  useEffect(() => {
    if (venue) {
      Analytics.logEvent("view_venue_detail", {
        venue_id: id,
        venue_name: venue.name,
        venue_type: venue.type
      });
    }
  }, [id, venue]);
  
  if (!venue) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Venue Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[typography.heading2, styles.errorText]}>
            Sorry, we couldn't find the venue you're looking for.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleReserve = () => {
    if (!isAuthenticated) {
      Analytics.logEvent("unauthenticated_reserve_attempt", {
        venue_id: id,
        venue_name: venue.name
      });
      router.push("/login");
      return;
    }
    
    setModalVisible(true);
    Analytics.logEvent("open_reservation_modal_from_detail", {
      venue_id: id,
      venue_name: venue.name,
      venue_type: venue.type
    });
  };
  
  const handleReservationComplete = (venue: any, date: Date, timeSlot: string) => {
    setModalVisible(false);
    Analytics.logEvent("reservation_completed_from_detail", {
      venue_id: id,
      venue_name: venue.name,
      date: date.toISOString(),
      time_slot: timeSlot
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={styles.scrollView}>
        <Image
          source={{ uri: venue.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{venue.name}</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.ratingContainer}>
            <Star size={16} color={colors.accent} fill={colors.accent} />
            <Text style={styles.rating}>{venue.rating.toFixed(1)}</Text>
          </View>
          
          <Text style={[typography.heading2, styles.name]}>{venue.name}</Text>
          <Text style={[typography.body, styles.type]}>{venue.type}</Text>
          
          <Text style={[typography.body, styles.description]}>{venue.description}</Text>
          
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <MapPin size={18} color={colors.muted} />
              <Text style={[typography.body, styles.infoText]}>{venue.location}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={18} color={colors.muted} />
              <Text style={[typography.body, styles.infoText]}>{venue.openingHours}</Text>
            </View>
            
            {venue.phone && (
              <View style={styles.infoItem}>
                <Phone size={18} color={colors.muted} />
                <Text style={[typography.body, styles.infoText]}>{venue.phone}</Text>
              </View>
            )}
            
            {venue.website && (
              <View style={styles.infoItem}>
                <Globe size={18} color={colors.muted} />
                <Text style={[typography.body, styles.infoText]}>{venue.website}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionContainer}>
            <Button
              title="Reserve Visit"
              onPress={handleReserve}
              icon={<Calendar size={18} color={colors.primary} />}
              analyticsEventName="reserve_button_click_from_detail"
              analyticsProperties={{
                venue_id: id,
                venue_name: venue.name,
                venue_type: venue.type
              }}
            />
          </View>
        </View>
        
        <ReservationModal
          visible={modalVisible}
          venue={venue}
          onClose={() => setModalVisible(false)}
          onReserve={handleReservationComplete}
        />
      </ScrollView>
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
  image: {
    height: 250,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(1, 48, 37, 0.8)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    flex: 1,
  },
  content: {
    padding: 20,
    marginTop: -20,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(172, 137, 1, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  rating: {
    ...typography.bodySmall,
    color: colors.accent,
    marginLeft: 6,
    fontWeight: "600",
  },
  name: {
    color: colors.text,
    marginBottom: 8,
  },
  type: {
    color: colors.muted,
    marginBottom: 16,
  },
  description: {
    color: colors.text,
    marginBottom: 24,
    lineHeight: 22,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoText: {
    marginLeft: 12,
    color: colors.text,
    flex: 1,
  },
  actionContainer: {
    marginTop: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: colors.text,
    textAlign: "center",
  },
});