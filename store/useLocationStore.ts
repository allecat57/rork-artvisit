import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Analytics from "@/utils/analytics";

type LocationErrorType = 
  | "locationPermissionDenied" 
  | "locationFetchError" 
  | "locationAccuracyError" 
  | null;

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  address?: string;
}

interface LocationState {
  currentLocation: LocationData | null;
  locationName: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
  locationError: LocationErrorType;
  lastUpdated: number | null;
  
  // Computed properties for backward compatibility
  location: LocationData | null;
  
  setCurrentLocation: (location: LocationData | null) => void;
  setLocationName: (name: string | null) => void;
  setPermissionStatus: (status: 'undetermined' | 'granted' | 'denied') => void;
  setLocationError: (error: LocationErrorType) => void;
  clearLocationData: () => void;
  getCurrentLocation: () => Promise<void>;
  requestLocation: () => Promise<void>;
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
      
      // Computed property for backward compatibility
      get location() {
        return get().currentLocation;
      },
      
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
      
      getCurrentLocation: async () => {
        if (Platform.OS === 'web') {
          // Use web geolocation API
          if (navigator.geolocation) {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 60000
                });
              });
              
              const location: LocationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                city: "Current Location" // Web doesn't provide city directly
              };
              
              set({ 
                currentLocation: location,
                permissionStatus: 'granted',
                locationError: null,
                lastUpdated: Date.now()
              });
              
              Analytics.logEvent("location_obtained", {
                source: "web_geolocation",
                latitude: location.latitude,
                longitude: location.longitude
              });
            } catch (error) {
              console.error("Web geolocation error:", error);
              set({ 
                locationError: "locationFetchError",
                permissionStatus: 'denied'
              });
            }
          } else {
            set({ 
              locationError: "locationFetchError",
              permissionStatus: 'denied'
            });
          }
        } else {
          // For native platforms, we would use expo-location
          // For now, set a mock location
          const mockLocation: LocationData = {
            latitude: 37.7749,
            longitude: -122.4194,
            city: "San Francisco",
            address: "San Francisco, CA"
          };
          
          set({ 
            currentLocation: mockLocation,
            locationName: "San Francisco, CA",
            permissionStatus: 'granted',
            locationError: null,
            lastUpdated: Date.now()
          });
          
          Analytics.logEvent("location_obtained", {
            source: "mock_location",
            city: mockLocation.city
          });
        }
      },
      
      requestLocation: async () => {
        return get().getCurrentLocation();
      },
      
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