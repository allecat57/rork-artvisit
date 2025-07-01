import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Event, EventRegistration, AccessLevel } from "@/types/event";
import { events, getEventsByAccessLevel, getFeaturedEventsByAccessLevel, getUpcomingEventsByAccessLevel } from "@/mocks/events";
import { generateConfirmationCode } from "@/utils/generateConfirmationCode";
import * as Analytics from "@/utils/analytics";
import { supabase, isSupabaseConfigured, TABLES } from "@/config/supabase";

interface EventsState {
  // Event data
  allEvents: Event[];
  registrations: EventRegistration[];
  loading: boolean;
  
  // Getters
  getEventById: (id: string) => Event | undefined;
  getUserRegistrations: (userId: string) => EventRegistration[];
  isUserRegisteredForEvent: (eventId: string, userId: string) => boolean;
  
  // Actions
  fetchEvents: () => Promise<void>;
  registerForEvent: (eventId: string, numberOfTickets: number, userId: string) => EventRegistration | null;
  cancelRegistration: (eventId: string, userId: string) => boolean;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      allEvents: events,
      registrations: [],
      loading: false,
      
      getEventById: (id: string) => {
        return get().allEvents.find(event => event.id === id);
      },
      
      getUserRegistrations: (userId: string) => {
        if (!userId) return [];
        return get().registrations.filter(reg => reg.userId === userId);
      },
      
      isUserRegisteredForEvent: (eventId: string, userId: string) => {
        if (!userId) return false;
        return get().registrations.some(
          reg => reg.eventId === eventId && reg.userId === userId
        );
      },
      
      fetchEvents: async () => {
        set({ loading: true });
        
        try {
          console.log("Fetching events...");
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ allEvents: events, loading: false });
          
          console.log(`✅ Loaded ${events.length} events successfully`);
          
          // Log analytics event
          Analytics.logEvent("fetch_events", {
            count: events.length,
            source: "mock"
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("❌ Error fetching events:", errorMessage);
          
          // Fall back to mock data on any error
          set({ allEvents: events, loading: false });
          
          // Log analytics event
          Analytics.logEvent("fetch_events_error", {
            error: errorMessage,
            fallback_count: events.length
          });
        }
      },
      
      registerForEvent: (eventId: string, numberOfTickets: number, userId: string) => {
        try {
          if (!userId) {
            console.error("No user ID provided for registration");
            return null;
          }
          
          const event = get().getEventById(eventId);
          if (!event) {
            console.error("Event not found:", eventId);
            return null;
          }
          
          // Check if already registered
          if (get().isUserRegisteredForEvent(eventId, userId)) {
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
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("❌ Error in registerForEvent:", errorMessage);
          
          // Log analytics event
          Analytics.logEvent("register_for_event_error", {
            event_id: eventId,
            error: errorMessage
          });
          
          return null;
        }
      },
      
      cancelRegistration: (eventId: string, userId: string) => {
        try {
          if (!userId) {
            console.error("No user ID provided for cancellation");
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
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("❌ Error in cancelRegistration:", errorMessage);
          
          // Log analytics event
          Analytics.logEvent("cancel_registration_error", {
            event_id: eventId,
            error: errorMessage
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