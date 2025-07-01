import { querySupabase, insertSupabase, updateSupabase, deleteSupabase } from '@/utils/api';
import * as Analytics from '@/utils/analytics';

/**
 * Migration utility to help replace sandbox API calls with Supabase queries
 */

/**
 * Replace fetch calls to sandbox with Supabase queries
 */
export const migrateFetchCall = async (
  originalUrl: string,
  fallbackTable?: string,
  fallbackOptions?: any
) => {
  // Log the migration attempt
  Analytics.logEvent('sandbox_migration_attempt', {
    original_url: originalUrl,
    fallback_table: fallbackTable
  });

  console.warn(`
    🔄 MIGRATION NOTICE: 
    Sandbox API call detected: ${originalUrl}
    
    This should be replaced with a Supabase query.
    ${fallbackTable ? `Suggested table: ${fallbackTable}` : ''}
    
    Example replacement:
    import { querySupabase } from '@/utils/api';
    const data = await querySupabase('${fallbackTable || 'your_table'}', {
      // your query options
    });
  `);

  // If fallback table is provided, try to query it
  if (fallbackTable) {
    try {
      const result = await querySupabase(fallbackTable, fallbackOptions || {});
      
      Analytics.logEvent('sandbox_migration_fallback_success', {
        original_url: originalUrl,
        fallback_table: fallbackTable,
        has_result: !!result
      });

      return result;
    } catch (error) {
      Analytics.logEvent('sandbox_migration_fallback_error', {
        original_url: originalUrl,
        fallback_table: fallbackTable,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  throw new Error(`Sandbox API call not migrated: ${originalUrl}`);
};

/**
 * Common sandbox to Supabase migrations
 */
export const commonMigrations = {
  // Gallery-related migrations
  galleries: {
    fetchAll: () => querySupabase('galleries', {
      orderBy: { column: 'created_at', ascending: false }
    }),
    
    fetchFeatured: () => querySupabase('galleries', {
      select: `
        *,
        featured_galleries!inner(
          is_active,
          expires_at
        )
      `,
      filters: [
        { column: 'featured_galleries.is_active', operator: 'eq', value: true }
      ],
      orderBy: { column: 'created_at', ascending: false }
    }),
    
    fetchById: (id: string) => querySupabase('galleries', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
      single: true
    })
  },

  // Event-related migrations
  events: {
    fetchAll: () => querySupabase('events', {
      orderBy: { column: 'date', ascending: true }
    }),
    
    fetchUpcoming: () => querySupabase('events', {
      filters: [{ column: 'date', operator: 'gte', value: new Date().toISOString() }],
      orderBy: { column: 'date', ascending: true }
    }),
    
    fetchById: (id: string) => querySupabase('events', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
      single: true
    })
  },

  // Venue-related migrations
  venues: {
    fetchAll: () => querySupabase('venues', {
      orderBy: { column: 'name', ascending: true }
    }),
    
    fetchFeatured: () => querySupabase('venues', {
      filters: [{ column: 'featured', operator: 'eq', value: true }],
      orderBy: { column: 'name', ascending: true }
    }),
    
    fetchById: (id: string) => querySupabase('venues', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
      single: true
    })
  },

  // User-related migrations
  profiles: {
    fetchById: (id: string) => querySupabase('profiles', {
      filters: [{ column: 'id', operator: 'eq', value: id }],
      single: true
    }),
    
    updateProfile: (id: string, updates: any) => updateSupabase(
      'profiles',
      { ...updates, updated_at: new Date().toISOString() },
      [{ column: 'id', operator: 'eq', value: id }],
      { single: true }
    )
  },

  // Booking-related migrations
  reservations: {
    fetchUserReservations: (userId: string) => querySupabase('reservations', {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      orderBy: { column: 'created_at', ascending: false }
    }),
    
    createReservation: (reservation: any) => insertSupabase(
      'reservations',
      { ...reservation, created_at: new Date().toISOString() },
      { single: true }
    )
  }
};

/**
 * Detect and log sandbox API calls for migration tracking
 */
export const detectSandboxCalls = () => {
  // Override fetch to detect sandbox calls
  const originalFetch = global.fetch;
  
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    if (url.includes('sandbox.rork.app') || url.includes('sandbox')) {
      console.warn(`🚨 SANDBOX API CALL DETECTED: ${url}`);
      
      Analytics.logEvent('sandbox_call_detected', {
        url,
        method: init?.method || 'GET',
        timestamp: new Date().toISOString()
      });

      // You can add specific migration suggestions here
      if (url.includes('/galleries')) {
        console.log('💡 Suggestion: Use commonMigrations.galleries.fetchAll() instead');
      } else if (url.includes('/events')) {
        console.log('💡 Suggestion: Use commonMigrations.events.fetchAll() instead');
      } else if (url.includes('/venues')) {
        console.log('💡 Suggestion: Use commonMigrations.venues.fetchAll() instead');
      }
    }
    
    return originalFetch(input, init);
  };
};

/**
 * Initialize sandbox call detection (call this in your app startup)
 */
export const initializeMigrationDetection = () => {
  if (__DEV__) {
    detectSandboxCalls();
    console.log('🔍 Sandbox API call detection enabled');
  }
};