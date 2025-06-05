import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Filter } from 'lucide-react-native';
import { useEventsStore } from '@/store/useEventsStore';
import { useAuthStore } from '@/store/useAuthStore';
import EventCard from '@/components/EventCard';
import SearchBar from '@/components/SearchBar';
import SubscriptionRequiredCard from '@/components/SubscriptionRequiredCard';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import * as Analytics from '@/utils/analytics';
import { Event, AccessLevel } from '@/types/event';

export default function EventsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { allEvents, isLoading, fetchEvents } = useEventsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Define user's access level - in a real app, this would come from the user object
  const userAccessLevel: AccessLevel = user?.subscription?.level as AccessLevel || AccessLevel.FREE;

  useEffect(() => {
    fetchEvents();
    
    // Log screen view
    Analytics.logScreenView('events', 'EventsScreen');
  }, []);

  const handleEventPress = (eventId: string, event: Event) => {
    // Check if user has access to this event
    if (hasAccessToEvent(event.accessLevel)) {
      router.push(`/event/${eventId}`);
      
      // Log event selection
      Analytics.logEvent('select_event', {
        event_id: eventId,
        event_title: event.title,
        event_type: event.type
      });
    } else {
      setShowSubscriptionModal(true);
      
      // Log subscription required
      Analytics.logEvent('subscription_required', {
        event_id: eventId,
        event_title: event.title,
        event_access_level: event.accessLevel,
        user_access_level: userAccessLevel
      });
    }
  };

  // Convert events to proper Event type with featured property
  const formattedEvents: Event[] = allEvents.map(event => ({
    ...event,
    featured: event.featured || event.isFeatured || false // Map isFeatured to featured
  }));

  // Filter events based on search query and selected filter
  const filteredEvents = formattedEvents.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !selectedFilter || event.type === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Get featured events
  const featuredEvents = formattedEvents.filter(event => event.featured);

  // Get upcoming events (next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);
  
  const upcomingEvents = formattedEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= now && eventDate <= nextWeek;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Check if user has access to an event based on access level
  const hasAccessToEvent = (eventAccessLevel: AccessLevel): boolean => {
    const accessLevels = Object.values(AccessLevel);
    const userLevelIndex = accessLevels.indexOf(userAccessLevel);
    const eventLevelIndex = accessLevels.indexOf(eventAccessLevel);
    
    return userLevelIndex >= eventLevelIndex;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Log search
    if (query.trim()) {
      Analytics.logEvent('search_events', {
        search_term: query
      });
    }
  };

  const handleFilterPress = (filter: string) => {
    setSelectedFilter(selectedFilter === filter ? null : filter);
    
    // Log filter selection
    Analytics.logEvent('filter_events', {
      filter: filter,
      active: selectedFilter !== filter
    });
  };

  const filters = [
    { id: 'exhibition_opening', label: 'Openings' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'artist_talk', label: 'Talks' },
    { id: 'curator_tour', label: 'Tours' },
    { id: 'family_event', label: 'Family' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Calendar size={20} color={colors.primary.accent} />
          </TouchableOpacity>
        </View>

        <SearchBar
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchBar}
        />

        <View style={styles.filtersContainer}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => handleFilterPress(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {featuredEvents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <FlatList
              data={featuredEvents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EventCard
                  event={item}
                  onPress={() => handleEventPress(item.id, item)}
                  hasAccess={hasAccessToEvent(item.accessLevel)}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsContainer}
            />
          </>
        )}

        {upcomingEvents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Upcoming This Week</Text>
            <View style={styles.upcomingEventsContainer}>
              {upcomingEvents.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => handleEventPress(event.id, event)}
                  hasAccess={hasAccessToEvent(event.accessLevel)}
                  compact
                />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>All Events</Text>
        <View style={styles.allEventsContainer}>
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event.id, event)}
              hasAccess={hasAccessToEvent(event.accessLevel)}
            />
          ))}
        </View>

        <View style={styles.subscriptionContainer}>
          <Text style={styles.subscriptionTitle}>Unlock Premium Events</Text>
          <Text style={styles.subscriptionDescription}>
            Upgrade to Explorer or Collector to access exclusive events, private views, and more.
          </Text>
          <TouchableOpacity 
            style={styles.subscriptionButton}
            onPress={() => {
              // Log subscription interest
              Analytics.logEvent('view_subscription_plans', {
                source: 'events_screen'
              });
              
              // Navigate to subscription page
              router.push('/subscription');
            }}
          >
            <Text style={styles.subscriptionButtonText}>View Membership Options</Text>
          </TouchableOpacity>
        </View>

        {showSubscriptionModal && (
          <SubscriptionRequiredCard
            onClose={() => setShowSubscriptionModal(false)}
            onUpgrade={() => {
              setShowSubscriptionModal(false);
              router.push('/subscription');
            }}
            requiredLevel={AccessLevel.EXPLORER}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: {
    ...typography.heading1,
    color: colors.primary.text,
  },
  calendarButton: {
    backgroundColor: colors.primary.card,
    padding: 10,
    borderRadius: 20,
  },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary.card,
  },
  filterButtonActive: {
    backgroundColor: colors.primary.accent,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.primary.text,
  },
  filterTextActive: {
    color: colors.primary.background,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.primary.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  eventsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  upcomingEventsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  allEventsContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  subscriptionContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary.accent,
  },
  subscriptionTitle: {
    ...typography.heading3,
    color: colors.primary.text,
    marginBottom: 8,
  },
  subscriptionDescription: {
    ...typography.body,
    color: colors.primary.muted,
    marginBottom: 16,
  },
  subscriptionButton: {
    backgroundColor: colors.primary.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  subscriptionButtonText: {
    ...typography.buttonText,
    color: colors.primary.background,
    fontWeight: '600',
  },
});