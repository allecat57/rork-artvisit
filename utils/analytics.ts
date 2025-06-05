// Analytics utility functions

// Event names constants
export const Events = {
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  USER_SIGNUP: "user_signup",
  VIEW_ITEM: "view_item",
  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  BEGIN_CHECKOUT: "begin_checkout",
  PURCHASE: "purchase",
  SHARE: "share",
  SEARCH: "search",
  VIEW_ITEM_LIST: "view_item_list",
  SELECT_ITEM: "select_item",
  VIEW_PROMOTION: "view_promotion",
  SELECT_PROMOTION: "select_promotion",
  VIEW_SEARCH_RESULTS: "view_search_results",
  ADD_TO_WISHLIST: "add_to_wishlist",
  REMOVE_FROM_WISHLIST: "remove_from_wishlist",
  ADD_PAYMENT_INFO: "add_payment_info",
  ADD_SHIPPING_INFO: "add_shipping_info",
  VIEW_CART: "view_cart",
  REFUND: "refund",
  GENERATE_LEAD: "generate_lead",
  COMPLETE_REGISTRATION: "complete_registration",
  SCREEN_VIEW: "screen_view",
  EXCEPTION: "exception",
  TIMING: "timing",
  APP_OPEN: "app_open",
  APP_UPDATE: "app_update",
  APP_CLEAR_DATA: "app_clear_data",
  APP_REMOVE: "app_remove",
  USER_ENGAGEMENT: "user_engagement",
  AD_IMPRESSION: "ad_impression",
  AD_CLICK: "ad_click",
  AD_EXPOSURE: "ad_exposure",
  AD_QUERY: "ad_query",
  AD_REWARD: "ad_reward",
  IN_APP_PURCHASE: "in_app_purchase",
  NOTIFICATION_OPEN: "notification_open",
  NOTIFICATION_RECEIVE: "notification_receive",
  NOTIFICATION_DISMISS: "notification_dismiss",
  NOTIFICATION_FOREGROUND: "notification_foreground",
  LEVEL_START: "level_start",
  LEVEL_END: "level_end",
  LEVEL_UP: "level_up",
  SCORE: "score",
  TUTORIAL_BEGIN: "tutorial_begin",
  TUTORIAL_COMPLETE: "tutorial_complete",
  TUTORIAL_STEP: "tutorial_step",
  UNLOCK_ACHIEVEMENT: "unlock_achievement",
  JOIN_GROUP: "join_group",
  LEAVE_GROUP: "leave_group",
  LOGIN: "login",
  LOGOUT: "logout",
  SIGN_UP: "sign_up",
  SHARE_CONTENT: "share_content",
  INVITE: "invite",
  EARN_VIRTUAL_CURRENCY: "earn_virtual_currency",
  SPEND_VIRTUAL_CURRENCY: "spend_virtual_currency",
  POST_SCORE: "post_score",
  PRESENT_OFFER: "present_offer",
  PURCHASE_REFUND: "purchase_refund",
  SEARCH_CONTENT: "search_content",
  SELECT_CONTENT: "select_content",
  SET_CHECKOUT_OPTION: "set_checkout_option",
  VIEW_CONTENT: "view_content",
  VIEW_ITEM_DETAILS: "view_item_details",
  VIEW_SEARCH_RESULTS: "view_search_results",
};

// User ID for analytics
let currentUserId: string | null = null;

/**
 * Set the user ID for analytics
 * @param userId User ID to set
 */
export function setUserId(userId: string | null): void {
  currentUserId = userId;
  console.log(`[Analytics] Set user ID: ${userId}`);
  
  // In a real app, this would set the user ID in the analytics service
  // Example: firebase.analytics().setUserId(userId);
}

/**
 * Set user properties for analytics
 * @param properties User properties to set
 */
export function setUserProperties(properties: Record<string, any>): void {
  console.log("[Analytics] Set user properties:", properties);
  
  // In a real app, this would set user properties in the analytics service
  // Example: firebase.analytics().setUserProperties(properties);
}

/**
 * Log an event to analytics
 * @param eventName Name of the event
 * @param eventParams Parameters for the event
 */
export function logEvent(eventName: string, eventParams?: Record<string, any>): void {
  const params = {
    ...eventParams,
    user_id: currentUserId,
    timestamp: new Date().toISOString(),
  };
  
  console.log(`[Analytics] Event: ${eventName}`, params);
  
  // In a real app, this would log the event to the analytics service
  // Example: firebase.analytics().logEvent(eventName, params);
}

/**
 * Track a screen view
 * @param screenName Name of the screen
 * @param screenClass Class of the screen (optional)
 */
export function trackScreenView(screenName: string, screenClass?: string): void {
  logEvent(Events.SCREEN_VIEW, {
    screen_name: screenName,
    screen_class: screenClass || screenName,
  });
  
  // In a real app, this would set the current screen in the analytics service
  // Example: firebase.analytics().setCurrentScreen(screenName, screenClass);
}

/**
 * Log an error to analytics
 * @param error Error to log
 * @param fatal Whether the error is fatal
 */
export function logError(error: Error, fatal: boolean = false): void {
  logEvent(Events.EXCEPTION, {
    description: error.message,
    fatal,
    stack: error.stack,
  });
  
  // In a real app, this would log the error to the analytics service
  // Example: firebase.analytics().logEvent('exception', { description: error.message, fatal });
}

export default {
  setUserId,
  setUserProperties,
  logEvent,
  trackScreenView,
  logError,
  Events,
};