import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { Calendar, MapPin, Clock, Users, ChevronRight } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useReservationStore } from "@/store/useReservationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useVenueStore } from "@/store/useVenueStore";
import { Reservation } from "@/types/reservation";
import { formatDate, formatTime } from "@/utils/date";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

interface ReservationCardProps {
  reservation: Reservation;
  onPress: () => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onPress }) => {
  const { getVenueById } = useVenueStore();
  const venue = getVenueById(reservation.venueId);
  
  const reservationDate = new Date(reservation.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reservationDate.setHours(0, 0, 0, 0);
  
  const isPast = reservationDate < today;
  const isToday = reservationDate.getTime() === today.getTime();
  
  if (!venue) {
    return (
      <View style={styles.reservationCard}>
        <Text style={styles.errorText}>Venue not found</Text>
        <Text style={styles.errorSubtext}>This venue may have been removed</Text>
      </View>
    );
  }
  
  return (
    <TouchableOpacity style={styles.reservationCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName} numberOfLines={2}>{venue.name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>{venue.location}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          isPast ? styles.pastBadge : isToday ? styles.todayBadge : styles.upcomingBadge
        ]}>
          <Text style={[
            styles.statusText,
            isPast ? styles.pastText : isToday ? styles.todayText : styles.upcomingText
          ]}>
            {isPast ? "Past" : isToday ? "Today" : "Upcoming"}
          </Text>
        </View>
      </View>
      
      <View style={styles.reservationDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={colors.accent} />
          <Text style={styles.detailText}>
            {formatDate(reservation.date)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={colors.accent} />
          <Text style={styles.detailText}>
            {reservation.time || "Time not specified"}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Users size={16} color={colors.accent} />
          <Text style={styles.detailText}>
            {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.confirmationCode}>
          Confirmation: {reservation.confirmationCode}
        </Text>
        <ChevronRight size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

export default function ReservationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { reservations, isLoading, fetchReservations } = useReservationStore();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (user) {
      fetchReservations(user.id);
    }
  }, [user, fetchReservations]);

  const filteredReservations = reservations.filter(reservation => {
    if (!reservation || !reservation.date) return false;
    
    const reservationDate = new Date(reservation.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reservationDate.setHours(0, 0, 0, 0);
    
    if (filter === "upcoming") {
      return reservationDate >= today;
    } else if (filter === "past") {
      return reservationDate < today;
    }
    return true;
  });

  // Sort reservations by date (upcoming first for upcoming/all, newest first for past)
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    if (filter === "past") {
      return dateB - dateA; // Newest first for past
    }
    return dateA - dateB; // Oldest first for upcoming/all
  });

  const handleReservationPress = (reservation: Reservation) => {
    try {
      router.push(`/venue/${reservation.venueId}`);
    } catch (error) {
      console.error("Error navigating to venue:", error);
    }
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <ReservationCard
      reservation={item}
      onPress={() => handleReservationPress(item)}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      iconName="Calendar"
      title={
        filter === "upcoming" 
          ? "No Upcoming Reservations" 
          : filter === "past" 
          ? "No Past Reservations"
          : "No Reservations"
      }
      message={
        filter === "upcoming" 
          ? "You don't have any upcoming reservations. Explore venues to make a booking."
          : filter === "past"
          ? "You haven't completed any visits yet. Your past reservations will appear here."
          : "You haven't made any reservations yet. Explore venues to make your first booking."
      }
      action={
        filter !== "past" ? (
          <Button
            title="Explore Venues"
            onPress={() => router.push("/(tabs)/explore")}
            variant="primary"
          />
        ) : undefined
      }
    />
  );

  const renderFilterButton = (filterType: "all" | "upcoming" | "past", title: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterType)}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.activeFilterButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "My Reservations" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading reservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "My Reservations" }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Reservations</Text>
        <Text style={styles.subtitle}>
          {reservations.length} {reservations.length === 1 ? "reservation" : "reservations"}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton("all", "All")}
        {renderFilterButton("upcoming", "Upcoming")}
        {renderFilterButton("past", "Past")}
      </View>

      <FlatList
        data={sortedReservations}
        keyExtractor={(item, index) => item.id || `reservation-${index}`}
        renderItem={renderReservation}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    fontFamily,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "transparent",
  },
  activeFilterButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  activeFilterButtonText: {
    color: colors.background,
  },
  listContainer: {
    padding: 24,
    paddingTop: 8,
    flexGrow: 1,
  },
  reservationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  venueInfo: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    fontFamily,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  upcomingBadge: {
    backgroundColor: colors.success + "20",
  },
  todayBadge: {
    backgroundColor: colors.accent + "20",
  },
  pastBadge: {
    backgroundColor: colors.textSecondary + "20",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  upcomingText: {
    color: colors.success,
  },
  todayText: {
    color: colors.accent,
  },
  pastText: {
    color: colors.textSecondary,
  },
  reservationDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmationCode: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
    padding: 16,
    fontWeight: "600",
  },
  errorSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
});