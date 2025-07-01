import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { getVenueById } from '@/mocks/venues';
import * as Analytics from '@/utils/analytics';

interface ReservationState {
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  
  // Actions
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;
  getReservationById: (id: string) => Reservation | undefined;
  getReservationsByStatus: (status: ReservationStatus) => Reservation[];
  getUpcomingReservations: () => Reservation[];
  getPastReservations: () => Reservation[];
  clearReservations: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchReservations: (userId: string) => Promise<void>;
  generateMockReservations: (userId: string) => void;
}

export const useReservationStore = create<ReservationState>()(
  persist(
    (set, get) => ({
      reservations: [],
      loading: false,
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

      clearReservations: () => {
        set({ reservations: [], error: null });
        
        // Log analytics
        Analytics.logEvent('reservations_cleared', {
          count: get().reservations.length,
        });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      fetchReservations: async (userId: string) => {
        set({ loading: true, error: null });
        
        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For now, generate mock reservations if none exist
          const currentReservations = get().reservations.filter(r => r.userId === userId);
          if (currentReservations.length === 0) {
            get().generateMockReservations(userId);
          }
          
          set({ loading: false });
        } catch (error) {
          set({ 
            loading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch reservations' 
          });
        }
      },

      generateMockReservations: (userId: string) => {
        const mockReservations: Reservation[] = [
          {
            id: '1',
            userId,
            venueId: '1',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
            time: '19:30',
            partySize: 4,
            guests: 4,
            status: 'confirmed',
            confirmationCode: 'ABC123',
            venueName: 'The Modern Gallery',
            venueLocation: 'Downtown Arts District',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            userId,
            venueId: '2',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            time: '18:00',
            partySize: 2,
            guests: 2,
            status: 'completed',
            confirmationCode: 'DEF456',
            venueName: 'Contemporary Art Space',
            venueLocation: 'Midtown Cultural Center',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            userId,
            venueId: '3',
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
            time: '20:00',
            partySize: 6,
            guests: 6,
            status: 'pending',
            confirmationCode: 'GHI789',
            venueName: 'Sculpture Garden',
            venueLocation: 'Riverside Park',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        set((state) => ({
          reservations: [...state.reservations, ...mockReservations],
        }));
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