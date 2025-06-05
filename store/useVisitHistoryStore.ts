import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Venue } from "@/types/venue";
import { useAuthStore } from "./useAuthStore";

interface VisitRecord {
  id: string;
  venue: Venue;
  visitDate: string; // ISO string
}

interface UserVisitHistory {
  userId: string;
  visits: VisitRecord[];
}

interface VisitHistoryState {
  userVisitHistories: Record<string, UserVisitHistory>;
  
  // Current user getters (derived from auth store)
  getCurrentUserVisits: () => VisitRecord[];
  
  // Actions
  addVisit: (venue: Venue) => void;
  removeVisit: (visitId: string) => void;
  clearHistory: () => void;
  
  // Selectors
  hasVisited: (venueId: string) => boolean;
  getVisitsByVenue: (venueId: string) => VisitRecord[];
}

// Helper to get current user ID from auth store
const getCurrentUserId = (): string | null => {
  const user = useAuthStore.getState().user;
  return user?.id || null;
};

// Create default visit history for a user
const createDefaultUserVisitHistory = (userId: string): UserVisitHistory => ({
  userId,
  visits: [],
});

export const useVisitHistoryStore = create<VisitHistoryState>()(
  persist(
    (set, get) => ({
      userVisitHistories: {},
      
      getCurrentUserVisits: () => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const userVisitHistories = get().userVisitHistories;
        return userVisitHistories[userId]?.visits || [];
      },
      
      addVisit: (venue) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentUserHistory = state.userVisitHistories[userId] || createDefaultUserVisitHistory(userId);
          
          const newVisit: VisitRecord = {
            id: `visit-${Date.now()}`,
            venue,
            visitDate: new Date().toISOString(),
          };
          
          return {
            userVisitHistories: {
              ...state.userVisitHistories,
              [userId]: {
                ...currentUserHistory,
                visits: [newVisit, ...currentUserHistory.visits]
              }
            }
          };
        });
      },
      
      removeVisit: (visitId) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentUserHistory = state.userVisitHistories[userId];
          if (!currentUserHistory) return state;
          
          return {
            userVisitHistories: {
              ...state.userVisitHistories,
              [userId]: {
                ...currentUserHistory,
                visits: currentUserHistory.visits.filter(visit => visit.id !== visitId)
              }
            }
          };
        });
      },
      
      clearHistory: () => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentUserHistory = state.userVisitHistories[userId];
          if (!currentUserHistory) return state;
          
          return {
            userVisitHistories: {
              ...state.userVisitHistories,
              [userId]: {
                ...currentUserHistory,
                visits: []
              }
            }
          };
        });
      },
      
      hasVisited: (venueId) => {
        const visits = get().getCurrentUserVisits();
        return visits.some(visit => visit.venue.id === venueId);
      },
      
      getVisitsByVenue: (venueId) => {
        const visits = get().getCurrentUserVisits();
        return visits.filter(visit => visit.venue.id === venueId);
      },
    }),
    {
      name: "visit-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);