import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Venue } from "@/types/venue";
import { Reservation } from "@/types/reservation";
import { venues } from "@/mocks/venues";
import { useAuthStore } from "./useAuthStore";
import * as Analytics from "@/utils/analytics";
import { categories } from "@/mocks/categories";
import TimeFrameAPI from "@/utils/timeframe-api";

interface VenueState {
  venues: Venue[];
  categories: any[];
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
  fetchVenues: () => Promise<void>;
  
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
      venues: venues || [],
      categories: categories || [],
      reservations: [],
      selectedVenue: null,
      searchQuery: "",
      isLoading: false,
      
      setVenues: (venues) => set({ venues: venues || [] }),
      setSelectedVenue: (venue) => set({ selectedVenue: venue }),
      setSearchQuery: (query) => set({ searchQuery: query || "" }),
      
      fetchVenues: async () => {
        set({ isLoading: true });
        
        try {
          console.log('🏛️ Fetching galleries from TimeFrame API...');
          
          // Fetch from TimeFrame API
          const response = await TimeFrameAPI.getGalleries();
          
          if (response.success && response.data) {
            console.log(`✅ Loaded ${response.count} galleries from TimeFrame`);
            
            // Transform TimeFrame galleries to venue format
            const timeFrameVenues: Venue[] = response.data.map((gallery: any, index: number) => ({
              id: `timeframe-${gallery.id}`,
              name: gallery.name || 'Unnamed Gallery',
              type: 'Art Gallery',
              description: gallery.description || 'A contemporary art gallery featuring curated exhibitions.',
              imageUrl: gallery.image_url || 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
              location: gallery.location || 'Location TBD',
              distance: `${Math.floor(Math.random() * 10) + 1} km away`,
              rating: gallery.rating || (4.0 + Math.random() * 1.0),
              openingHours: gallery.opening_hours || 'Mon-Sun: 10:00 AM - 6:00 PM',
              admission: gallery.admission_fee ? `${gallery.admission_fee}` : 'Free',
              featured: index < 2, // Make first 2 galleries featured
              category: 'Art Galleries Near You',
              tags: ['art', 'gallery', 'timeframe'],
              phone: gallery.phone,
              website: gallery.website,
              coordinates: gallery.coordinates ? {
                latitude: gallery.coordinates.lat,
                longitude: gallery.coordinates.lng
              } : undefined,
              address: gallery.address,
              cost: gallery.admission_fee ? `${gallery.admission_fee}` : 'Free'
            }));
            
            // Combine with existing mock venues
            const allVenues = [...timeFrameVenues, ...venues];
            
            set({ 
              venues: allVenues,
              categories: categories || [],
              isLoading: false 
            });
            
            // Log analytics
            Analytics.logEvent('timeframe_venues_loaded', {
              count: timeFrameVenues.length,
              total_venues: allVenues.length
            });
            
          } else {
            console.warn('⚠️ TimeFrame API returned no data, using mock venues');
            // Fallback to mock data
            set({ 
              venues: venues || [],
              categories: categories || [],
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('❌ Error fetching TimeFrame venues:', error);
          
          // Fallback to mock data on error
          set({ 
            venues: venues || [],
            categories: categories || [],
            isLoading: false 
          });
          
          // Log analytics error
          Analytics.logEvent('timeframe_venues_error', {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      },
      
      addReservation: (reservation) => {
        if (!reservation) return;
        
        console.log("Adding reservation:", reservation);
        set((state) => ({ 
          reservations: [...state.reservations, reservation] 
        }));
        
        // Log analytics event
        try {
          Analytics.logEvent('add_reservation', {
            venue_id: reservation.venueId,
            user_id: reservation.userId,
            date: reservation.date,
            party_size: reservation.partySize,
            total_amount: reservation.totalAmount
          });
        } catch (error) {
          console.warn("Analytics error:", error);
        }
      },
      
      updateReservation: (id, updatedReservation) => {
        if (!id || !updatedReservation) return;
        
        set((state) => ({
          reservations: state.reservations.map(reservation => 
            reservation.id === id ? updatedReservation : reservation
          )
        }));
        
        // Log analytics event
        try {
          Analytics.logEvent('update_reservation', {
            reservation_id: id,
            venue_id: updatedReservation.venueId,
            user_id: updatedReservation.userId,
            party_size: updatedReservation.partySize,
            total_amount: updatedReservation.totalAmount
          });
        } catch (error) {
          console.warn("Analytics error:", error);
        }
      },
      
      cancelReservation: (reservationId) => {
        if (!reservationId) return;
        
        const reservation = get().getReservationById(reservationId);
        
        set((state) => ({ 
          reservations: state.reservations.filter(r => r.id !== reservationId) 
        }));
        
        // Log analytics event
        if (reservation) {
          try {
            Analytics.logEvent('cancel_reservation', {
              reservation_id: reservationId,
              venue_id: reservation.venueId,
              user_id: reservation.userId,
              party_size: reservation.partySize,
              total_amount: reservation.totalAmount
            });
          } catch (error) {
            console.warn("Analytics error:", error);
          }
        }
      },
      
      fetchUserReservations: async (userId) => {
        if (!userId) return;
        
        set({ isLoading: true });
        
        try {
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
          try {
            Analytics.logEvent('fetch_user_reservations_error', {
              user_id: userId,
              error: error instanceof Error ? error.message : "Unknown error"
            });
          } catch (analyticsError) {
            console.warn("Analytics error:", analyticsError);
          }
        }
      },
      
      getVenueById: (id) => {
        if (!id) return undefined;
        const venues = get().venues || [];
        return venues.find(venue => venue && venue.id === id);
      },
      
      getReservationById: (id) => {
        if (!id) return undefined;
        const reservations = get().reservations || [];
        return reservations.find(reservation => reservation && reservation.id === id);
      },
      
      getVenuesByCategory: (category) => {
        if (!category) return [];
        const venues = get().venues || [];
        
        return venues.filter(venue => {
          if (!venue) return false;
          
          // Match by exact category name
          if (venue.category === category) return true;
          
          // For "Museums Near You", also include venues with "museum" in their type
          if (category === "Museums Near You" && 
              venue.type && (venue.type.toLowerCase().includes("museum") || 
               venue.category === "museum")) {
            return true;
          }
          
          // For "Art Galleries Near You", also include venues with "gallery" or "art" in their type
          if (category === "Art Galleries Near You" && 
              venue.type && (venue.type.toLowerCase().includes("gallery") || 
               venue.type.toLowerCase().includes("art") ||
               venue.category === "gallery")) {
            return true;
          }
          
          return false;
        });
      },
      
      getFeaturedVenues: () => {
        const venues = get().venues || [];
        return venues.filter(venue => venue && venue.featured);
      },
      
      searchVenues: (query) => {
        if (!query) return [];
        const venues = get().venues || [];
        const lowercaseQuery = query.toLowerCase();
        
        return venues.filter(venue => {
          if (!venue) return false;
          
          return (
            (venue.name && venue.name.toLowerCase().includes(lowercaseQuery)) ||
            (venue.type && venue.type.toLowerCase().includes(lowercaseQuery)) ||
            (venue.location && venue.location.toLowerCase().includes(lowercaseQuery))
          );
        });
      },
      
      getUserReservations: () => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const reservations = get().reservations || [];
        return reservations.filter(reservation => 
          reservation && 
          reservation.userId === userId && 
          (!reservation.type || reservation.type === "venue")
        );
      },
      
      getEventReservations: () => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const reservations = get().reservations || [];
        return reservations.filter(reservation => 
          reservation &&
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