import * as Analytics from '@/utils/analytics';
import { Alert } from 'react-native';

/**
 * Generic API utility functions
 * Note: Supabase has been removed from this project
 */

/**
 * Helper function to show user-friendly error messages
 */
export const showApiError = (operation: string, error: any) => {
  console.error(`${operation} failed:`, error);
  
  // Log error
  Analytics.logEvent('api_error', {
    operation,
    error: error instanceof Error ? error.message : 'Unknown error'
  });

  // Show user-friendly error only in development
  if (__DEV__) {
    Alert.alert(
      "API Error", 
      `Unable to ${operation.toLowerCase()}. Please check your connection and try again.`
    );
  }
};

/**
 * Helper function to log successful API operations
 */
export const logApiSuccess = (operation: string, details: any = {}) => {
  console.log(`${operation} successful:`, details);
  
  Analytics.logEvent('api_success', {
    operation,
    ...details
  });
};