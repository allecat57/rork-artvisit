import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Venue } from "@/types/venue";
import { useAuthStore } from "./useAuthStore";

interface UserFavorites {
  userId: string;
  venues: Venue[];
}

interface FavoritesState {
  userFavorites: Record<string, UserFavorites>;
  
  // Current user getters (derived from auth store)
  getCurrentUserFavorites: () => Venue[];
  
  // Actions
  addFavorite: (venue: Venue) => void;
  removeFavorite: (venueId: string) => void;
  
  // Selectors
  isFavorite: (venueId: string) => boolean;
}

// Helper to get current user ID from auth store
const getCurrentUserId = (): string | null => {
  const user = useAuthStore.getState().user;
  return user?.id || null;
};

// Create default favorites for a user
const createDefaultUserFavorites = (userId: string): UserFavorites => ({
  userId,
  venues: [],
});

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      userFavorites: {},
      
      getCurrentUserFavorites: () => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const userFavorites = get().userFavorites;
        return userFavorites[userId]?.venues || [];
      },
      
      addFavorite: (venue) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentUserFavorites = state.userFavorites[userId] || createDefaultUserFavorites(userId);
          
          // Check if venue is already in favorites
          if (currentUserFavorites.venues.some(fav => fav.id === venue.id)) {
            return state;
          }
          
          return {
            userFavorites: {
              ...state.userFavorites,
              [userId]: {
                ...currentUserFavorites,
                venues: [...currentUserFavorites.venues, venue]
              }
            }
          };
        });
      },
      
      removeFavorite: (venueId) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentUserFavorites = state.userFavorites[userId];
          if (!currentUserFavorites) return state;
          
          return {
            userFavorites: {
              ...state.userFavorites,
              [userId]: {
                ...currentUserFavorites,
                venues: currentUserFavorites.venues.filter(venue => venue.id !== venueId)
              }
            }
          };
        });
      },
      
      isFavorite: (venueId) => {
        const favorites = get().getCurrentUserFavorites();
        return favorites.some(venue => venue.id === venueId);
      },
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);