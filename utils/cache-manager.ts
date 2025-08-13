import AsyncStorage from '@react-native-async-storage/async-storage';
import TimeFrameAPI from '@/utils/timeframe-api';
import { useGalleryStore } from '@/store/useGalleryStore';
import { useCartStore } from '@/store/useCartStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useEventsStore } from '@/store/useEventsStore';
import { useVenueStore } from '@/store/useVenueStore';
import { useReservationStore } from '@/store/useReservationStore';
import { usePurchaseHistoryStore } from '@/store/usePurchaseHistoryStore';
import { useVisitHistoryStore } from '@/store/useVisitHistoryStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { usePrivacyStore } from '@/store/usePrivacyStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useLocationStore } from '@/store/useLocationStore';


class CacheManager {
  // Clear all app caches
  async clearAllCaches() {
    console.log('🧹 Starting complete cache clear...');
    
    try {
      // Clear TimeFrame API cache
      TimeFrameAPI.clearCache();
      
      // Clear AsyncStorage (Zustand persisted data)
      await this.clearAsyncStorage();
      
      // Clear Zustand stores
      this.clearZustandStores();
      
      console.log('✅ All caches cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
      return false;
    }
  }

  // Clear only TimeFrame related caches
  async clearTimeFrameCache() {
    console.log('🧹 Clearing TimeFrame cache...');
    
    try {
      // Clear TimeFrame API cache
      TimeFrameAPI.clearCache();
      
      // Clear gallery store
      useGalleryStore.getState().clearCache();
      
      // Clear specific AsyncStorage keys
      await AsyncStorage.multiRemove([
        'gallery-storage',
        'timeframe-data'
      ]);
      
      console.log('✅ TimeFrame cache cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing TimeFrame cache:', error);
      return false;
    }
  }

  // Clear AsyncStorage
  private async clearAsyncStorage() {
    console.log('🧹 Clearing AsyncStorage...');
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const zustandKeys = keys.filter(key => 
        key.includes('-storage') || 
        key.includes('zustand') ||
        key.includes('timeframe') ||
        key.includes('gallery') ||
        key.includes('cart') ||
        key.includes('favorites') ||
        key.includes('events') ||
        key.includes('venue') ||
        key.includes('reservation') ||
        key.includes('purchase') ||
        key.includes('visit') ||
        key.includes('notifications') ||
        key.includes('privacy') ||
        key.includes('profile') ||
        key.includes('location') ||
        key.includes('auth')
      );
      
      if (zustandKeys.length > 0) {
        await AsyncStorage.multiRemove(zustandKeys);
        console.log(`🗑️ Removed ${zustandKeys.length} AsyncStorage keys`);
      }
    } catch (error) {
      console.error('❌ Error clearing AsyncStorage:', error);
    }
  }

  // Clear Zustand stores
  private clearZustandStores() {
    console.log('🧹 Clearing Zustand stores...');
    
    try {
      // Clear all stores by calling their clear/reset methods
      useGalleryStore.getState().clearCache();
      
      // Reset other stores to initial state
      // Note: Using any to bypass TypeScript errors for store state properties
      (useCartStore as any).setState({ items: [], total: 0 });
      (useFavoritesStore as any).setState({ favorites: [] });
      (useEventsStore as any).setState({ events: [], selectedEvent: null });
      (useVenueStore as any).setState({ venues: [], selectedVenue: null });
      (useReservationStore as any).setState({ reservations: [], selectedReservation: null });
      (usePurchaseHistoryStore as any).setState({ purchases: [] });
      (useVisitHistoryStore as any).setState({ visits: [] });
      (useNotificationsStore as any).setState({ notifications: [], unreadCount: 0 });
      (usePrivacyStore as any).setState({ settings: {} });
      (useProfileStore as any).setState({ profile: null });
      (useLocationStore as any).setState({ currentLocation: null, selectedLocation: null });
      
      // Don't clear auth store as it would log out the user
      // useAuthStore.setState({ user: null, isAuthenticated: false });
      
      console.log('✅ Zustand stores cleared');
    } catch (error) {
      console.error('❌ Error clearing Zustand stores:', error);
    }
  }

  // Clear specific store cache
  async clearStoreCache(storeName: string) {
    console.log(`🧹 Clearing ${storeName} cache...`);
    
    try {
      switch (storeName) {
        case 'gallery':
          useGalleryStore.getState().clearCache();
          await AsyncStorage.removeItem('gallery-storage');
          break;
        case 'cart':
          (useCartStore as any).setState({ items: [], total: 0 });
          await AsyncStorage.removeItem('cart-storage');
          break;
        case 'favorites':
          (useFavoritesStore as any).setState({ favorites: [] });
          await AsyncStorage.removeItem('favorites-storage');
          break;
        case 'events':
          (useEventsStore as any).setState({ events: [], selectedEvent: null });
          await AsyncStorage.removeItem('events-storage');
          break;
        case 'venues':
          useVenueStore.setState({ venues: [], selectedVenue: null });
          await AsyncStorage.removeItem('venue-storage');
          break;
        default:
          console.warn(`Unknown store: ${storeName}`);
          return false;
      }
      
      console.log(`✅ ${storeName} cache cleared`);
      return true;
    } catch (error) {
      console.error(`❌ Error clearing ${storeName} cache:`, error);
      return false;
    }
  }

  // Get cache info
  async getCacheInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.includes('-storage') || 
        key.includes('zustand') ||
        key.includes('timeframe')
      );
      
      const cacheInfo = {
        totalKeys: keys.length,
        cacheKeys: cacheKeys.length,
        keys: cacheKeys
      };
      
      console.log('📊 Cache info:', cacheInfo);
      return cacheInfo;
    } catch (error) {
      console.error('❌ Error getting cache info:', error);
      return null;
    }
  }
}

export default new CacheManager();