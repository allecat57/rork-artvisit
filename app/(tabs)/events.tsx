import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Filter, Calendar, Search } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEventsStore } from "@/store/useEventsStore";
import { useAuthStore } from "@/store/useAuthStore";
import EventCard from "@/components/EventCard";
import SubscriptionRequiredCard from "@/components/SubscriptionRequiredCard";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Event, AccessLevel } from "@/types/event";
import * as Analytics from "@/utils/analytics";

export default function EventsScreen() {
  const router = useRouter();
  const { allEvents, isLoading, fetchEvents, getAccessibleEvents, getFeaturedEvents, getUpcomingEvents } = useEventsStore();
  const { user } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showSubscriptionCard, setShowSubscriptionCard] = useState(false);
  
  // Get user's subscription level
  const userSubscriptionLevel = user?.subscription?.id as AccessLevel || AccessLevel.FREE;
  
  useEffect(() => {
    // Fetch events when component mounts
    fetchEvents();
    
    // Log analytics event
    Analytics.logEvent("view_events_screen", {
      user_id: user?.id || "guest",
      subscription_level: userSubscriptionLevel
    });
  }, []);
  
  // Filter events based on search query and filter type
  const filteredEvents = React.useMemo(() => {
    let events = getAccessibleEvents();
    
    // Apply search filter
    if (searchQuery) {
      events = events.filter((event: Event) => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.tags && event.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }
    
    // Apply type filter
    if (filterType) {
      events = events.filter((event: Event) => event.type === filterType);
    }
    
    return events;
  }, [searchQuery, filterType, allEvents, userSubscriptionLevel]);
  
  // Get unique event types for filter
  const eventTypes = React.useMemo(() => {
    const types = new Set<string>();
    allEvents.forEach((event: Event) => {
      if (event.type) {
        types.add(event.type);
      }
    });
    return Array.from(types);
  }, [allEvents]);
  
  // Handle event card press
  const handleEventPress = (event: Event) => {
    // Check if user has access to this event
    const hasAccess = userSubscriptionLevel >= event.accessLevel;
    
    if (hasAccess) {
      // Navigate to event details
      router.push(`/event/${event.id}`);
      
      // Log analytics event
      Analytics.logEvent("select_event", {
        event_id: event.id,
        event_title: event.title,
        event_type: event.type,
        user_id: user?.id || "guest"
      });
    } else {
      // Show subscription required card
      setShowSubscriptionCard(true);
      
      // Log analytics event
      Analytics.logEvent("subscription_required", {
        event_id: event.id,
        event_title: event.title,
        required_level: event.accessLevel,
        user_level: userSubscriptionLevel,
        user_id: user?.id || "guest"
      });
    }
  };
  
  // Handle subscription upgrade
  const handleUpgradeSubscription = () => {
    router.push("/profile");
    setShowSubscriptionCard(false);
  };
  
  // Render header with search and filters
  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        placeholder="Search events..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />
      
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Filter size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
  
  // Render filter options
  const renderFilters = () => (
    showFilters && (
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Event Type</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[
              styles.filterOption,
              filterType === null && styles.filterOptionActive
            ]}
            onPress={() => setFilterType(null)}
          >
            <Text style={[
              styles.filterOptionText,
              filterType === null && styles.filterOptionTextActive
            ]}>All</Text>
          </TouchableOpacity>
          
          {eventTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterOption,
                filterType === type && styles.filterOptionActive
              ]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[
                styles.filterOptionText,
                filterType === type && styles.filterOptionTextActive
              ]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  );
  
  // Render featured events section
  const renderFeaturedEvents = () => {
    const featuredEvents = getFeaturedEvents();
    
    if (featuredEvents.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.featuredContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Events</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={featuredEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard 
              event={item} 
              onPress={() => handleEventPress(item)}
              hasAccess={userSubscriptionLevel >= item.accessLevel}
            />
          )}
          contentContainerStyle={styles.featuredList}
        />
      </View>
    );
  };
  
  // Render upcoming events section
  const renderUpcomingEvents = () => {
    const upcomingEvents = getUpcomingEvents();
    
    if (upcomingEvents.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.upcomingContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Calendar size={18} color={colors.text} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={upcomingEvents.slice(0, 3)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard 
              key={item.id}
              event={item} 
              onPress={() => handleEventPress(item)}
              hasAccess={userSubscriptionLevel >= item.accessLevel}
              compact={true}
            />
          )}
          contentContainerStyle={styles.upcomingList}
        />
      </View>
    );
  };
  
  // Render all events section
  const renderAllEvents = () => (
    <View style={styles.allEventsContainer}>
      <Text style={styles.sectionTitle}>All Events</Text>
      
      {filteredEvents.length === 0 ? (
        <EmptyState
          icon={<Search size={40} color={colors.muted} />}
          title="No events found"
          message={searchQuery ? `No events matching "${searchQuery}"` : "There are no events available at this time."}
        />
      ) : (
        filteredEvents.map((event) => (
          <EventCard 
            key={event.id}
            event={event} 
            onPress={() => handleEventPress(event)}
            hasAccess={userSubscriptionLevel >= event.accessLevel}
          />
        ))
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ 
        title: "Events",
        headerTitleStyle: typography.heading3,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background }
      }} />
      
      {renderHeader()}
      {renderFilters()}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={[1]}
          renderItem={() => (
            <View style={styles.content}>
              {renderFeaturedEvents()}
              {renderUpcomingEvents()}
              {renderAllEvents()}
            </View>
          )}
          keyExtractor={() => "events-list"}
        />
      )}
      
      {showSubscriptionCard && (
        <SubscriptionRequiredCard
          requiredLevel={AccessLevel.EXPLORER}
          onUpgrade={handleUpgradeSubscription}
          onClose={() => setShowSubscriptionCard(false)}
        />
      )}
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.muted,
    marginTop: 12,
  },
  featuredContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.accent,
  },
  featuredList: {
    paddingRight: 16,
    gap: 16,
  },
  upcomingContainer: {
    marginBottom: 24,
  },
  upcomingList: {
    paddingRight: 16,
    gap: 12,
  },
  allEventsContainer: {
    marginBottom: 16,
  },
});