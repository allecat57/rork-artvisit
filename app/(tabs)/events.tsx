import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import colors from "@/constants/colors";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import { useEventsStore } from "@/store/useEventsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { Event } from "@/types/event";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

export default function EventsScreen() {
  const { 
    allEvents, 
    loading, 
    fetchEvents
  } = useEventsStore();
  
  const { user } = useAuthStore();
  const { getCurrentProfile } = useProfileStore();
  
  const [searchQuery, setSearchQuery] = useState("");

  // Get subscription level from profile to prevent re-renders
  const subscriptionLevel = useMemo(() => {
    const profile = getCurrentProfile();
    return profile?.subscription?.name?.toLowerCase() || 'free';
  }, [getCurrentProfile]);
  
  // Memoize accessible events to prevent infinite re-renders
  const accessibleEvents = useMemo(() => {
    // Filter events based on subscription level
    return allEvents.filter(event => {
      if (subscriptionLevel === 'collector') {
        return true; // Collector can see all events
      } else if (subscriptionLevel === 'essential') {
        return event.accessLevel === 'free' || event.accessLevel === 'essential';
      } else {
        return event.accessLevel === 'free';
      }
    });
  }, [allEvents, subscriptionLevel]);

  // Memoize filtered events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return accessibleEvents;
    }
    
    return accessibleEvents.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.tags && event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  }, [searchQuery, accessibleEvents]);

  // Fetch events only once on mount
  useEffect(() => {
    console.log("EventsScreen: Component mounted, fetching events...");
    fetchEvents();
  }, []); // Remove fetchEvents from dependencies to prevent loops

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <EventCard event={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No events found" : "No events available"}
      </Text>
      <Text style={styles.emptyDescription}>
        {searchQuery 
          ? `No events match "${searchQuery}". Try a different search term.`
          : "Check back later for upcoming art events, or upgrade your subscription to access more events."
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        placeholder="Search events, venues, categories..."
        onChangeText={handleSearch}
        onClear={handleClearSearch}
        value={searchQuery}
      />
      
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {searchQuery 
            ? `${filteredEvents.length} results for "${searchQuery}"`
            : `${filteredEvents.length} upcoming events`
          }
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  resultsHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.background,
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
    marginBottom: 8,
    textAlign: "center",
    fontFamily,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});