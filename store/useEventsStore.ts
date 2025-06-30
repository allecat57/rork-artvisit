import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event, EventRegistration, AccessLevel } from "@/types/event";
import { events, getEventsByAccessLevel, getFeaturedEventsByAccessLevel, getUpcomingEventsByAccessLevel } from "@/mocks/events";
import { useProfileStore } from "./useProfileStore";
import { generateConfirmationCode } from "@/utils/generateConfirmationCode";
import * as Analytics from "@/utils/analytics";
import { supabase, isSupabaseConfigured, TABLES } from "@/config/supabase";

interface EventsState {
  // Event data
  allEvents: Event[];
  registrations: EventRegistration[];
  isLoading: boolean;
  
  // Getters
  getEventById: (id: string) => Event | undefined;
  getAccessibleEvents: () => Event[];
  getFeaturedEvents: () => Event[];
  getUpcomingEvents: () => Event[];
  getUserRegistrations: () => EventRegistration[];
  isUserRegisteredForEvent: (eventId: string) => boolean;
  
  // Actions
  fetchEvents: () => Promise<void>;
  registerForEvent: (eventId: string, numberOfTickets: number) => EventRegistration | null;
  cancelRegistration: (eventId: string) => boolean;
}

// Helper to get current user's subscription level
const getCurrentSubscriptionLevel = (): AccessLevel | null => {
  const subscription = useProfileStore.getState().getCurrentSubscription();
  return (subscription?.id as AccessLevel) || null;
};

// Helper to get current user ID
const getCurrentUserId = (): string | null => {
  const user = useProfileStore.getState().getCurrentProfile();
  return user?.userId || null;
};

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      allEvents: events,
      registrations: [],
      isLoading: false,
      
      getEventById: (id: string) => {
        return get().allEvents.find(event => event.id === id);
      },
      
      getAccessibleEvents: () => {
        const subscriptionLevel = getCurrentSubscriptionLevel();
        if (!subscriptionLevel) {
          return []; // No subscription = no access to any events
        }
        return getEventsByAccessLevel(subscriptionLevel);
      },
      
      getFeaturedEvents: () => {
        const subscriptionLevel = getCurrentSubscriptionLevel();
        if (!subscriptionLevel) {
          return []; // No subscription = no access to any events
        }
        return getFeaturedEventsByAccessLevel(subscriptionLevel);
      },
      
      getUpcomingEvents: () => {
        const subscriptionLevel = getCurrentSubscriptionLevel();
        if (!subscriptionLevel) {
          return []; // No subscription = no access to any events
        }
        return getUpcomingEventsByAccessLevel(subscriptionLevel);
      },
      
      getUserRegistrations: () => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        // If Supabase is configured, fetch registrations from Supabase
        if (isSupabaseConfigured()) {
          // This would normally be an async operation, but for simplicity
          // we'll use the local cache and update it in the background
          supabase
            .from(TABLES.EVENT_REGISTRATIONS)
            .select('*')
            .eq('user_id', userId)
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching registrations from Supabase:", error);
                return;
              }
              
              if (data && data.length > 0) {
                // Convert Supabase data to our format
                const registrations: EventRegistration[] = data.map(item => ({
                  eventId: item.event_id,
                  userId: item.user_id,
                  registrationDate: item.registration_date,
                  numberOfTickets: item.number_of_tickets,
                  totalPrice: item.total_price,
                  confirmationCode: item.confirmation_code
                }));
                
                // Update the local cache with Supabase data
                set(state => ({
                  registrations: [
                    ...state.registrations.filter(reg => reg.userId !== userId),
                    ...registrations
                  ]
                }));
              }
            });
        }
        
        return get().registrations.filter(reg => reg.userId === userId);
      },
      
      isUserRegisteredForEvent: (eventId: string) => {
        const userId = getCurrentUserId();
        if (!userId) return false;
        
        // If Supabase is configured, check registration in Supabase
        if (isSupabaseConfigured()) {
          // This would normally be an async operation, but for simplicity
          // we'll use the local cache and update it in the background
          supabase
            .from(TABLES.EVENT_REGISTRATIONS)
            .select('*')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .then(({ data, error }) => {
              if (error) {
                console.error("Error checking registration in Supabase:", error);
                return;
              }
              
              if (data && data.length > 0) {
                // User is registered in Supabase, update local cache
                const registration: EventRegistration = {
                  eventId: data[0].event_id,
                  userId: data[0].user_id,
                  registrationDate: data[0].registration_date,
                  numberOfTickets: data[0].number_of_tickets,
                  totalPrice: data[0].total_price,
                  confirmationCode: data[0].confirmation_code
                };
                
                // Update the local cache with Supabase data
                set(state => {
                  // Check if registration already exists in local cache
                  const exists = state.registrations.some(
                    reg => reg.eventId === eventId && reg.userId === userId
                  );
                  
                  if (!exists) {
                    return {
                      registrations: [...state.registrations, registration]
                    };
                  }
                  
                  return state;
                });
              }
            });
        }
        
        return get().registrations.some(
          reg => reg.eventId === eventId && reg.userId === userId
        );
      },
      
      fetchEvents: async () => {
        set({ isLoading: true });
        
        try {
          // If Supabase is configured, fetch events from Supabase
          if (isSupabaseConfigured()) {
            const { data, error } = await supabase
              .from(TABLES.EVENTS)
              .select('*');
              
            if (error) {
              throw error;
            }
            
            if (data && data.length > 0) {
              // Convert Supabase data to our format
              const fetchedEvents: Event[] = data.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                image: item.image,
                date: item.date,
                endDate: item.end_date,
                location: item.location,
                price: item.price,
                capacity: item.capacity,
                remainingSpots: item.remaining_spots,
                accessLevel: item.access_level,
                featured: item.is_featured || false,
                tags: item.tags,
                type: item.type
              }));
              
              set({ allEvents: fetchedEvents, isLoading: false });
              
              // Log analytics event
              Analytics.logEvent("fetch_events", {
                count: fetchedEvents.length,
                source: "supabase"
              });
              
              return;
            }
          }
          
          // If Supabase is not configured or no events found, use mock data
          // For this demo, we'll just simulate a network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // We already have the events loaded from the mocks,
          // but in a real app you would set the fetched events here
          set({ isLoading: false });
          
          // Log analytics event
          Analytics.logEvent("fetch_events", {
            count: events.length,
            source: "mock"
          });
        } catch (error) {
          console.error("Error fetching events:", error);
          set({ isLoading: false });
          
          // Log analytics event
          Analytics.logEvent("fetch_events_error", {
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      },
      
      registerForEvent: (eventId: string, numberOfTickets: number) => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            console.error("No user ID available for registration");
            return null;
          }
          
          const event = get().getEventById(eventId);
          if (!event) {
            console.error("Event not found:", eventId);
            return null;
          }
          
          // Check if already registered
          if (get().isUserRegisteredForEvent(eventId)) {
            console.log("User already registered for this event");
            
            // Return the existing registration
            const existingRegistration = get().registrations.find(
              reg => reg.eventId === eventId && reg.userId === userId
            );
            
            return existingRegistration || null;
          }
          
          // Check if enough spots available
          if (event.remainingSpots < numberOfTickets) {
            console.log("Not enough spots available");
            return null;
          }
          
          // Create registration with confirmation code
          const confirmationCode = generateConfirmationCode();
          
          const registration: EventRegistration = {
            eventId,
            userId,
            registrationDate: new Date().toISOString(),
            numberOfTickets,
            totalPrice: event.price * numberOfTickets,
            confirmationCode
          };
          
          // If Supabase is configured, create registration in Supabase
          if (isSupabaseConfigured()) {
            supabase
              .from(TABLES.EVENT_REGISTRATIONS)
              .insert([
                {
                  event_id: eventId,
                  user_id: userId,
                  registration_date: registration.registrationDate,
                  number_of_tickets: numberOfTickets,
                  total_price: event.price * numberOfTickets,
                  confirmation_code: confirmationCode
                }
              ])
              .then(({ error }) => {
                if (error) {
                  console.error("Error creating registration in Supabase:", error);
                  return;
                }
                
                // Update event remaining spots in Supabase
                supabase
                  .from(TABLES.EVENTS)
                  .update({ remaining_spots: event.remainingSpots - numberOfTickets })
                  .eq('id', eventId)
                  .then(({ error: updateError }) => {
                    if (updateError) {
                      console.error("Error updating event spots in Supabase:", updateError);
                    }
                  });
              });
          }
          
          // Update event remaining spots
          const updatedEvents = get().allEvents.map(e => {
            if (e.id === eventId) {
              return {
                ...e,
                remainingSpots: e.remainingSpots - numberOfTickets
              };
            }
            return e;
          });
          
          set(state => ({
            allEvents: updatedEvents,
            registrations: [...state.registrations, registration]
          }));
          
          // Log analytics event
          Analytics.logEvent("register_for_event", {
            event_id: eventId,
            user_id: userId,
            tickets: numberOfTickets,
            price: event.price * numberOfTickets
          });
          
          console.log("✅ Registration successful:", registration);
          return registration;
        } catch (error) {
          console.error("❌ Error in registerForEvent:", error);
          
          // Log analytics event
          Analytics.logEvent("register_for_event_error", {
            event_id: eventId,
            error: error instanceof Error ? error.message : "Unknown error"
          });
          
          return null;
        }
      },
      
      cancelRegistration: (eventId: string) => {
        try {
          const userId = getCurrentUserId();
          if (!userId) {
            console.error("No user ID available for cancellation");
            return false;
          }
          
          // Find the registration
          const registration = get().registrations.find(
            reg => reg.eventId === eventId && reg.userId === userId
          );
          
          if (!registration) {
            console.log("Registration not found");
            return false;
          }
          
          // If Supabase is configured, delete registration from Supabase
          if (isSupabaseConfigured()) {
            supabase
              .from(TABLES.EVENT_REGISTRATIONS)
              .delete()
              .eq('event_id', eventId)
              .eq('user_id', userId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error deleting registration from Supabase:", error);
                  return;
                }
                
                // Get the event to update remaining spots
                const event = get().getEventById(eventId);
                if (event) {
                  // Update event remaining spots in Supabase
                  supabase
                    .from(TABLES.EVENTS)
                    .update({ remaining_spots: event.remainingSpots + registration.numberOfTickets })
                    .eq('id', eventId)
                    .then(({ error: updateError }) => {
                      if (updateError) {
                        console.error("Error updating event spots in Supabase:", updateError);
                      }
                    });
                }
              });
          }
          
          // Update event remaining spots
          const updatedEvents = get().allEvents.map(e => {
            if (e.id === eventId) {
              return {
                ...e,
                remainingSpots: e.remainingSpots + registration.numberOfTickets
              };
            }
            return e;
          });
          
          // Remove the registration
          set(state => ({
            allEvents: updatedEvents,
            registrations: state.registrations.filter(
              reg => !(reg.eventId === eventId && reg.userId === userId)
            )
          }));
          
          // Log analytics event
          Analytics.logEvent("cancel_registration", {
            event_id: eventId,
            user_id: userId,
            tickets: registration.numberOfTickets
          });
          
          console.log("✅ Registration cancelled successfully");
          return true;
        } catch (error) {
          console.error("❌ Error in cancelRegistration:", error);
          
          // Log analytics event
          Analytics.logEvent("cancel_registration_error", {
            event_id: eventId,
            error: error instanceof Error ? error.message : "Unknown error"
          });
          
          return false;
        }
      }
    }),
    {
      name: "events-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);