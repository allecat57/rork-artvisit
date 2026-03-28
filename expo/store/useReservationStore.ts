import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reservation, ReservationStatus } from '@/types/reservation';
import * as Analytics from '@/utils/analytics';

interface ReservationState {
  reservations: Reservation[];
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for backward compatibility
  error: string | null;
  
  // Actions
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;
  getReservationById: (id: string) => Reservation | undefined;
  getReservationsByStatus: (status: ReservationStatus) => Reservation[];
  getUpcomingReservations: () => Reservation[];
  getPastReservations: () => Reservation[];
  fetchReservations: (userId: string) => Promise<void>;
  clearReservations: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      reservations: [],
      isLoading: false,
      get loading() {
        return get().isLoading;
      },
      error: null,

      addReservation: (reservation: Reservation) => {
        set((state) => ({
          reservations: [...state.reservations, reservation],
          error: null,
        }));
        
        // Log analytics
        Analytics.logEvent('reservation_added', {
          reservation_id: reservation.id,
          venue_id: reservation.venueId,
          status: reservation.status,
          party_size: reservation.partySize,
        });
      },

      updateReservation: (id: string, updates: Partial<Reservation>) => {
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id ? { ...reservation, ...updates } : reservation
          ),
          error: null,
        }));
        
        // Log analytics
        Analytics.logEvent('reservation_updated', {
          reservation_id: id,
          updates: Object.keys(updates),
        });
      },

      cancelReservation: (id: string) => {
        const reservation = get().getReservationById(id);
        if (reservation) {
          set((state) => ({
            reservations: state.reservations.map((r) =>
              r.id === id ? { ...r, status: 'cancelled' as ReservationStatus } : r
            ),
            error: null,
          }));
          
          // Log analytics
          Analytics.logEvent('reservation_cancelled', {
            reservation_id: id,
            venue_id: reservation.venueId,
            date: reservation.date,
            time: reservation.time,
          });
        }
      },

      getReservationById: (id: string) => {
        return get().reservations.find((reservation) => reservation.id === id);
      },

      getReservationsByStatus: (status: ReservationStatus) => {
        return get().reservations.filter((reservation) => reservation.status === status);
      },

      getUpcomingReservations: () => {
        const now = new Date();
        return get().reservations.filter((reservation) => {
          const reservationDate = new Date(reservation.date);
          return reservationDate >= now && reservation.status !== 'cancelled';
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },

      getPastReservations: () => {
        const now = new Date();
        return get().reservations.filter((reservation) => {
          const reservationDate = new Date(reservation.date);
          return reservationDate < now;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      fetchReservations: async (userId: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call - replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For now, we'll just use the existing reservations
          // In a real app, this would fetch from an API
          const existingReservations = get().reservations;
          
          set({ 
            reservations: existingReservations,
            isLoading: false,
            error: null 
          });
          
          // Log analytics
          Analytics.logEvent('reservations_fetched', {
            user_id: userId,
            count: existingReservations.length,
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch reservations' 
          });
          
          // Log analytics
          Analytics.logEvent('reservations_fetch_error', {
            user_id: userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      clearReservations: () => {
        set({ reservations: [], error: null });
        
        // Log analytics
        Analytics.logEvent('reservations_cleared', {
          count: get().reservations.length,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'reservation-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reservations: state.reservations,
      }),
    }
  )
);