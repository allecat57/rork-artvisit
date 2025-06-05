import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface NotificationsState {
  pushEnabled: boolean;
  emailEnabled: boolean;
  reservationReminders: boolean;
  favoriteUpdates: boolean;
  promotions: boolean;
  orderUpdates: boolean;
  messageNotifications: boolean;
  
  // Actions
  setPushEnabled: (enabled: boolean) => void;
  setEmailEnabled: (enabled: boolean) => void;
  setReservationReminders: (enabled: boolean) => void;
  setFavoriteUpdates: (enabled: boolean) => void;
  setPromotions: (enabled: boolean) => void;
  setOrderUpdates: (enabled: boolean) => void;
  setMessageNotifications: (enabled: boolean) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      // Default values - users opt in by default
      pushEnabled: true,
      emailEnabled: true,
      reservationReminders: true,
      favoriteUpdates: true,
      promotions: true,
      orderUpdates: true,
      messageNotifications: true,
      
      setPushEnabled: (enabled) => {
        set({ pushEnabled: enabled });
      },
      
      setEmailEnabled: (enabled) => {
        set({ emailEnabled: enabled });
      },
      
      setReservationReminders: (enabled) => {
        set({ reservationReminders: enabled });
      },
      
      setFavoriteUpdates: (enabled) => {
        set({ favoriteUpdates: enabled });
      },
      
      setPromotions: (enabled) => {
        set({ promotions: enabled });
      },
      
      setOrderUpdates: (enabled) => {
        set({ orderUpdates: enabled });
      },
      
      setMessageNotifications: (enabled) => {
        set({ messageNotifications: enabled });
      },
    }),
    {
      name: "notifications-settings",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);