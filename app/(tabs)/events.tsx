import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import { useEventsStore } from "@/store/useEventsStore";
import { Event } from "@/types/event";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

export default function EventsScreen() {
  const { events, loading, fetchEvents } = useEventsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchQuery, events]);

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
          : "Check back later for upcoming art events."
        }
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        placeholder="Search events, venues, categories..."
        onSearch={handleSearch}
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