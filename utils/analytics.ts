// Define event types
export enum Events {
  SCREEN_VIEW = "screen_view",
  ADD_TO_CART = "add_to_cart",
  REMOVE_FROM_CART = "remove_from_cart",
  PURCHASE = "purchase",
  LOGIN = "login",
  SIGNUP = "signup",
  SEARCH = "search",
  SHARE = "share",
  FAVORITE = "favorite",
  UNFAVORITE = "unfavorite"
}

// Log event function
export const logEvent = (eventName: string, params?: Record<string, any>) => {
  // Just log to console in development
  console.log(`[Analytics] ${eventName}`, params);
  
  // In a real app, you would send this to your analytics service
  // For example: firebase.analytics().logEvent(eventName, params);
};

// Send analytics event (wrapper for logEvent)
export const sendAnalyticsEvent = async (eventName: string, params?: Record<string, any>) => {
  try {
    logEvent(eventName, params);
    return true;
  } catch (error) {
    console.error("Error sending analytics event:", error);
    return false;
  }
};