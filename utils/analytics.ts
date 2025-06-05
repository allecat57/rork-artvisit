// Simplified analytics interface
export const Events = {
  APP_START: 'app_start',
  SCREEN_VIEW: 'screen_view',
  AUTH_SESSION_RESTORED: 'auth_session_restored',
  FETCH_TODOS: 'fetch_todos',
  TOGGLE_TODO: 'toggle_todo',
  SELECT_VENUE: 'select_venue',
  SELECT_CATEGORY: 'select_category',
};

export const logEvent = (eventName: string, params?: Record<string, any>) => {
  console.log(`[Analytics] ${eventName}`, params);
  return Promise.resolve();
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