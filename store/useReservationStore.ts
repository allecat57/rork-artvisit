import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Reservation, ReservationStatus } from "@/types/reservation";

interface ReservationState {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;
  getReservationsByUserId: (userId: string) => Reservation[];
  getReservationById: (id: string) => Reservation | undefined;
  clearReservations: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      reservations: [],
      isLoading: false,
      error: null,
      
      addReservation: (reservation) => {
        set((state) => ({
          reservations: [...state.reservations, reservation],
          error: null
        }));
      },
      
      updateReservation: (id, updates) => {
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id ? { ...reservation, ...updates } : reservation
          ),
          error: null
        }));
      },
      
      cancelReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id 
              ? { ...reservation, status: ReservationStatus.CANCELLED }
              : reservation
          ),
          error: null
        }));
      },
      
      getReservationsByUserId: (userId) => {
        return get().reservations.filter((reservation) => reservation.userId === userId);
      },
      
      getReservationById: (id) => {
        return get().reservations.find((reservation) => reservation.id === id);
      },
      
      clearReservations: () => {
        set({ reservations: [], error: null });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setError: (error) => {
        set({ error });
      }
    }),
    {
      name: "reservation-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reservations: state.reservations
      })
    }
  )
);