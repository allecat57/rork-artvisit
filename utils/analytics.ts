// analytics.ts
// This file provides a unified interface for analytics tracking

// Define event names as constants to avoid typos
export const Events = {
  // Screen events
  SCREEN_VIEW: 'screen_view',
  
  // User events
  USER_LOGIN: 'user_login',
  USER_SIGNUP: 'user_signup',
  USER_LOGOUT: 'user_logout',
  
  // Venue events
  VIEW_VENUE: 'view_venue',
  FAVORITE_VENUE: 'favorite_venue',
  UNFAVORITE_VENUE: 'unfavorite_venue',
  
  // Reservation events
  CREATE_RESERVATION: 'create_reservation',
  CANCEL_RESERVATION: 'cancel_reservation',
  MODIFY_RESERVATION: 'modify_reservation',
  
  // Search events
  SEARCH: 'search',
  FILTER_RESULTS: 'filter_results',
  
  // Location events
  LOCATION_UPDATED: 'location_updated',
  LOCATION_PERMISSION_GRANTED: 'location_permission_granted',
  LOCATION_PERMISSION_DENIED: 'location_permission_denied',
  
  // Cart events
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  CHECKOUT: 'checkout',
  PURCHASE: 'purchase',
  
  // Subscription events
  VIEW_SUBSCRIPTION_PLANS: 'view_subscription_plans',
  SUBSCRIBE: 'subscribe',
  CANCEL_SUBSCRIPTION: 'cancel_subscription',
  
  // App lifecycle events
  APP_OPEN: 'app_open',
  APP_CLOSE: 'app_close',
  APP_CRASH: 'app_crash',
  
  // Performance events
  LOAD_TIME: 'load_time',
  API_RESPONSE_TIME: 'api_response_time',
};

// Log an event to all analytics providers
export function logEvent(eventName: string, eventParams?: Record<string, any>) {
  // Log to console in development
  console.log(`[Analytics] ${eventName}`, eventParams);
  
  // In a real app, you would send this to your analytics provider(s)
  // Example: firebase.analytics().logEvent(eventName, eventParams);
}

// Alias for logEvent to maintain backward compatibility
export function sendToTimeFrameAnalytics(eventName: string, eventParams?: Record<string, any>) {
  logEvent(eventName, eventParams);
}

// Track screen views
export function trackScreenView(screenName: string, screenClass?: string) {
  logEvent(Events.SCREEN_VIEW, {
    screen_name: screenName,
    screen_class: screenClass || screenName
  });
}

// Alias for trackScreenView to maintain backward compatibility
export function logScreenView(screenName: string, screenClass?: string) {
  trackScreenView(screenName, screenClass);
}

// Track user properties
export function setUserProperties(properties: Record<string, any>) {
  console.log('[Analytics] Set user properties', properties);
  // Example: firebase.analytics().setUserProperties(properties);
}

// Track user ID
export function setUserId(userId: string | null) {
  console.log('[Analytics] Set user ID', userId);
  // Example: firebase.analytics().setUserId(userId);
}

// Track exceptions/errors
export function logError(error: Error, fatal: boolean = false) {
  console.error('[Analytics] Error', { 
    message: error.message,
    stack: error.stack,
    fatal
  });
  // Example: firebase.analytics().logEvent('app_exception', { 
  //   description: error.message,
  //   fatal
  // });
}

// Track custom timing events
export function logTiming(category: string, variable: string, value: number) {
  logEvent('timing_complete', {
    category,
    variable,
    value
  });
}

export default {
  logEvent,
  trackScreenView,
  logScreenView,
  setUserProperties,
  setUserId,
  logError,
  logTiming,
  Events
};