/**
 * Analytics utility for tracking events and user behavior
 */

// Define event types for better type safety
export enum Events {
  SCREEN_VIEW = "screen_view",
  BUTTON_CLICK = "button_click",
  USER_SIGNUP = "user_signup",
  USER_LOGIN = "user_login",
  PURCHASE = "purchase",
  ADD_TO_CART = "add_to_cart",
  REMOVE_FROM_CART = "remove_from_cart",
  CHECKOUT_START = "checkout_start",
  CHECKOUT_COMPLETE = "checkout_complete",
  SEARCH = "search",
  FILTER_APPLY = "filter_apply",
  SHARE = "share",
  FAVORITE_ADD = "favorite_add",
  FAVORITE_REMOVE = "favorite_remove",
  RESERVATION_CREATE = "reservation_create",
  RESERVATION_CANCEL = "reservation_cancel",
  EVENT_REGISTER = "event_register",
  EVENT_CANCEL = "event_cancel",
}

/**
 * Log an event with optional parameters
 */
export function logEvent(eventName: string, eventParams?: Record<string, any>): void {
  console.log(`[Analytics] Event: ${eventName}`, eventParams);
  
  // In a real app, this would send data to an analytics service
  // Example:
  // firebase.analytics().logEvent(eventName, eventParams);
}

/**
 * Track screen view
 */
export function trackScreenView(screenName: string, screenClass?: string): void {
  console.log(`[Analytics] Screen View: ${screenName}`, { screenClass });
  
  // In a real app, this would send screen view data to an analytics service
  // Example:
  // firebase.analytics().logScreenView({
  //   screen_name: screenName,
  //   screen_class: screenClass,
  // });
  
  logEvent(Events.SCREEN_VIEW, {
    screen_name: screenName,
    screen_class: screenClass,
  });
}

/**
 * Set user ID for analytics
 */
export function setUserId(userId: string | null): void {
  console.log(`[Analytics] Set User ID: ${userId}`);
  
  // In a real app, this would set the user ID in the analytics service
  // Example:
  // firebase.analytics().setUserId(userId);
}

/**
 * Set user properties for analytics
 */
export function setUserProperties(properties: Record<string, any>): void {
  console.log(`[Analytics] Set User Properties:`, properties);
  
  // In a real app, this would set user properties in the analytics service
  // Example:
  // Object.entries(properties).forEach(([key, value]) => {
  //   firebase.analytics().setUserProperty(key, value);
  // });
}

/**
 * Log an error for analytics
 */
export function logError(error: Error, fatal: boolean = false): void {
  console.error(`[Analytics] Error:`, error, { fatal });
  
  // In a real app, this would log an error to the analytics service
  // Example:
  // firebase.analytics().logEvent('app_exception', {
  //   description: error.message,
  //   fatal,
  // });
}

/**
 * Send an analytics event (alias for logEvent for backward compatibility)
 */
export function sendAnalyticsEvent(eventName: string, eventParams?: Record<string, any>): void {
  logEvent(eventName, eventParams);
}