import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUBSCRIPTION_PLANS } from "@/config/stripe";
import * as Analytics from "@/utils/analytics";
import { Platform } from "react-native";
import { supabase, isSupabaseConfigured } from "@/config/supabase";
import { AccessLevel } from "@/types/event";

// Subscription interface - moved from useProfileStore to break circular dependency
export interface Subscription {
  id: string;
  name: string;
  price: number;
  renewalDate: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  level?: AccessLevel;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: Subscription;
}

// Test user for demo purposes
export const TEST_USER: User = {
  id: "test-user-123",
  email: "test@example.com",
  name: "Test User",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw3NjA4Mjc3NHx8ZW58MHx8fHx8",
  subscription: {
    id: "collector",
    name: "Master Collector",
    price: 20.00,
    renewalDate: "2023-12-31",
    level: AccessLevel.COLLECTOR
  }
};

// Auth store state interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  error: string | null;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  clearError: () => void;
  setUser: (user: any) => void;
  
  // Test user helpers
  loginAsTestUser: () => void;
  ensureTestUserExists: () => void;
  setupTestUserProfile: () => void;
}

// Create the auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      error: null,
      isLoading: false,
      
      setUser: (user) => {
        try {
          if (!user) {
            set({ user: null, isAuthenticated: false });
            return;
          }
          
          const newUser: User = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name || user.email?.split('@')[0] || "",
            avatar: user.user_metadata?.avatar_url,
          };
          
          set({ user: newUser, isAuthenticated: true });
          
          // Set user ID for analytics
          Analytics.setUserId(newUser.id);
        } catch (error) {
          console.warn("Error setting user:", error);
        }
      },
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if Supabase is configured
          if (isSupabaseConfigured()) {
            try {
              // Use Supabase Auth
              const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              
              if (error) throw error;
              
              if (data.user) {
                // Get user profile from Supabase
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', data.user.id)
                  .single();
                
                if (profileError && profileError.code !== 'PGRST116') {
                  console.warn("Error fetching profile:", profileError);
                }
                
                const newUser: User = {
                  id: data.user.id,
                  email: data.user.email || email,
                  name: profileData?.name || email.split('@')[0],
                  avatar: profileData?.avatar_url,
                  subscription: profileData ? {
                    id: profileData.subscription_id,
                    name: profileData.subscription_name,
                    price: profileData.subscription_price,
                    renewalDate: profileData.subscription_renewal_date,
                    level: profileData.subscription_id as AccessLevel
                  } : undefined
                };
                
                set({ user: newUser, isAuthenticated: true, isLoading: false });
                
                // Log analytics event
                Analytics.logEvent(Analytics.Events.USER_LOGIN, {
                  method: "supabase",
                  user_id: newUser.id,
                  email: newUser.email
                });
                
                // Set user ID for analytics
                Analytics.setUserId(newUser.id);
                
                return true;
              }
            } catch (supabaseError) {
              console.warn("Supabase login failed, falling back to mock auth:", supabaseError);
            }
          }
          
          // If Supabase is not configured or failed, use mock auth
          if (email === TEST_USER.email && password === "password") {
            set({ user: TEST_USER, isAuthenticated: true, isLoading: false });
            
            // Log analytics event
            Analytics.logEvent(Analytics.Events.USER_LOGIN, {
              method: "test_user",
              user_id: TEST_USER.id,
              email: TEST_USER.email
            });
            
            // Set user ID for analytics
            Analytics.setUserId(TEST_USER.id);
            
            return true;
          }
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // For demo purposes, any email/password combination works
          const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            subscription: {
              id: "free",
              name: "Free Access",
              price: 0,
              renewalDate: "Never",
              level: AccessLevel.FREE
            }
          };
          
          set({ user: newUser, isAuthenticated: true, isLoading: false });
          
          // Log analytics event
          Analytics.logEvent(Analytics.Events.USER_LOGIN, {
            method: "demo_mode",
            user_id: newUser.id,
            email: newUser.email
          });
          
          // Set user ID for analytics
          Analytics.setUserId(newUser.id);
          
          return true;
        } catch (error: any) {
          console.error("Login error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to login. Please try again.", 
            isLoading: false 
          });
          
          // Log analytics event for login failure
          Analytics.logEvent("login_error", {
            error_message: error instanceof Error ? error.message : "Unknown error",
            email: email
          });
          
          return false;
        }
      },
      
      logout: async () => {
        try {
          // Get current user ID before logout for analytics
          const userId = get().user?.id;
          
          // Clear user ID from analytics
          Analytics.setUserId(null);
          
          // Log analytics event
          Analytics.logEvent(Analytics.Events.USER_LOGOUT, {
            user_id: userId
          });
          
          // If Supabase is configured, sign out
          if (isSupabaseConfigured()) {
            try {
              await supabase.auth.signOut();
            } catch (error) {
              console.warn("Supabase logout error:", error);
            }
          }
        } catch (error) {
          console.warn("Logout error:", error);
        }
        
        set({ user: null, isAuthenticated: false, error: null });
      },
      
      signup: async (email: string, name: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Check if Supabase is configured
          if (isSupabaseConfigured()) {
            try {
              // Use Supabase Auth
              const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                  data: {
                    name,
                  },
                },
              });
              
              if (error) throw error;
              
              if (data.user) {
                // Create a profile in the profiles table
                const { error: profileError } = await supabase
                  .from('profiles')
                  .insert([
                    {
                      id: data.user.id,
                      name,
                      email,
                      subscription_id: 'free',
                      subscription_name: 'Free Access',
                      subscription_price: 0,
                      subscription_renewal_date: 'Never',
                    },
                  ]);
                
                if (profileError) {
                  console.warn("Error creating profile:", profileError);
                }
                
                const newUser: User = {
                  id: data.user.id,
                  email: data.user.email || email,
                  name,
                  subscription: {
                    id: "free",
                    name: "Free Access",
                    price: 0,
                    renewalDate: "Never",
                    level: AccessLevel.FREE
                  }
                };
                
                set({ user: newUser, isAuthenticated: true, isLoading: false });
                
                // Log analytics event
                Analytics.logEvent(Analytics.Events.USER_SIGNUP, {
                  method: "supabase",
                  user_id: newUser.id,
                  email: newUser.email
                });
                
                // Set user ID for analytics
                Analytics.setUserId(newUser.id);
                
                return true;
              }
            } catch (supabaseError) {
              console.warn("Supabase signup failed, falling back to mock auth:", supabaseError);
            }
          }
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name,
            subscription: {
              id: "free",
              name: "Free Access",
              price: 0,
              renewalDate: "Never",
              level: AccessLevel.FREE
            }
          };
          
          set({ user: newUser, isAuthenticated: true, isLoading: false });
          
          // Log analytics event
          Analytics.logEvent(Analytics.Events.USER_SIGNUP, {
            method: "demo_mode",
            user_id: newUser.id,
            email: newUser.email
          });
          
          // Set user ID for analytics
          Analytics.setUserId(newUser.id);
          
          return true;
        } catch (error: any) {
          console.error("Registration error:", error);
          set({ 
            error: error instanceof Error ? error.message : "Failed to create account. Please try again.", 
            isLoading: false 
          });
          
          // Log analytics event for signup failure
          Analytics.logEvent("signup_error", {
            error_message: error instanceof Error ? error.message : "Unknown error",
            email: email
          });
          
          return false;
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      loginAsTestUser: () => {
        try {
          set({ user: TEST_USER, isAuthenticated: true, error: null });
          
          // Log analytics event
          Analytics.logEvent(Analytics.Events.USER_LOGIN, {
            method: "test_user_direct",
            user_id: TEST_USER.id,
            email: TEST_USER.email
          });
          
          // Set user ID for analytics
          Analytics.setUserId(TEST_USER.id);
          
          // Ensure the test user has the proper profile setup
          setTimeout(() => {
            try {
              get().setupTestUserProfile();
            } catch (error) {
              console.warn("Error setting up test user profile:", error);
            }
          }, 100);
        } catch (error) {
          console.warn("Error logging in as test user:", error);
        }
      },
      
      ensureTestUserExists: () => {
        try {
          // This is called on app startup to make sure the test user
          // is properly set up for demo purposes
          const { setupTestUserProfile } = get();
          setupTestUserProfile();
          
          // Mark the store as hydrated
          set({ isHydrated: true });
        } catch (error) {
          console.warn("Error ensuring test user exists:", error);
          // Still mark as hydrated even if setup fails
          set({ isHydrated: true });
        }
      },
      
      setupTestUserProfile: () => {
        try {
          // Import dynamically to avoid circular dependency
          // Use a function to get the store state instead of importing the module directly
          const getProfileStore = () => {
            // This is a workaround to avoid circular dependency issues
            // We're dynamically accessing the profile store only when needed
            return require("./useProfileStore").useProfileStore.getState();
          };
          
          const profileStore = getProfileStore();
          
          // Set up the test user's payment method (American Express)
          profileStore.setPaymentMethodForUser(TEST_USER.id, {
            cardType: "American Express",
            last4: "0005",
            expirationDate: "07/27",
            stripePaymentMethodId: "pm_test_amex_123456789"
          });
          
          // Set up the test user's subscription (Master Collector)
          profileStore.setSubscriptionForUser(TEST_USER.id, {
            id: "collector",
            name: "Master Collector",
            price: 20.00,
            renewalDate: "2023-12-31",
            stripeSubscriptionId: "sub_test_collector_123456789",
            stripePriceId: SUBSCRIPTION_PLANS.collector.stripePriceId,
            level: AccessLevel.COLLECTOR
          });
          
          // Set up the test user's Stripe customer ID
          profileStore.setStripeCustomerIdForUser(TEST_USER.id, "cus_test_123456789");
          
          console.log("Test user profile set up successfully");
          
          // Log analytics event
          Analytics.logEvent("test_user_profile_setup", {
            user_id: TEST_USER.id
          });
        } catch (error) {
          console.warn("Error setting up test user profile:", error);
        }
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the user and authentication state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      // When the store is hydrated from storage, mark it as hydrated
      onRehydrateStorage: () => (state) => {
        try {
          if (state) {
            state.isHydrated = true;
            
            // If user is authenticated, set user ID for analytics
            if (state.user) {
              Analytics.setUserId(state.user.id);
            }
          }
        } catch (error) {
          console.warn("Error during auth store rehydration:", error);
        }
      }
    }
  )
);