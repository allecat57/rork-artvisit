import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Calendar, Filter } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import ReservationCard from "@/components/ReservationCard";
import ReservationModal from "@/components/ReservationModal";
import EmptyState from "@/components/EmptyState";
import { useVenueStore } from "@/store/useVenueStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Reservation, ReservationStatus } from "@/types/reservation";

export default function ReservationsScreen() {
  const router = useRouter();
  const { 
    getUserReservations, 
    cancelReservation, 
    updateReservation,
    venues
  } = useVenueStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const reservations = getUserReservations();
  
  // Filter reservations based on status
  const filteredReservations = React.useMemo(() => {
    if (filterStatus === "all") {
      return reservations;
    }
    return reservations.filter((reservation: Reservation) => reservation.status === filterStatus);
  }, [reservations, filterStatus]);
  
  // Sort reservations by date (upcoming first)
  const sortedReservations = React.useMemo(() => {
    return [...filteredReservations].sort((a, b) => {
      const dateA = new Date(a.date + " " + a.time);
      const dateB = new Date(b.date + " " + b.time);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredReservations]);
  
  const handleCancelReservation = (reservationId: string) => {
    Alert.alert(
      "Cancel Reservation",
      "Are you sure you want to cancel this reservation?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelReservation(reservationId);
          }
        }
      ]
    );
  };
  
  const handleEditReservation = (reservation: Reservation) => {
    // In a real app, you would open the edit modal with pre-filled data
    Alert.alert(
      "Edit Reservation",
      "Editing reservations is not implemented in this demo.",
      [{ text: "OK" }]
    );
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.screenTitle}>Reservations</Text>
        <Text style={styles.subtitle}>
          {reservations.length} {reservations.length === 1 ? "reservation" : "reservations"}
        </Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderFilters = () => (
    showFilters && (
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by Status</Text>
        <View style={styles.filterOptions}>
          {["all", "confirmed", "pending", "cancelled"].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterOption,
                filterStatus === status && styles.filterOptionActive
              ]}
              onPress={() => setFilterStatus(status as ReservationStatus | "all")}
            >
              <Text style={[
                styles.filterOptionText,
                filterStatus === status && styles.filterOptionTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  );
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Reservations</Text>
        </View>
        <View style={styles.loginPromptContainer}>
          <Calendar size={60} color={colors.muted} />
          <Text style={[typography.heading2, styles.loginPromptTitle]}>Sign In Required</Text>
          <Text style={[typography.body, styles.loginPromptMessage]}>
            Please sign in to view and manage your reservations.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {renderHeader()}
      {renderFilters()}
      
      {sortedReservations.length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} color={colors.muted} />}
          title={filterStatus === "all" ? "No reservations yet" : `No ${filterStatus} reservations`}
          message={filterStatus === "all" ? "Make your first reservation to get started" : `You have no ${filterStatus} reservations at this time.`}
          actionButton={{
            title: "Make Reservation",
            onPress: () => setModalVisible(true)
          }}
        />
      ) : (
        <FlatList
          data={sortedReservations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReservationCard
              reservation={item}
              onCancel={() => handleCancelReservation(item.id)}
              onEdit={() => handleEditReservation(item)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <ReservationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        venues={venues}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  screenTitle: {
    ...typography.heading1,
    color: colors.text,
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filtersTitle: {
    ...typography.bodySmall,
    color: colors.muted,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionActive: {
    backgroundColor: colors.accent,
  },
  filterOptionText: {
    ...typography.caption,
    color: colors.text,
  },
  filterOptionTextActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginPromptTitle: {
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  loginPromptMessage: {
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
  },
  loginButtonText: {
    ...typography.button,
    color: colors.primary,
    textAlign: 'center',
  },
});