import { Platform } from 'react-native';

// Analytics events constants
export const Events = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_SIGNUP: 'user_signup',
  SCREEN_VIEW: 'screen_view',
  BUTTON_CLICK: 'button_click',
  VENUE_VIEW: 'venue_view',
  RESERVATION_CREATE: 'reservation_create',
  RESERVATION_CANCEL: 'reservation_cancel',
  PURCHASE_COMPLETE: 'purchase_complete',
  EVENT_REGISTER: 'event_register',
  SEARCH_PERFORM: 'search_perform',
  FAVORITE_ADD: 'favorite_add',
  FAVORITE_REMOVE: 'favorite_remove',
  OPEN_HELP_CENTER: 'open_help_center',
  CREATE_RESERVATION: 'create_reservation',
  MODIFY_RESERVATION: 'modify_reservation',
} as const;

// Analytics interface
interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

// Mock analytics implementation for development
class MockAnalytics {
  private userId: string | null = null;
  private userProperties: Record<string, any> = {};

  logEvent(eventName: string, parameters?: Record<string, any>) {
    if (__DEV__) {
      console.log('📊 Analytics Event:', eventName, parameters);
    }
  }

  setUserId(userId: string | null) {
    this.userId = userId;
    if (__DEV__) {
      console.log('👤 Analytics User ID:', userId);
    }
  }

  setUserProperties(properties: Record<string, any>) {
    this.userProperties = { ...this.userProperties, ...properties };
    if (__DEV__) {
      console.log('👤 Analytics User Properties:', this.userProperties);
    }
  }

  logScreenView(screenName: string, screenClass?: string) {
    this.logEvent(Events.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }
}

// Create analytics instance
const analytics = new MockAnalytics();

// Export analytics functions
export const logEvent = (eventName: string, parameters?: Record<string, any>) => {
  analytics.logEvent(eventName, parameters);
};

export const setUserId = (userId: string | null) => {
  analytics.setUserId(userId);
};

export const setUserProperties = (properties: Record<string, any>) => {
  analytics.setUserProperties(properties);
};

export const logScreenView = (screenName: string, screenClass?: string) => {
  analytics.logScreenView(screenName, screenClass);
};

// Export default analytics instance
export default analytics;