import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUBSCRIPTION_PLANS } from "@/config/stripe";
import * as Analytics from "@/utils/analytics";

import { AccessLevel } from "@/types/event";

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Test user for demo purposes
export const TEST_USER: User = {
  id: "test-user-123",
  email: "test@example.com",
  name: "Test User",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw3NjA4Mjc3NHx8ZW58MHx8fHx8"
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
  updateUser: (updates: Partial<User>) => void;
  
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
          console.log("AuthStore: Starting login process for:", email);
          
          // Handle test user login immediately
          if (email === TEST_USER.email && password === "password") {
            console.log("AuthStore: Logging in test user");
            set({ user: TEST_USER, isAuthenticated: true, isLoading: false });
            
            // Log analytics event
            Analytics.logEvent(Analytics.Events.USER_LOGIN, {
              method: "test_user",
              user_id: TEST_USER.id,
              email: TEST_USER.email
            });
            
            // Set user ID for analytics
            Analytics.setUserId(TEST_USER.id);
            
            console.log("AuthStore: Test user login completed");
            return true;
          }
          
          // For demo purposes, simulate a quick API call
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Create user for any valid email/password combination
          const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
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
          
          console.log("AuthStore: Login completed for:", email);
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
          
          console.log("AuthStore: User logged out");
        } catch (error) {
          console.warn("Logout error:", error);
        }
        
        set({ user: null, isAuthenticated: false, error: null });
      },
      
      signup: async (email: string, name: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          console.log("AuthStore: Starting signup process for:", email);
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            name,
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
          
          console.log("AuthStore: Signup completed for:", email);
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
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const updatedUser = {
          ...currentUser,
          ...updates
        };
        
        set({ user: updatedUser });
        
        // Log analytics event
        Analytics.logEvent('user_profile_updated', {
          user_id: currentUser.id,
          updated_fields: Object.keys(updates)
        });
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
          console.log('AuthStore: ensureTestUserExists called');
          // This is called on app startup to make sure the test user
          // is properly set up for demo purposes
          const { setupTestUserProfile } = get();
          setupTestUserProfile();
          
          // Mark the store as hydrated
          console.log('AuthStore: Marking store as hydrated');
          set({ isHydrated: true });
        } catch (error) {
          console.warn("Error ensuring test user exists:", error);
          // Still mark as hydrated even if setup fails
          console.log('AuthStore: Error occurred, but still marking as hydrated');
          set({ isHydrated: true });
        }
      },
      
      setupTestUserProfile: () => {
        try {
          console.log('AuthStore: setupTestUserProfile called');
          // Import dynamically to avoid circular dependency
          const getProfileStore = () => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            return require("./useProfileStore").useProfileStore.getState();
          };
          
          const profileStore = getProfileStore();
          console.log('AuthStore: Got profile store instance');
          
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        try {
          console.log('AuthStore: onRehydrateStorage called with state:', state);
          if (state) {
            console.log('AuthStore: Setting isHydrated to true during rehydration');
            state.isHydrated = true;
            
            // If user is authenticated, set user ID for analytics
            if (state.user) {
              console.log('AuthStore: User found during rehydration, setting analytics user ID');
              Analytics.setUserId(state.user.id);
            } else {
              console.log('AuthStore: No user found during rehydration');
            }
          } else {
            console.log('AuthStore: No state found during rehydration');
          }
        } catch (error) {
          console.warn("Error during auth store rehydration:", error);
        }
      }
    }
  )
);