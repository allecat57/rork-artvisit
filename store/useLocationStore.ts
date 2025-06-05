import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Analytics from "@/utils/analytics";

type LocationErrorType = 
  | "locationPermissionDenied" 
  | "locationFetchError" 
  | "locationAccuracyError" 
  | null;

interface LocationState {
  currentLocation: { latitude: number; longitude: number } | null;
  locationName: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  locationError: LocationErrorType;
  lastUpdated: number | null;
  
  setCurrentLocation: (location: { latitude: number; longitude: number } | null) => void;
  setLocationName: (name: string | null) => void;
  setPermissionStatus: (status: 'undetermined' | 'granted' | 'denied') => void;
  setLocationError: (error: LocationErrorType) => void;
  clearLocationData: () => void;
  openLocationPicker: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentLocation: null,
      locationName: null,
      permissionStatus: 'undetermined',
      locationError: null,
      lastUpdated: null,
      
      setCurrentLocation: (location) => set({ 
        currentLocation: location,
        lastUpdated: location ? Date.now() : null
      }),
      
      setLocationName: (name) => set({ locationName: name }),
      
      setPermissionStatus: (status) => set({ permissionStatus: status }),
      
      setLocationError: (error) => set({ locationError: error }),
      
      clearLocationData: () => set({
        currentLocation: null,
        locationName: null,
        lastUpdated: null,
        locationError: null
      }),
      
      openLocationPicker: () => {
        // This would typically open a location picker modal
        // For now, we'll just log that it was called
        console.log("Location picker opened");
        
        // Log analytics event
        Analytics.logEvent("open_location_picker", {
          current_location: get().locationName || "unknown"
        });
      }
    }),
    {
      name: "location-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);