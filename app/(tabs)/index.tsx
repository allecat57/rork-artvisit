import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Calendar, Package, MapPin, Clock, ChevronRight, Plus, Database } from "lucide-react-native";
import colors from "@/constants/colors";
import { useReservationStore } from "@/store/useReservationStore";
import { usePurchaseHistoryStore } from "@/store/usePurchaseHistoryStore";
import { getUpcomingEventsByAccessLevel } from "@/mocks/events";
import { AccessLevel } from "@/types/event";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onViewAll, showViewAll = true }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {showViewAll && onViewAll && (
      <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All</Text>
        <ChevronRight size={16} color={colors.accent} />
      </TouchableOpacity>
    )}
  </View>
);

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionText, onAction }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>{icon}</View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyDescription}>{description}</Text>
    {actionText && onAction && (
      <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
        <Plus size={16} color={colors.accent} />
        <Text style={styles.emptyActionText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const { getUpcomingReservations } = useReservationStore();
  const { getCurrentUserPurchases } = usePurchaseHistoryStore();

  const upcomingReservations = useMemo(() => {
    return getUpcomingReservations().slice(0, 3);
  }, [getUpcomingReservations]);

  const recentOrders = useMemo(() => {
    return getCurrentUserPurchases()
      .filter(purchase => purchase.status === 'processing' || purchase.status === 'shipped')
      .slice(0, 3);
  }, [getCurrentUserPurchases]);

  const nearbyEvents = useMemo(() => {
    return getUpcomingEventsByAccessLevel(AccessLevel.ESSENTIAL).slice(0, 3);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'processing': return colors.warning;
      case 'shipped': return colors.info;
      case 'delivered': return colors.success;
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Here&apos;s what&apos;s happening</Text>
          
          {/* Supabase Test Button */}
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/supabase-test')}
          >
            <Database size={16} color={colors.background} />
            <Text style={styles.testButtonText}>Test Supabase</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Reservations */}
        <View style={styles.section}>
          <SectionHeader 
            title="Upcoming Reservations" 
            onViewAll={() => router.push('/(tabs)/reservations')}
            showViewAll={upcomingReservations.length > 0}
          />
          {upcomingReservations.length > 0 ? (
            <View style={styles.cardContainer}>
              {upcomingReservations.map((reservation) => (
                <TouchableOpacity 
                  key={reservation.id} 
                  style={styles.card}
                  onPress={() => router.push('/(tabs)/reservations')}
                >
                  <View style={styles.cardIcon}>
                    <Calendar size={20} color={colors.accent} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Gallery Reservation</Text>
                    <Text style={styles.cardSubtitle}>
                      {formatDate(reservation.date)} • {reservation.partySize} guests
                    </Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(reservation.status) }]}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<Calendar size={32} color={colors.textSecondary} />}
              title="No Upcoming Reservations"
              description="Book a table at your favorite gallery or restaurant"
              actionText="Make Reservation"
              onAction={() => router.push('/(tabs)/explore')}
            />
          )}
        </View>

        {/* Artwork Delivery Orders */}
        <View style={styles.section}>
          <SectionHeader 
            title="Artwork Orders" 
            onViewAll={() => router.push('/purchase-history')}
            showViewAll={recentOrders.length > 0}
          />
          {recentOrders.length > 0 ? (
            <View style={styles.cardContainer}>
              {recentOrders.map((order) => (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.card}
                  onPress={() => router.push('/purchase-history')}
                >
                  <View style={styles.cardIcon}>
                    <Package size={20} color={colors.accent} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>Order #{order.id}</Text>
                    <Text style={styles.cardSubtitle}>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} • ${order.totalAmount}
                    </Text>
                    <View style={styles.cardMeta}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<Package size={32} color={colors.textSecondary} />}
              title="No Active Orders"
              description="Browse our collection and find your next piece"
              actionText="Shop Now"
              onAction={() => router.push('/(tabs)/shop')}
            />
          )}
        </View>

        {/* Nearby Gallery Events */}
        <View style={styles.section}>
          <SectionHeader 
            title="Events Near You" 
            onViewAll={() => router.push('/(tabs)/events')}
            showViewAll={nearbyEvents.length > 0}
          />
          {nearbyEvents.length > 0 ? (
            <View style={styles.cardContainer}>
              {nearbyEvents.map((event) => (
                <TouchableOpacity 
                  key={event.id} 
                  style={styles.card}
                  onPress={() => router.push(`/event/${event.id}`)}
                >
                  <View style={styles.cardIcon}>
                    <MapPin size={20} color={colors.accent} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{event.title}</Text>
                    <Text style={styles.cardSubtitle}>
                      {formatDate(event.date)} • {event.location}
                    </Text>
                    <View style={styles.cardMeta}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>${event.price}</Text>
                      </View>
                      <View style={styles.spotsContainer}>
                        <Clock size={12} color={colors.textSecondary} />
                        <Text style={styles.spotsText}>{event.remainingSpots} spots left</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={<MapPin size={32} color={colors.textSecondary} />}
              title="No Upcoming Events"
              description="Discover workshops, exhibitions, and talks near you"
              actionText="Browse Events"
              onAction={() => router.push('/(tabs)/events')}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    fontFamily,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600",
  },
  cardContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '15',
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  priceContainer: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  spotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  spotsText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    alignSelf: "flex-start",
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.background,
  },
});