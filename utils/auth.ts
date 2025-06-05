import { supabase } from '@/lib/supabase';
import * as Analytics from '@/utils/analytics';

/**
 * Get the current session user ID
 */
export const getSessionUserId = async (): Promise<string | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id || null;
  } catch (error) {
    console.error('Error getting session user ID:', error);
    return null;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Log to analytics
    Analytics.logEvent('user_login', {
      method: 'email',
      user_id: data.user?.id
    });
    
    return data;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    
    // Log to analytics
    Analytics.logEvent('user_signup', {
      method: 'email',
      user_id: data.user?.id
    });
    
    return data;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    // Get user ID before signing out
    const userId = await getSessionUserId();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Log to analytics
    if (userId) {
      Analytics.logEvent('user_logout', {
        user_id: userId
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) throw error;
    
    // Log to analytics
    Analytics.logEvent('password_reset_requested', {
      email
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: any) => {
  try {
    const userId = await getSessionUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to update profile');
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    
    // Log to analytics
    Analytics.logEvent('profile_updated', {
      user_id: userId,
      fields_updated: Object.keys(updates)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  try {
    const userId = await getSessionUserId();
    
    if (!userId) {
      throw new Error('User must be logged in to get profile');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};