import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "./useAuthStore";

interface VisitRecord {
  id: string;
  venueId: string;
  date: string; // ISO string
  time?: string;
  notes?: string;
}

interface UserVisitHistory {
  userId: string;
  visits: VisitRecord[];
}

interface VisitHistoryState {
  userVisitHistories: Record<string, UserVisitHistory>;
  
  // Current user getters (derived from auth store)
  visitHistory: VisitRecord[];
  
  // Actions
  addVisit: (venueId: string, time?: string, notes?: string) => void;
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
      
      get visitHistory() {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const userVisitHistories = get().userVisitHistories;
        return userVisitHistories[userId]?.visits || [];
      },
      
      addVisit: (venueId, time, notes) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentUserHistory = state.userVisitHistories[userId] || createDefaultUserVisitHistory(userId);
          
          const newVisit: VisitRecord = {
            id: `visit-${Date.now()}`,
            venueId,
            date: new Date().toISOString(),
            time,
            notes,
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
        const userId = getCurrentUserId();
        if (!userId) return false;
        
        const userVisitHistories = get().userVisitHistories;
        const visits = userVisitHistories[userId]?.visits || [];
        return visits.some(visit => visit.venueId === venueId);
      },
      
      getVisitsByVenue: (venueId) => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const userVisitHistories = get().userVisitHistories;
        const visits = userVisitHistories[userId]?.visits || [];
        return visits.filter(visit => visit.venueId === venueId);
      },
    }),
    {
      name: "visit-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);