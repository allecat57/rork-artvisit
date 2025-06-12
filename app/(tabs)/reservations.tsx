import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useVenueStore } from "@/store/useVenueStore";
import { useAuthStore } from "@/store/useAuthStore";
import ReservationCard from "@/components/ReservationCard";
import EmptyState from "@/components/EmptyState";
import ReservationModal from "@/components/ReservationModal";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Reservation } from "@/types/reservation";
import { Venue } from "@/types/venue";
import * as Analytics from "@/utils/analytics";
import Button from "@/components/Button";

export default function ReservationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { 
    getUserReservations, 
    getEventReservations, 
    getVenueById, 
    cancelReservation,
    fetchUserReservations
  } = useVenueStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [modifyingReservation, setModifyingReservation] = useState<Reservation | null>(null);
  const [modifyModalVisible, setModifyModalVisible] = useState(false);
  
  const venueReservations = getUserReservations();
  const eventReservations = getEventReservations();
  const allReservations = [...venueReservations, ...eventReservations];
  
  // Sort reservations by date (newest first)
  const sortedReservations = [...allReservations].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Log screen view
  useEffect(() => {
    // Log screen view with analytics
    Analytics.logScreenView("Reservations");
  }, []);
  
  // Fetch user reservations on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserReservations(user.id);
    }
  }, [user?.id]);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchUserReservations(user.id);
    }
    setRefreshing(false);
  };
  
  const handleReservationPress = (reservation: Reservation) => {
    if (!reservation) return;
    
    if (reservation.eventId) {
      // Navigate to event details
      router.push(`/event/${reservation.eventId}`);
    } else if (reservation.venueId) {
      // Navigate to venue details
      router.push(`/venue/${reservation.venueId}`);
    } else {
      // Handle case where neither eventId nor venueId is available
      Alert.alert("Error", "Cannot find details for this reservation.");
    }
    
    // Log analytics event
    Analytics.logEvent("reservation_card_press", {
      reservation_id: reservation.id,
      venue_id: reservation.venueId,
      event_id: reservation.eventId,
      type: reservation.eventId ? "event" : "venue"
    });
  };
  
  const handleCancelReservation = (reservation: Reservation) => {
    if (!reservation) return;
    
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes", 
          style: "destructive",
          onPress: () => {
            cancelReservation(reservation.id);
            
            // Log analytics event
            Analytics.logEvent("reservation_cancelled", {
              reservation_id: reservation.id,
              venue_id: reservation.venueId,
              event_id: reservation.eventId,
              type: reservation.eventId ? "event" : "venue"
            });
          }
        }
      ]
    );
  };
  
  const handleModifyReservation = (reservation: Reservation) => {
    if (!reservation) return;
    
    // Only allow modifying venue reservations, not event reservations
    if (reservation.eventId) {
      Alert.alert(
        "Cannot Modify Event Reservation",
        "Event reservations cannot be modified. Please cancel this reservation and make a new one if needed.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Check if venue exists before opening modify modal
    const venue = reservation.venueId ? getVenueById(reservation.venueId) : null;
    if (!venue) {
      Alert.alert(
        "Cannot Modify Reservation",
        "Venue information is not available. Please try again later.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setModifyingReservation(reservation);
    setModifyModalVisible(true);
    
    // Log analytics event
    Analytics.logEvent("modify_reservation_start", {
      reservation_id: reservation.id,
      venue_id: reservation.venueId
    });
  };
  
  const handleReservationUpdate = (venue: Venue, date: Date, timeSlot: string) => {
    if (!modifyingReservation) return;
    
    // Create updated reservation
    const updatedReservation = {
      ...modifyingReservation,
      date: date.toISOString(),
      time: timeSlot
    };
    
    // Update the reservation
    useVenueStore.getState().updateReservation(modifyingReservation.id, updatedReservation);
    
    // Close the modal
    setModifyModalVisible(false);
    setModifyingReservation(null);
    
    // Log analytics event
    Analytics.logEvent("reservation_modified", {
      reservation_id: modifyingReservation.id,
      venue_id: modifyingReservation.venueId,
      new_date: date.toISOString(),
      new_time: timeSlot
    });
  };
  
  const renderEmptyState = () => (
    <EmptyState
      iconName="Ticket"
      title="No Reservations Yet"
      message="You haven't made any reservations yet. Explore museums and events to book your next visit!"
      action={
        <Button
          title="Explore Venues"
          onPress={() => router.push("/(tabs)/explore")}
          variant="primary"
        />
      }
    />
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={[typography.heading1, styles.title]}>Your Reservations</Text>
      
      <FlatList
        data={sortedReservations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onPress={() => handleReservationPress(item)}
            onCancel={() => handleCancelReservation(item)}
            onModify={!item.eventId ? () => handleModifyReservation(item) : undefined}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      />
      
      {modifyingReservation && modifyingReservation.venueId && (
        <ReservationModal
          visible={modifyModalVisible}
          venue={getVenueById(modifyingReservation.venueId) || null}
          onClose={() => {
            setModifyModalVisible(false);
            setModifyingReservation(null);
          }}
          onReserve={handleReservationUpdate}
          isModifying={true}
          initialDate={new Date(modifyingReservation.date)}
          initialTimeSlot={modifyingReservation.time}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
});