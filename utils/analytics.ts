// Analytics utility functions
export const logEvent = (eventName: string, parameters?: Record<string, any>) => {
  // Log event for debugging
  console.log(`Analytics Event: ${eventName}`, parameters);
  
  // In a real app, you would integrate with Firebase Analytics, Mixpanel, etc.
  // For now, we'll just log to console
};

export const logScreenView = (screenName: string, parameters?: Record<string, any>) => {
  // Log screen view for debugging
  console.log(`Analytics Screen View: ${screenName}`, parameters);
  
  // In a real app, you would integrate with Firebase Analytics, Mixpanel, etc.
  // For now, we'll just log to console
};

export const trackScreenView = (screenName: string, screenClass?: string) => {
  // Log screen view for debugging
  console.log(`Analytics Track Screen View: ${screenName}`, { screenClass });
  
  // In a real app, you would integrate with Firebase Analytics, Mixpanel, etc.
  // For now, we'll just log to console
};

export const setCurrentScreen = (screenName: string, screenClass?: string) => {
  // Set current screen for debugging
  console.log(`Analytics Set Current Screen: ${screenName}`, { screenClass });
  
  // In a real app, you would integrate with Firebase Analytics, Mixpanel, etc.
  // For now, we'll just log to console
};

export const setUserProperty = (property: string, value: string) => {
  // Set user property for debugging
  console.log(`Analytics User Property: ${property} = ${value}`);
  
  // In a real app, you would integrate with Firebase Analytics, Mixpanel, etc.
  // For now, we'll just log to console
};

export const setUserProperties = (properties: Record<string, any>) => {
  // Set user properties for debugging
  console.log(`Analytics User Properties:`, properties);
  
  // In a real app, you would integrate with Firebase Analytics, Mixpanel, etc.
  // For now, we'll just log to console
};

export const setUserId = (userId: string | null) => {
  // Set user ID for debugging
  console.log(`Analytics User ID: ${userId}`);
  
  // In a real app, you would integrate with Firebase Analytics, Mixpanel, etc.
  // For now, we'll just log to console
};

export const logError = (error: Error, fatal: boolean = false) => {
  // Log error for debugging
  console.log(`Analytics Error: ${error.message}`, { fatal, stack: error.stack });
  
  // In a real app, you would integrate with Firebase Analytics, Mixpanel, etc.
  // For now, we'll just log to console
};

// Alias for sendAnalyticsEvent to match usage in stores
export const sendAnalyticsEvent = logEvent;

// Common event names
export const Events = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_SIGNUP: 'user_signup',
  SCREEN_VIEW: 'screen_view',
  BUTTON_CLICK: 'button_click',
  PURCHASE: 'purchase',
  SUBSCRIPTION_CHANGE: 'subscription_change',
  VENUE_VIEW: 'venue_view',
  EVENT_VIEW: 'event_view',
  RESERVATION_MADE: 'reservation_made',
  RESERVATION_CANCELLED: 'reservation_cancelled',
  CREATE_RESERVATION: 'create_reservation',
  MODIFY_RESERVATION: 'modify_reservation',
  UPDATE_PROFILE: 'update_profile',
  UPDATE_PAYMENT_METHOD: 'update_payment_method',
  LOGOUT: 'logout',
  OPEN_HELP_CENTER: 'open_help_center',
} as const;

// Default export for convenience
export default {
  logEvent,
  logScreenView,
  trackScreenView,
  setCurrentScreen,
  setUserProperty,
  setUserProperties,
  setUserId,
  logError,
  sendAnalyticsEvent,
  Events,
};