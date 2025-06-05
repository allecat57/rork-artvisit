import React, { useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useVisitHistoryStore } from "@/store/useVisitHistoryStore";
import { useVenueStore } from "@/store/useVenueStore";
import EmptyState from "@/components/EmptyState";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import { MapPin, Calendar, Clock } from "lucide-react-native";
import * as Analytics from "@/utils/analytics";

export default function VisitHistoryScreen() {
  const router = useRouter();
  const { visitHistory, removeVisit } = useVisitHistoryStore();
  const { getVenueById } = useVenueStore();
  
  // Log screen view
  useEffect(() => {
    // Log screen view with analytics
    Analytics.logScreenView("VisitHistory");
  }, []);
  
  const handleVisitPress = (venueId: string) => {
    router.push(`/venue/${venueId}`);
    
    // Log analytics event
    Analytics.logEvent("visit_history_item_press", {
      venue_id: venueId
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };
  
  const renderEmptyState = () => (
    <EmptyState
      iconName="Clock"
      title="No Visit History"
      message="You haven't visited any venues yet. Explore museums and make reservations to build your visit history."
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
      <Stack.Screen options={{ title: "Visit History" }} />
      
      <FlatList
        data={visitHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const venue = getVenueById(item.venueId);
          if (!venue) return null;
          
          return (
            <TouchableOpacity 
              style={styles.visitCard}
              onPress={() => handleVisitPress(item.venueId)}
              activeOpacity={0.7}
            >
              <View style={styles.visitHeader}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.visitDate}>{formatDate(item.date)}</Text>
              </View>
              
              <View style={styles.visitDetails}>
                <View style={styles.detailRow}>
                  <MapPin size={16} color={colors.primary.muted} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{venue.location}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Calendar size={16} color={colors.primary.muted} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{formatDate(item.date)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Clock size={16} color={colors.primary.muted} style={styles.detailIcon} />
                  <Text style={styles.detailText}>{item.time || "Not specified"}</Text>
                </View>
              </View>
              
              {item.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          visitHistory.length > 0 ? (
            <Text style={[typography.heading1, styles.title]}>Your Visit History</Text>
          ) : null
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  title: {
    marginBottom: 20,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  visitCard: {
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  venueName: {
    ...typography.heading4,
    flex: 1,
    marginRight: 8,
  },
  visitDate: {
    ...typography.bodySmall,
    color: colors.primary.muted,
  },
  visitDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    ...typography.body,
    color: colors.primary.text,
  },
  notesContainer: {
    backgroundColor: colors.primary.secondary,
    borderRadius: 8,
    padding: 12,
  },
  notesLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
  },
  notesText: {
    ...typography.body,
    color: colors.primary.text,
  },
});