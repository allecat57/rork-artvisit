import * as Analytics from '@/utils/analytics';

/**
 * Migration utility to help track legacy API calls
 * Note: Supabase has been removed from this project
 */

/**
 * Log legacy API calls for tracking purposes
 */
export const logLegacyApiCall = async (
  originalUrl: string,
  operation: string = 'fetch'
) => {
  // Log the legacy API call attempt
  Analytics.logEvent('legacy_api_call', {
    original_url: originalUrl,
    operation
  });

  console.warn(`
    🔄 LEGACY API CALL DETECTED: 
    URL: ${originalUrl}
    Operation: ${operation}
    
    This API call should be replaced with TimeFrame API or tRPC calls.
    
    For galleries, use TimeFrame API:
    import TimeFrameAPI from '@/utils/timeframe-api';
    const galleries = await TimeFrameAPI.getGalleries();
    
    For other data, consider using tRPC:
    import { trpcClient } from '@/lib/trpc';
    const data = await trpcClient.yourEndpoint.query();
  `);

  throw new Error(`Legacy API call detected and blocked: ${originalUrl}`);
};

/**
 * Detect and log legacy API calls for tracking
 */
export const detectLegacyApiCalls = () => {
  // Override fetch to detect legacy API calls
  const originalFetch = global.fetch;
  
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    
    // Detect various legacy API patterns
    const isLegacyCall = (
      url.includes('sandbox.rork.app') || 
      url.includes('sandbox') ||
      url.includes('supabase.co') ||
      (url.includes('api') && !url.includes('timeframe') && !url.includes('trpc'))
    );
    
    if (isLegacyCall) {
      console.warn(`🚨 LEGACY API CALL DETECTED: ${url}`);
      
      Analytics.logEvent('legacy_api_call_detected', {
        url,
        method: init?.method || 'GET',
        timestamp: new Date().toISOString()
      });

      // Provide migration suggestions
      if (url.includes('/galleries')) {
        console.log('💡 Suggestion: Use TimeFrame API - TimeFrameAPI.getGalleries()');
      } else if (url.includes('/events')) {
        console.log('💡 Suggestion: Use tRPC or mock data for events');
      } else if (url.includes('/venues')) {
        console.log('💡 Suggestion: Use tRPC or mock data for venues');
      }
    }
    
    return originalFetch(input, init);
  };
};

/**
 * Initialize legacy API call detection (call this in your app startup)
 */
export const initializeLegacyApiDetection = () => {
  if (__DEV__) {
    detectLegacyApiCalls();
    console.log('🔍 Legacy API call detection enabled');
  }
};