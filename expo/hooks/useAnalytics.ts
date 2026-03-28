import { useCallback } from 'react';
import * as Analytics from '../utils/analytics';

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, eventParams?: Record<string, any>) => {
    Analytics.logEvent(eventName, eventParams);
  }, []);

  const trackScreenView = useCallback((screenName: string, screenClass?: string) => {
    Analytics.logScreenView(screenName, { screenClass });
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    Analytics.setUserProperties(properties);
  }, []);

  const setUserId = useCallback((userId: string | null) => {
    Analytics.setUserId(userId);
  }, []);

  const logError = useCallback((error: Error, fatal: boolean = false) => {
    Analytics.logError(error, fatal);
  }, []);

  return {
    trackEvent,
    trackScreenView,
    setUserProperties,
    setUserId,
    logError,
    events: Analytics.Events
  };
}

export default useAnalytics;