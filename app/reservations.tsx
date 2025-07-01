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
import { useRouter } from "expo-router";
import { Calendar, MapPin, Clock, Users, ChevronRight } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useReservationStore } from "@/store/useReservationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Reservation } from "@/types/reservation";
import { formatDate, formatTime } from "@/utils/date";

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
  const isPast = new Date(reservation.date) < new Date();
  const isToday = formatDate(reservation.date) === formatDate(new Date().toISOString());
  
  return (
    <TouchableOpacity style={styles.reservationCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName}>{reservation.venueName}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.location}>{reservation.venueLocation}</Text>
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
            {reservation.time}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Users size={16} color={colors.accent} />
          <Text style={styles.detailText}>
            {reservation.guests} {reservation.guests === 1 ? "guest" : "guests"}
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
  const { reservations, loading, fetchReservations } = useReservationStore();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    if (user) {
      fetchReservations(user.id);
    }
  }, [user, fetchReservations]);

  const filteredReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filter === "upcoming") {
      return reservationDate >= today;
    } else if (filter === "past") {
      return reservationDate < today;
    }
    return true;
  });

  const handleReservationPress = (reservation: Reservation) => {
    // Navigate to venue details or reservation details
    router.push(`/venue/${reservation.venueId}`);
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <ReservationCard
      reservation={item}
      onPress={() => handleReservationPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Calendar size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>
        {filter === "upcoming" 
          ? "No Upcoming Reservations" 
          : filter === "past" 
          ? "No Past Reservations"
          : "No Reservations"
        }
      </Text>
      <Text style={styles.emptyDescription}>
        {filter === "upcoming" 
          ? "You don't have any upcoming reservations. Explore venues to make a booking."
          : filter === "past"
          ? "You haven't made any reservations yet."
          : "You haven't made any reservations yet. Explore venues to make your first booking."
        }
      </Text>
      {filter === "all" && (
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push("/(tabs)/explore")}
          activeOpacity={0.7}
        >
          <Text style={styles.exploreButtonText}>Explore Venues</Text>
        </TouchableOpacity>
      )}
    </View>
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading reservations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        data={filteredReservations}
        keyExtractor={(item) => item.id}
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    fontFamily,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.background,
  },
});