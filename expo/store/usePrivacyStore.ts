import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Analytics from "@/utils/analytics";

interface PrivacyState {
  dataCollection: boolean;
  locationTracking: boolean;
  personalization: boolean;
  analyticsEnabled: boolean;
  
  // Actions
  setDataCollection: (enabled: boolean) => void;
  setLocationTracking: (enabled: boolean) => void;
  setPersonalization: (enabled: boolean) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      // Default values - users opt in by default
      dataCollection: true,
      locationTracking: true,
      personalization: true,
      analyticsEnabled: true,
      
      setDataCollection: (enabled) => {
        set({ dataCollection: enabled });
      },
      
      setLocationTracking: (enabled) => {
        set({ locationTracking: enabled });
      },
      
      setPersonalization: (enabled) => {
        set({ personalization: enabled });
      },
      
      setAnalyticsEnabled: async (enabled) => {
        // Update analytics collection setting
        await Analytics.setAnalyticsEnabled(enabled);
        set({ analyticsEnabled: enabled });
      },
    }),
    {
      name: "privacy-settings",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // When storage is rehydrated, update analytics collection setting
        if (state) {
          Analytics.setAnalyticsEnabled(state.analyticsEnabled);
        }
      }
    }
  )
);