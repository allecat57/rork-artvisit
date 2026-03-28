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
    Analytics.logScreenView("VisitHistory");
  }, []);
  
  const handleVisitPress = (venueId: string) => {
    try {
      router.push(`/venue/${venueId}`);
      
      Analytics.logEvent("visit_history_item_press", {
        venue_id: venueId
      });
    } catch (error) {
      console.error("Error navigating to venue:", error);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "Date not available";
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString(undefined, { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
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
  
  const renderVisitItem = ({ item }: { item: any }) => {
    if (!item || !item.venueId) {
      return (
        <View style={styles.visitCard}>
          <Text style={styles.errorText}>Invalid visit record</Text>
        </View>
      );
    }

    const venue = getVenueById(item.venueId);
    if (!venue) {
      return (
        <View style={styles.visitCard}>
          <Text style={styles.errorText}>Venue not found</Text>
          <Text style={styles.errorSubtext}>This venue may have been removed</Text>
        </View>
      );
    }
    
    return (
      <TouchableOpacity 
        style={styles.visitCard}
        onPress={() => handleVisitPress(item.venueId)}
        activeOpacity={0.7}
      >
        <View style={styles.visitHeader}>
          <Text style={styles.venueName} numberOfLines={2}>{venue.name}</Text>
          <Text style={styles.visitDate}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.visitDetails}>
          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.textMuted} style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={1}>{venue.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Calendar size={16} color={colors.textMuted} style={styles.detailIcon} />
            <Text style={styles.detailText}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={16} color={colors.textMuted} style={styles.detailIcon} />
            <Text style={styles.detailText}>{item.time || "Time not specified"}</Text>
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
  };
  
  // Sort visits by date (newest first)
  const sortedVisitHistory = [...visitHistory].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Visit History" }} />
      
      <FlatList
        data={sortedVisitHistory}
        keyExtractor={(item, index) => item.id || `visit-${index}`}
        renderItem={renderVisitItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          visitHistory.length > 0 ? (
            <Text style={[typography.heading1, styles.title]}>Your Visit History</Text>
          ) : null
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
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
  title: {
    marginBottom: 20,
    color: colors.text,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  visitCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  visitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  venueName: {
    ...typography.heading4,
    flex: 1,
    marginRight: 8,
    color: colors.text,
  },
  visitDate: {
    ...typography.bodySmall,
    color: colors.textMuted,
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
    color: colors.text,
    flex: 1,
  },
  notesContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  notesLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.text,
  },
  notesText: {
    ...typography.body,
    color: colors.text,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: "center",
    fontWeight: "600",
  },
  errorSubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
  separator: {
    height: 12,
  },
});