// analytics.ts
// This file provides a simplified analytics interface

// Define event types
export const Events = {
  SCREEN_VIEW: "screen_view",
  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  PURCHASE: "purchase",
  LOGIN: "login",
  SIGNUP: "signup",
  SEARCH: "search",
  FILTER: "filter",
  FAVORITE: "favorite",
  UNFAVORITE: "unfavorite",
  SHARE: "share",
  RESERVATION_CREATED: "reservation_created",
  RESERVATION_CANCELLED: "reservation_cancelled",
  SUBSCRIPTION_STARTED: "subscription_started",
  SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  USER_SIGNUP: "user_signup"
};

// Log an event with parameters
export const logEvent = (eventName: string, params?: Record<string, any>) => {
  // In a real app, this would send to an analytics service
  console.log(`[Analytics] Event: ${eventName}`, params);
  
  // Return a promise to simulate async operation
  return Promise.resolve();
};

// Send analytics event (wrapper for logEvent)
export const sendAnalyticsEvent = async (eventName: string, params?: Record<string, any>) => {
  try {
    await logEvent(eventName, params);
    return true;
  } catch (error) {
    console.error("Error sending analytics event:", error);
    return false;
  }
};

// Compatibility method for TimeFrame analytics
export const sendToTimeFrameAnalytics = async (eventName: string, params?: Record<string, any>) => {
  try {
    await logEvent(eventName, params);
    return true;
  } catch (error) {
    console.error("Error sending TimeFrame analytics event:", error);
    return false;
  }
};

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  console.log("[Analytics] Setting user properties:", properties);
  return Promise.resolve();
};

// Set user ID
export const setUserId = (userId: string | null) => {
  console.log(`[Analytics] Setting user ID: ${userId || "anonymous"}`);
  return Promise.resolve();
};

// Set current screen
export const setCurrentScreen = (screenName: string, screenClass?: string) => {
  console.log(`[Analytics] Screen view: ${screenName}`, screenClass ? `(${screenClass})` : "");
  return logEvent(Events.SCREEN_VIEW, { screen_name: screenName, screen_class: screenClass });
};

// Reset analytics data (for logout)
export const resetAnalytics = () => {
  console.log("[Analytics] Reset analytics data");
  return Promise.resolve();
};