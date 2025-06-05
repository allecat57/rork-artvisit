import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Calendar, Filter, Crown, Star, Ticket, Zap } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useEventsStore } from "@/store/useEventsStore";
import { useProfileStore } from "@/store/useProfileStore";
import { AccessLevel, EventType } from "@/types/event";
import EventCard from "@/components/EventCard";
import SubscriptionRequiredCard from "@/components/SubscriptionRequiredCard";
import SubscriptionModal from "@/components/SubscriptionModal";
import EmptyState from "@/components/EmptyState";
import * as Analytics from "@/utils/analytics";

export default function EventsScreen() {
  const router = useRouter();
  const { getAccessibleEvents, getFeaturedEvents, getUpcomingEvents } = useEventsStore();
  const { getCurrentSubscription } = useProfileStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  
  const currentSubscription = getCurrentSubscription();
  const currentSubscriptionLevel = (currentSubscription?.id as AccessLevel) || AccessLevel.FREE;
  
  const accessibleEvents = getAccessibleEvents();
  const featuredEvents = getFeaturedEvents();
  const upcomingEvents = getUpcomingEvents();
  
  // Filter events by type if a type is selected
  const filteredEvents = selectedEventType
    ? (activeTab === "upcoming" ? upcomingEvents : accessibleEvents).filter(
        event => event.type === selectedEventType
      )
    : activeTab === "upcoming" ? upcomingEvents : accessibleEvents;
  
  // Get unique event types from accessible events
  const eventTypes = Array.from(
    new Set(accessibleEvents.map(event => event.type))
  ).sort();
  
  const onRefresh = async () => {
    setRefreshing(true);
    
    // In a real app, you would fetch fresh data here
    // For this demo, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
  };
  
  const handleTabChange = (tab: string) => {
    // Log analytics event
    Analytics.logEvent("events_tab_change", {
      previous_tab: activeTab,
      new_tab: tab
    });
    
    setActiveTab(tab);
  };
  
  const handleFilterByType = (type: EventType | null) => {
    // Log analytics event
    Analytics.logEvent("events_filter_change", {
      previous_filter: selectedEventType,
      new_filter: type
    });
    
    setSelectedEventType(type);
  };
  
  const getSubscriptionBadge = () => {
    if (!currentSubscription) return null;
    
    let color = "#E0E0E0";
    let icon = <Ticket size={16} color="#FFFFFF" />;
    
    if (currentSubscription.id === "free") {
      color = "#4CAF50";
      icon = <Zap size={16} color="#FFFFFF" />;
    } else if (currentSubscription.id === "explorer") {
      color = "#FFD700";
      icon = <Star size={16} color="#FFFFFF" />;
    } else if (currentSubscription.id === "collector") {
      color = "#9C27B0";
      icon = <Crown size={16} color="#FFFFFF" />;
    }
    
    return (
      <View style={[styles.subscriptionBadge, { backgroundColor: color }]}>
        {icon}
        <Text style={styles.subscriptionBadgeText}>{currentSubscription.name}</Text>
      </View>
    );
  };
  
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <Text style={[typography.heading2, styles.title]}>Events & Openings</Text>
        {getSubscriptionBadge()}
      </View>
      
      {currentSubscriptionLevel === AccessLevel.FREE ? (
        <SubscriptionRequiredCard
          requiredLevel={AccessLevel.ESSENTIAL}
          onUpgrade={() => setSubscriptionModalVisible(true)}
        />
      ) : (
        <>
          {featuredEvents.length > 0 && (
            <View style={styles.featuredSection}>
              <Text style={[typography.heading3, styles.sectionTitle]}>Featured Events</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredScrollContent}
              >
                {featuredEvents.map(event => (
                  <View key={event.id} style={styles.featuredEventContainer}>
                    <EventCard event={event} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
              onPress={() => handleTabChange("upcoming")}
            >
              <Calendar size={16} color={activeTab === "upcoming" ? colors.primary.accent : colors.primary.muted} />
              <Text style={[
                styles.tabText, 
                activeTab === "upcoming" && styles.activeTabText
              ]}>
                Upcoming
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === "all" && styles.activeTab]}
              onPress={() => handleTabChange("all")}
            >
              <Filter size={16} color={activeTab === "all" ? colors.primary.accent : colors.primary.muted} />
              <Text style={[
                styles.tabText, 
                activeTab === "all" && styles.activeTabText
              ]}>
                All Events
              </Text>
            </TouchableOpacity>
          </View>
          
          {eventTypes.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedEventType === null && styles.activeFilterChip
                ]}
                onPress={() => handleFilterByType(null)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedEventType === null && styles.activeFilterChipText
                ]}>
                  All Types
                </Text>
              </TouchableOpacity>
              
              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedEventType === type && styles.activeFilterChip
                  ]}
                  onPress={() => handleFilterByType(type)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedEventType === type && styles.activeFilterChipText
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </>
  );
  
  const renderEmptyState = () => {
    if (currentSubscriptionLevel === AccessLevel.FREE) {
      return null; // Already showing subscription required card
    }
    
    return (
      <EmptyState
        icon={<Calendar size={40} color={colors.primary.muted} />}
        title="No Events Found"
        description={
          selectedEventType
            ? `There are no ${selectedEventType} events available. Try selecting a different event type.`
            : "There are no events available at this time. Check back later for updates."
        }
        actionLabel={selectedEventType ? "Clear Filter" : undefined}
        onAction={selectedEventType ? () => handleFilterByType(null) : undefined}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {currentSubscriptionLevel === AccessLevel.FREE ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderHeader()}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      
      <SubscriptionModal
        visible={subscriptionModalVisible}
        onClose={() => setSubscriptionModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subscriptionBadgeText: {
    ...typography.bodySmall,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  featuredSection: {
    marginTop: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  featuredScrollContent: {
    paddingHorizontal: 8,
  },
  featuredEventContainer: {
    width: 300,
    marginHorizontal: 8,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: colors.primary.card,
  },
  activeTab: {
    backgroundColor: `${colors.primary.accent}20`,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.primary.muted,
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary.accent,
    fontWeight: "600",
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: colors.primary.card,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  activeFilterChip: {
    backgroundColor: colors.primary.secondary,
    borderColor: colors.primary.accent,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.primary.muted,
  },
  activeFilterChipText: {
    color: colors.primary.accent,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});