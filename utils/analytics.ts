// Simplified analytics interface
export const Events = {
  APP_START: 'app_start',
  SCREEN_VIEW: 'screen_view',
  AUTH_SESSION_RESTORED: 'auth_session_restored',
  FETCH_TODOS: 'fetch_todos',
  TOGGLE_TODO: 'toggle_todo',
  SELECT_VENUE: 'select_venue',
  SELECT_CATEGORY: 'select_category',
  UPDATE_PROFILE: 'update_profile',
  UPDATE_PAYMENT_METHOD: 'update_payment_method',
  LOGOUT: 'logout',
  OPEN_HELP_CENTER: 'open_help_center',
  FEATURE_NOT_IMPLEMENTED: 'feature_not_implemented',
  PERMISSION_DENIED: 'permission_denied',
  PROFILE_PHOTO_ERROR: 'profile_photo_error',
  VIEW_VISIT_HISTORY: 'view_visit_history',
  VIEW_FAVORITES: 'view_favorites',
  VIEW_PURCHASE_HISTORY: 'view_purchase_history',
  CHANGE_PROFILE_PHOTO_TAP: 'change_profile_photo_tap',
  UPDATE_PAYMENT_METHOD_TAP: 'update_payment_method_tap',
  MANAGE_SUBSCRIPTION_TAP: 'manage_subscription_tap',
  PRIVACY_SETTINGS_TAP: 'privacy_settings_tap',
  NOTIFICATIONS_TAP: 'notifications_tap',
  HELP_CENTER_TAP: 'help_center_tap',
  SUBSCRIPTION_TIER_SELECTED: 'subscription_tier_selected',
  SUBSCRIPTION_PAYMENT_REQUIRED: 'subscription_payment_required',
  PAYMENT_METHOD_ADDED: 'payment_method_added',
  STRIPE_PAYMENT_METHOD_ADDED: 'stripe_payment_method_added',
  SUBSCRIPTION_PROCESSING_STARTED: 'subscription_processing_started',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_ERROR: 'subscription_error',
  CHANGE_SUBSCRIPTION: 'change_subscription',
  SUBSCRIPTION_TIER_VIEWED: 'subscription_tier_viewed',
  SUBSCRIPTION_CONTINUE_BUTTON: 'subscription_continue_button',
  SUBSCRIPTION_CONFIRMATION_CANCELLED: 'subscription_confirmation_cancelled',
  SUBSCRIPTION_CONFIRMATION_CANCEL: 'subscription_confirmation_cancel',
  SUBSCRIPTION_CONFIRMED: 'subscription_confirmed',
  SUBSCRIPTION_ADD_PAYMENT_METHOD: 'subscription_add_payment_method',
  SUBSCRIPTION_CONFIRM: 'subscription_confirm',
  SUBSCRIPTION_MODAL_CLOSED: 'subscription_modal_closed',
  OPEN_PAYMENT_METHOD_MODAL: 'open_payment_method_modal',
  OPEN_SUBSCRIPTION_MODAL: 'open_subscription_modal',
  OPEN_PRIVACY_SETTINGS_MODAL: 'open_privacy_settings_modal',
  OPEN_NOTIFICATIONS_MODAL: 'open_notifications_modal',
  SEARCH: 'search',
  OPEN_LOCATION_PICKER: 'open_location_picker',
  ADD_TODO_BUTTON_PRESSED: 'add_todo_button_pressed',
  FETCH_TODOS_STARTED: 'fetch_todos_started',
  FETCH_TODOS_SKIPPED: 'fetch_todos_skipped',
  FETCH_TODOS_SUCCESS: 'fetch_todos_success',
  FETCH_TODOS_ERROR: 'fetch_todos_error',
  TOGGLE_TODO_STATUS: 'toggle_todo_status',
  TOGGLE_TODO_STATUS_SKIPPED: 'toggle_todo_status_skipped',
  TOGGLE_TODO_STATUS_SUCCESS: 'toggle_todo_status_success',
  TOGGLE_TODO_STATUS_ERROR: 'toggle_todo_status_error',
};

export const logEvent = (eventName: string, params?: Record<string, any>) => {
  console.log(`[Analytics] ${eventName}`, params);
  return Promise.resolve();
};

// Alias for logEvent to maintain compatibility with existing code
export const sendAnalyticsEvent = (eventName: string, params?: Record<string, any>) => {
  return logEvent(eventName, params);
};

export const setCurrentScreen = (screenName: string, screenClass?: string) => {
  return logEvent(Events.SCREEN_VIEW, { screen_name: screenName, screen_class: screenClass });
};

export const trackScreenView = (screenName: string, screenClass?: string) => {
  return setCurrentScreen(screenName, screenClass);
};

export const setUserId = (userId: string | null) => {
  console.log(`[Analytics] Setting user ID: ${userId}`);
  return Promise.resolve();
};

export const sendToTimeFrameAnalytics = (data: any) => {
  console.log(`[Analytics] Sending to timeframe analytics`, data);
  return Promise.resolve();
};