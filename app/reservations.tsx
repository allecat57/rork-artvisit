import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Plus } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useReservationStore } from "@/store/useReservationStore";
import { useVenueStore } from "@/store/useVenueStore";
import ReservationCard from "@/components/ReservationCard";
import EmptyState from "@/components/EmptyState";
import ReservationModal from "@/components/ReservationModal";
import { Reservation, ReservationStatus } from "@/types/reservation";
import { venues } from "@/mocks/venues";
import * as Analytics from "@/utils/analytics";

export default function ReservationsScreen() {
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past'>('upcoming');
  
  const { 
    getUpcomingReservations, 
    getPastReservations, 
    cancelReservation 
  } = useReservationStore();
  
  const upcomingReservations = getUpcomingReservations();
  const pastReservations = getPastReservations();
  
  const currentReservations = selectedTab === 'upcoming' ? upcomingReservations : pastReservations;

  const handleCancelReservation = (reservation: Reservation) => {
    Alert.alert(
      "Cancel Reservation",
      `Are you sure you want to cancel your reservation at ${reservation.venueId}?`,
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => {
            cancelReservation(reservation.id);
            Analytics.logEvent("reservation_cancelled_from_list", {
              reservation_id: reservation.id,
              venue_id: reservation.venueId
            });
          }
        }
      ]
    );
  };

  const handleEditReservation = (reservation: Reservation) => {
    // For now, we'll just show an alert. In a real app, you'd navigate to an edit screen
    Alert.alert(
      "Edit Reservation",
      "Editing reservations is not yet implemented. Please contact support for changes.",
      [{ text: "OK" }]
    );
  };

  const renderTabButton = (tab: 'upcoming' | 'past', title: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === tab && styles.activeTabButton
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        selectedTab === tab && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.heading1, styles.title]}>My Reservations</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowReservationModal(true)}
        >
          <Plus size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('upcoming', 'Upcoming')}
        {renderTabButton('past', 'Past')}
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentReservations.length > 0 ? (
          currentReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onCancel={() => handleCancelReservation(reservation)}
              onEdit={() => handleEditReservation(reservation)}
            />
          ))
        ) : (
          <EmptyState
            icon={<Calendar size={64} color={colors.muted} />}
            title={selectedTab === 'upcoming' ? "No Upcoming Reservations" : "No Past Reservations"}
            message={
              selectedTab === 'upcoming' 
                ? "You don't have any upcoming reservations. Book a venue to get started!"
                : "You haven't completed any reservations yet."
            }
            actionButton={{
              title: "Make a Reservation",
              onPress: () => setShowReservationModal(true)
            }}
          />
        )}
      </ScrollView>

      <ReservationModal
        visible={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        venues={venues}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.accent,
  },
  tabButtonText: {
    ...typography.body,
    color: colors.muted,
    fontWeight: "500",
  },
  activeTabButtonText: {
    color: colors.background,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});