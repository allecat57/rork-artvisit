import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Tag, 
  Share2, 
  ArrowLeft,
  Crown,
  Star,
  Ticket,
  Heart,
  HeartOff,
  UserCheck,
  UserMinus,
  Bell
} from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useEventsStore } from "@/store/useEventsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import * as Analytics from "@/utils/analytics";
import * as CalendarAPI from "expo-calendar";
import { formatDate, formatTime } from "@/utils/date";
import Button from "@/components/Button";
import EventRegistrationModal from "@/components/EventRegistrationModal";
import { supabase, isSupabaseConfigured, TABLES } from "@/config/supabase";
import { Event } from "@/types/event";

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const eventId = params.id as string;
  const router = useRouter();

  const { getEventById, isUserRegisteredForEvent, registerForEvent, cancelRegistration } = useEventsStore();
  const { user } = useAuthStore();
  const { getCurrentProfile } = useProfileStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  
  const [event, setEvent] = useState(getEventById(eventId));
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState(false);
  const [remainingSpots, setRemainingSpots] = useState(event?.remainingSpots || 0);

  const currentProfile = getCurrentProfile();

  // Fetch event from Supabase if configured
  useEffect(() => {
    const fetchEventFromSupabase = async () => {
      if (!isSupabaseConfigured()) return;
      
      try {
        const { data, error } = await supabase
          .from(TABLES.EVENTS)
          .select('*')
          .eq('id', eventId)
          .single();
        
        if (error) {
          console.error("Error fetching event from Supabase:", error.message || error);
          return;
        }
        
        if (data) {
          // Convert Supabase data to our format
          const fetchedEvent: Event = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            image: data.image_url || '',
            date: data.events_date, // Use events_date from Supabase
            endDate: data.end_date || data.events_date,
            location: data.location,
            price: data.price,
            capacity: data.capacity,
            remainingSpots: data.remaining_spots,
            accessLevel: data.access_level,
            featured: data.is_featured || false,
            tags: data.tags || [],
            type: data.type
          };
          
          setEvent(fetchedEvent);
          setRemainingSpots(fetchedEvent.remainingSpots);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error in fetchEventFromSupabase:", errorMessage);
      }
    };
    
    // If Supabase is configured, fetch the event
    if (isSupabaseConfigured()) {
      fetchEventFromSupabase();
    }
  }, [eventId]);

  useEffect(() => {
    // Check if event is favorited
    if (event) {
      const favorited = isFavorite("event", event.id);
      setIsFavorited(favorited);
    }
    
    // Check if user is registered for this event
    const checkRegistration = async () => {
      if (!user || !event) return;
      
      try {
        // If Supabase is configured, check registration in Supabase
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase
            .from(TABLES.EVENT_REGISTRATIONS)
            .select('*')
            .eq('user_id', user.id)
            .eq('event_id', eventId);
          
          if (error) {
            console.error("Error checking registration in Supabase:", error.message || error);
          }
          
          setIsRegistered(data && data.length > 0);
        } else {
          const isUserRegistered = isUserRegisteredForEvent(eventId, user.id);
          setIsRegistered(isUserRegistered);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error checking registration:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRegistration();
    
    // Log view event
    if (event) {
      Analytics.logEvent("view_event", {
        event_id: event.id,
        event_title: event.title,
        event_type: event.type
      });
    }
  }, [eventId, user, event]);

  const handleRegister = () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to register for this event.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/login") }
        ]
      );
      return;
    }
    
    if (isRegistered) {
      // Unregister flow
      Alert.alert(
        "Cancel Registration",
        "Are you sure you want to cancel your registration for this event?",
        [
          { text: "No", style: "cancel" },
          { 
            text: "Yes", 
            style: "destructive",
            onPress: async () => {
              try {
                // If Supabase is configured, delete registration from Supabase
                if (isSupabaseConfigured()) {
                  const { error } = await supabase
                    .from(TABLES.EVENT_REGISTRATIONS)
                    .delete()
                    .eq('user_id', user.id)
                    .eq('event_id', eventId);
                  
                  if (error) {
                    console.error("Error cancelling registration in Supabase:", error.message || error);
                    Alert.alert("Error", "Failed to cancel registration. Please try again.");
                    return;
                  }
                  
                  // Update event remaining spots in Supabase
                  if (event) {
                    const { error: updateError } = await supabase
                      .from(TABLES.EVENTS)
                      .update({ remaining_spots: event.remainingSpots + 1 })
                      .eq('id', eventId);
                    
                    if (updateError) {
                      console.error("Error updating event spots in Supabase:", updateError.message || updateError);
                    } else {
                      setRemainingSpots(prev => prev + 1);
                    }
                  }
                  
                  setIsRegistered(false);
                  Alert.alert("Success", "Your registration has been cancelled.");
                } else {
                  const success = cancelRegistration(eventId, user.id);
                  
                  if (success) {
                    setIsRegistered(false);
                    Alert.alert("Success", "Your registration has been cancelled.");
                  } else {
                    Alert.alert("Error", "Failed to cancel registration. Please try again.");
                  }
                }
                
                // Log analytics event
                Analytics.logEvent("cancel_event_registration", {
                  event_id: eventId,
                  event_title: event?.title
                });
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error("Error cancelling registration:", errorMessage);
                Alert.alert("Error", "Something went wrong. Please try again later.");
              }
            }
          }
        ]
      );
    } else {
      // Register flow
      if (remainingSpots === 0) {
        Alert.alert(
          "Event Full",
          "This event is fully booked. Would you like to join the waitlist?",
          [
            { text: "No", style: "cancel" },
            { text: "Yes", onPress: handleWaitlist }
          ]
        );
        return;
      }
      
      // Show registration modal
      setRegistrationModalVisible(true);
    }
  };

  const handleWaitlist = async () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to join the waitlist.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/login") }
        ]
      );
      return;
    }
    
    try {
      // If Supabase is configured, add to waitlist in Supabase
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('event_waitlists')
          .insert([
            {
              event_id: eventId,
              user_id: user.id,
              created_at: new Date().toISOString()
            }
          ]);
        
        if (error) {
          console.error("Error joining waitlist in Supabase:", error.message || error);
          Alert.alert("Error", "Unable to join waitlist. Try again later.");
          return;
        }
      }
      
      setWaitlistStatus(true);
      Alert.alert(
        "Added to Waitlist",
        "You'll be notified if a spot opens up."
      );
      
      // Log analytics event
      Analytics.logEvent("join_waitlist", {
        event_id: eventId,
        event_title: event?.title
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error joining waitlist:", errorMessage);
      Alert.alert("Error", "Unable to join waitlist. Try again later.");
    }
  };

  const addToCalendar = async () => {
    if (!event) return;
    
    try {
      // Request calendar permissions
      const { status } = await CalendarAPI.requestCalendarPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Calendar permission is needed to add this event.");
        return;
      }
      
      // Get available calendars
      const calendars = await CalendarAPI.getCalendarsAsync(CalendarAPI.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(cal => cal.allowsModifications);
      
      if (!defaultCalendar) {
        Alert.alert("No Calendar", "No modifiable calendar found on your device.");
        return;
      }
      
      // Create calendar event
      await CalendarAPI.createEventAsync(defaultCalendar.id, {
        title: event.title,
        location: event.location,
        startDate: new Date(event.date),
        endDate: new Date(event.endDate),
        timeZone: 'UTC',
        notes: event.description,
      });
      
      Alert.alert("Added to Calendar", "This event has been added to your calendar.");
      
      // Log analytics event
      Analytics.logEvent("add_to_calendar", {
        event_id: event.id,
        event_title: event.title
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Calendar error:", errorMessage);
      Alert.alert("Calendar Error", "Failed to add event to calendar.");
    }
  };

  const handleShare = async () => {
    if (!event) return;
    
    try {
      const result = await Share.share({
        message: `Check out this event: ${event.title} at ${event.location} on ${formatDate(event.date)}.`,
        url: Platform.OS === 'web' ? `https://timeframe.app/event/${event.id}` : undefined,
        title: event.title,
      });
      
      if (result.action === Share.sharedAction) {
        // Log analytics event
        Analytics.logEvent("share_event", {
          event_id: event.id,
          event_title: event.title,
          share_method: result.activityType || "unknown"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error sharing event:", errorMessage);
      Alert.alert("Share Error", "Failed to share this event.");
    }
  };

  const toggleFavorite = async () => {
    if (!event || !user) return;
    
    try {
      if (isFavorited) {
        // If Supabase is configured, remove favorite from Supabase
        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from(TABLES.FAVORITES)
            .delete()
            .eq('user_id', user.id)
            .eq('item_id', event.id)
            .eq('item_type', 'event');
          
          if (error) {
            console.error("Error removing favorite from Supabase:", error.message || error);
          }
        }
        
        removeFavorite("event", event.id);
        setIsFavorited(false);
        
        // Log analytics event
        Analytics.logEvent("unfavorite_event", {
          event_id: event.id,
          event_title: event.title
        });
      } else {
        // If Supabase is configured, add favorite to Supabase
        if (isSupabaseConfigured()) {
          const { error } = await supabase
            .from(TABLES.FAVORITES)
            .insert([
              {
                user_id: user.id,
                item_id: event.id,
                item_type: 'event',
                item_data: {
                  title: event.title,
                  image: event.image,
                  date: event.date,
                  type: "event"
                },
                created_at: new Date().toISOString()
              }
            ]);
          
          if (error) {
            console.error("Error adding favorite to Supabase:", error.message || error);
          }
        }
        
        addFavorite("event", event.id, {
          title: event.title,
          image: event.image,
          date: event.date,
          type: "event"
        });
        setIsFavorited(true);
        
        // Log analytics event
        Analytics.logEvent("favorite_event", {
          event_id: event.id,
          event_title: event.title
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error toggling favorite:", errorMessage);
      Alert.alert("Error", "Failed to update favorite status.");
    }
  };

  if (isLoading || !event) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Event Details",
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={toggleFavorite} style={styles.headerButton}>
                {isFavorited ? (
                  <Heart size={24} color={colors.status.error} fill={colors.status.error} />
                ) : (
                  <Heart size={24} color={colors.text} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                <Share2 size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.image }}
            style={styles.image}
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
          />
          {imageLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          )}
        </View>
        
        <View style={styles.content}>
          <Text style={[typography.heading2, styles.title]}>
            {event.title}
          </Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={colors.accent} style={styles.infoIcon} />
              <Text style={styles.infoText}>{formatDate(event.date)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={20} color={colors.accent} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                {formatTime(event.date)} - {formatTime(event.endDate)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <MapPin size={20} color={colors.accent} style={styles.infoIcon} />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Users size={20} color={colors.accent} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                {remainingSpots} {remainingSpots === 1 ? "spot" : "spots"} remaining out of {event.capacity}
              </Text>
            </View>
          </View>
          
          <View style={styles.badgesContainer}>
            {/* Access Level Badge */}
            <View style={[
              styles.badge,
              { backgroundColor: event.accessLevel === "collector" ? "#9C27B0" : 
                               event.accessLevel === "explorer" ? "#FFD700" : 
                               event.accessLevel === "essential" ? colors.accent : 
                               colors.muted }
            ]}>
              {event.accessLevel === "collector" ? (
                <Crown size={16} color="#FFFFFF" />
              ) : event.accessLevel === "explorer" ? (
                <Star size={16} color="#FFFFFF" />
              ) : (
                <Ticket size={16} color="#FFFFFF" />
              )}
              <Text style={styles.badgeText}>
                {event.accessLevel.charAt(0).toUpperCase() + event.accessLevel.slice(1)}
              </Text>
            </View>
            
            {/* Price Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {event.price === 0 ? "Free" : `$${event.price.toFixed(2)}`}
              </Text>
            </View>
            
            {/* Registration Status Badge */}
            {isRegistered && (
              <View style={[styles.badge, { backgroundColor: colors.status.success }]}>
                <UserCheck size={16} color="#FFFFFF" />
                <Text style={styles.badgeText}>Registered</Text>
              </View>
            )}
            
            {/* Waitlist Badge */}
            {waitlistStatus && (
              <View style={[styles.badge, { backgroundColor: colors.status.warning }]}>
                <Bell size={16} color="#FFFFFF" />
                <Text style={styles.badgeText}>On Waitlist</Text>
              </View>
            )}
          </View>
          
          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Tag size={16} color={colors.muted} style={styles.tagIcon} />
              <Text style={styles.tagsText}>
                {event.tags.join(", ")}
              </Text>
            </View>
          )}
          
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={typography.heading4}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title={isRegistered ? "Cancel Registration" : remainingSpots > 0 ? "Register Now" : "Join Waitlist"}
              onPress={handleRegister}
              variant={isRegistered ? "outline" : "primary"}
              icon={isRegistered ? <UserMinus size={20} color={colors.text} /> : null}
              style={styles.registerButton}
            />
            
            <Button
              title="Add to Calendar"
              onPress={addToCalendar}
              variant="secondary"
              icon={<Calendar size={20} color={colors.text} />}
              style={styles.calendarButton}
            />
          </View>
        </View>
      </ScrollView>
      
      <EventRegistrationModal
        visible={registrationModalVisible}
        onClose={() => setRegistrationModalVisible(false)}
        event={event}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 250,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    ...typography.body,
    color: colors.text,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    ...typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tagIcon: {
    marginRight: 8,
  },
  tagsText: {
    ...typography.bodySmall,
    color: colors.muted,
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    ...typography.body,
    color: colors.text,
    marginTop: 8,
    lineHeight: 22,
  },
  actionButtons: {
    marginBottom: 24,
  },
  registerButton: {
    marginBottom: 12,
  },
  calendarButton: {
    marginBottom: 12,
  },
});