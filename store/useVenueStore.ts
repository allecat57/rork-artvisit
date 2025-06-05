import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Venue } from "@/types/venue";
import { Reservation } from "@/types/reservation";
import { venues } from "@/mocks/venues";
import { useAuthStore } from "./useAuthStore";
import * as Analytics from "@/utils/analytics";
import { categories } from "@/mocks/categories";

interface VenueState {
  venues: Venue[];
  categories: any[]; // Add categories property
  reservations: Reservation[];
  selectedVenue: Venue | null;
  searchQuery: string;
  isLoading: boolean;
  
  // Actions
  setVenues: (venues: Venue[]) => void;
  setSelectedVenue: (venue: Venue | null) => void;
  setSearchQuery: (query: string) => void;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updatedReservation: Reservation) => void;
  cancelReservation: (reservationId: string) => void;
  fetchUserReservations: (userId: string) => Promise<void>;
  fetchVenues: () => void; // Add fetchVenues method
  
  // Selectors
  getVenueById: (id: string) => Venue | undefined;
  getReservationById: (id: string) => Reservation | undefined;
  getVenuesByCategory: (category: string) => Venue[];
  getFeaturedVenues: () => Venue[];
  searchVenues: (query: string) => Venue[];
  getUserReservations: () => Reservation[];
  getEventReservations: () => Reservation[];
}

// Helper to get current user ID from auth store
const getCurrentUserId = (): string | null => {
  try {
    const user = useAuthStore.getState().user;
    return user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
};

export const useVenueStore = create<VenueState>()(
  persist(
    (set, get) => ({
      venues: venues,
      categories: categories, // Add categories from mocks
      reservations: [],
      selectedVenue: null,
      searchQuery: "",
      isLoading: false,
      
      setVenues: (venues) => set({ venues }),
      setSelectedVenue: (venue) => set({ selectedVenue: venue }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      fetchVenues: () => {
        // In a real app, this would fetch from an API
        // For now, we'll just use the mock data
        set({ isLoading: true });
        
        // Simulate network delay
        setTimeout(() => {
          set({ 
            venues: venues,
            categories: categories,
            isLoading: false 
          });
        }, 500);
      },
      
      addReservation: (reservation) => {
        console.log("Adding reservation:", reservation);
        set((state) => ({ 
          reservations: [...state.reservations, reservation] 
        }));
        
        // Log analytics event
        Analytics.logEvent('add_reservation', {
          venue_id: reservation.venueId,
          user_id: reservation.userId,
          date: reservation.date,
          party_size: reservation.partySize
        });
      },
      
      updateReservation: (id, updatedReservation) => {
        set((state) => ({
          reservations: state.reservations.map(reservation => 
            reservation.id === id ? updatedReservation : reservation
          )
        }));
        
        // Log analytics event
        Analytics.logEvent('update_reservation', {
          reservation_id: id,
          venue_id: updatedReservation.venueId,
          user_id: updatedReservation.userId
        });
      },
      
      cancelReservation: (reservationId) => {
        const reservation = get().getReservationById(reservationId);
        
        set((state) => ({ 
          reservations: state.reservations.filter(r => r.id !== reservationId) 
        }));
        
        // Log analytics event
        if (reservation) {
          Analytics.logEvent('cancel_reservation', {
            reservation_id: reservationId,
            venue_id: reservation.venueId,
            user_id: reservation.userId
          });
        }
      },
      
      fetchUserReservations: async (userId) => {
        set({ isLoading: true });
        
        try {
          // Since Firebase is removed, we'll just use local data
          // In a real app, you would fetch from your backend or Supabase here
          
          // Log analytics event
          Analytics.logEvent('fetch_user_reservations', {
            user_id: userId
          });
          
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ isLoading: false });
        } catch (error) {
          console.error("Error fetching user reservations:", error);
          set({ isLoading: false });
          
          // Log analytics event
          Analytics.logEvent('fetch_user_reservations_error', {
            user_id: userId,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      },
      
      getVenueById: (id) => {
        if (!id) return undefined;
        return get().venues.find(venue => venue.id === id);
      },
      
      getReservationById: (id) => {
        if (!id) return undefined;
        return get().reservations.find(reservation => reservation.id === id);
      },
      
      getVenuesByCategory: (category) => {
        return get().venues.filter(venue => {
          // Match by exact category name
          if (venue.category === category) return true;
          
          // For "Museums Near You", also include venues with "museum" in their type
          if (category === "Museums Near You" && 
              (venue.type.toLowerCase().includes("museum") || 
               venue.category === "museum")) {
            return true;
          }
          
          // For "Art Galleries Near You", also include venues with "gallery" or "art" in their type
          if (category === "Art Galleries Near You" && 
              (venue.type.toLowerCase().includes("gallery") || 
               venue.type.toLowerCase().includes("art") ||
               venue.category === "gallery")) {
            return true;
          }
          
          return false;
        });
      },
      
      getFeaturedVenues: () => {
        return get().venues.filter(venue => venue.featured);
      },
      
      searchVenues: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get().venues.filter(
          venue => 
            venue.name.toLowerCase().includes(lowercaseQuery) ||
            venue.type.toLowerCase().includes(lowercaseQuery) ||
            venue.location.toLowerCase().includes(lowercaseQuery)
        );
      },
      
      getUserReservations: () => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        return get().reservations.filter(reservation => 
          reservation.userId === userId && (!reservation.type || reservation.type === "venue")
        );
      },
      
      getEventReservations: () => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        return get().reservations.filter(reservation => 
          reservation.userId === userId && 
          reservation.type === "event" &&
          reservation.eventId
        );
      },
    }),
    {
      name: "venue-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);