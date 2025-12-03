import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUBSCRIPTION_PLANS } from "@/config/stripe";
import * as Analytics from "@/utils/analytics";

import { AccessLevel } from "@/types/event";

// Subscription interface
export interface Subscription {
  id: string;
  name: string;
  price: number;
  renewalDate: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  level?: AccessLevel;
}

interface PaymentMethod {
  cardType: string;
  last4: string;
  expirationDate: string;
  stripePaymentMethodId?: string;
}

interface UserProfile {
  userId: string;
  profileImage: string | null;
  paymentMethod: PaymentMethod | null;
  subscription: Subscription | null;
  stripeCustomerId?: string;
}

interface ProfileState {
  profiles: Record<string, UserProfile>;
  
  // Current user getters (require userId parameter to avoid circular dependencies)
  getCurrentProfile: () => UserProfile | null;
  getCurrentProfileImage: () => string | null;
  getCurrentPaymentMethod: () => PaymentMethod | null;
  getCurrentSubscription: () => Subscription | null;
  getCurrentStripeCustomerId: () => string | null;
  
  // Actions
  setProfileImage: (imageUri: string | null, userId?: string) => void;
  setPaymentMethod: (paymentMethod: PaymentMethod | null, userId?: string) => void;
  setSubscription: (subscription: Subscription | null, userId?: string) => void;
  setStripeCustomerId: (customerId: string, userId?: string) => void;
  ensureDefaultSubscription: (userId?: string) => void;
  getProfileByUserId: (userId: string) => UserProfile | null;
  
  // Direct user profile manipulation (for test user setup)
  setPaymentMethodForUser: (userId: string, paymentMethod: PaymentMethod | null) => void;
  setSubscriptionForUser: (userId: string, subscription: Subscription | null) => void;
  setStripeCustomerIdForUser: (userId: string, customerId: string) => void;
}

// Create a default profile for a user
const createDefaultProfile = (userId: string): UserProfile => ({
  userId,
  profileImage: null,
  paymentMethod: null,
  subscription: {
    id: "free",
    name: "Free Access",
    price: 0,
    renewalDate: "Never",
    level: AccessLevel.FREE
  },
});

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: {},
      
      getCurrentProfile: () => {
        try {
          // Import dynamically to avoid circular dependency
          const { useAuthStore } = require("./useAuthStore");
          const user = useAuthStore.getState().user;
          const userId = user?.id;
          
          if (!userId) return null;
          
          const profiles = get().profiles;
          
          // If user exists but has no profile, create a default one
          if (!profiles[userId]) {
            const defaultProfile = createDefaultProfile(userId);
            set((state) => ({
              profiles: {
                ...state.profiles,
                [userId]: defaultProfile
              }
            }));
            return defaultProfile;
          }
          
          return profiles[userId];
        } catch (error) {
          console.error("Error getting current profile:", error);
          return null;
        }
      },
      
      getProfileByUserId: (userId: string) => {
        if (!userId) return null;
        const profiles = get().profiles;
        
        // If user exists but has no profile, create a default one
        if (!profiles[userId]) {
          const defaultProfile = createDefaultProfile(userId);
          set((state) => ({
            profiles: {
              ...state.profiles,
              [userId]: defaultProfile
            }
          }));
          return defaultProfile;
        }
        
        return profiles[userId];
      },
      
      getCurrentProfileImage: () => {
        try {
          const profile = get().getCurrentProfile();
          return profile?.profileImage || null;
        } catch (error) {
          console.error("Error getting current profile image:", error);
          return null;
        }
      },
      
      getCurrentPaymentMethod: () => {
        try {
          const profile = get().getCurrentProfile();
          return profile?.paymentMethod || null;
        } catch (error) {
          console.error("Error getting current payment method:", error);
          return null;
        }
      },
      
      getCurrentSubscription: () => {
        try {
          const profile = get().getCurrentProfile();
          return profile?.subscription || null;
        } catch (error) {
          console.error("Error getting current subscription:", error);
          return null;
        }
      },
      
      getCurrentStripeCustomerId: () => {
        try {
          const profile = get().getCurrentProfile();
          return profile?.stripeCustomerId || null;
        } catch (error) {
          console.error("Error getting current stripe customer ID:", error);
          return null;
        }
      },
      
      setProfileImage: (imageUri, userId) => {
        try {
          let targetUserId = userId;
          
          if (!targetUserId) {
            const { useAuthStore } = require("./useAuthStore");
            const user = useAuthStore.getState().user;
            targetUserId = user?.id;
          }
          
          if (!targetUserId) return;
          
          set((state) => {
            if (!targetUserId) return state;
            const currentProfile = state.profiles[targetUserId] || createDefaultProfile(targetUserId);
            
            // Log analytics event
            Analytics.logEvent('profile_image_updated', {
              has_image: !!imageUri
            });
            
            return {
              profiles: {
                ...state.profiles,
                [targetUserId]: {
                  ...currentProfile,
                  profileImage: imageUri
                }
              }
            };
          });
        } catch (error) {
          console.error("Error setting profile image:", error);
        }
      },
      
      setPaymentMethod: (paymentMethod, userId) => {
        try {
          let targetUserId = userId;
          
          if (!targetUserId) {
            const { useAuthStore } = require("./useAuthStore");
            const user = useAuthStore.getState().user;
            targetUserId = user?.id;
          }
          
          if (!targetUserId) return;
          
          set((state) => {
            if (!targetUserId) return state;
            const currentProfile = state.profiles[targetUserId] || createDefaultProfile(targetUserId);
            
            // Log analytics event
            Analytics.logEvent('payment_method_updated', {
              card_type: paymentMethod?.cardType || 'none',
              has_stripe_id: !!paymentMethod?.stripePaymentMethodId
            });
            
            return {
              profiles: {
                ...state.profiles,
                [targetUserId]: {
                  ...currentProfile,
                  paymentMethod
                }
              }
            };
          });
          
          console.log(`Payment method set for user ${targetUserId}:`, paymentMethod);
        } catch (error) {
          console.error("Error setting payment method:", error);
        }
      },
      
      setPaymentMethodForUser: (userId, paymentMethod) => {
        if (!userId) return;
        get().setPaymentMethod(paymentMethod, userId);
      },
      
      setSubscription: (subscription, userId) => {
        try {
          let targetUserId = userId;
          
          if (!targetUserId) {
            const { useAuthStore } = require("./useAuthStore");
            const user = useAuthStore.getState().user;
            targetUserId = user?.id;
          }
          
          if (!targetUserId) return;
          
          set((state) => {
            if (!targetUserId) return state;
            const currentProfile = state.profiles[targetUserId] || createDefaultProfile(targetUserId);
            
            // Log analytics event
            Analytics.logEvent('subscription_updated', {
              subscription_id: subscription?.id || 'none',
              subscription_name: subscription?.name || 'none',
              price: subscription?.price || 0,
              has_stripe_subscription_id: !!subscription?.stripeSubscriptionId
            });
            
            return {
              profiles: {
                ...state.profiles,
                [targetUserId]: {
                  ...currentProfile,
                  subscription
                }
              }
            };
          });
          
          console.log(`Subscription set for user ${targetUserId}:`, subscription);
        } catch (error) {
          console.error("Error setting subscription:", error);
        }
      },
      
      setSubscriptionForUser: (userId, subscription) => {
        if (!userId) return;
        get().setSubscription(subscription, userId);
      },
      
      setStripeCustomerId: (customerId, userId) => {
        try {
          let targetUserId = userId;
          
          if (!targetUserId) {
            const { useAuthStore } = require("./useAuthStore");
            const user = useAuthStore.getState().user;
            targetUserId = user?.id;
          }
          
          if (!targetUserId) return;
          
          set((state) => {
            if (!targetUserId) return state;
            const currentProfile = state.profiles[targetUserId] || createDefaultProfile(targetUserId);
            
            // Log analytics event
            Analytics.logEvent('stripe_customer_id_set', {
              customer_id: customerId
            });
            
            return {
              profiles: {
                ...state.profiles,
                [targetUserId]: {
                  ...currentProfile,
                  stripeCustomerId: customerId
                }
              }
            };
          });
          
          console.log(`Stripe customer ID set for user ${targetUserId}:`, customerId);
        } catch (error) {
          console.error("Error setting stripe customer ID:", error);
        }
      },
      
      setStripeCustomerIdForUser: (userId, customerId) => {
        if (!userId) return;
        get().setStripeCustomerId(customerId, userId);
      },
      
      ensureDefaultSubscription: (userId) => {
        try {
          let targetUserId = userId;
          
          if (!targetUserId) {
            const { useAuthStore } = require("./useAuthStore");
            const user = useAuthStore.getState().user;
            targetUserId = user?.id;
          }
          
          if (!targetUserId) {
            console.log("Cannot ensure default subscription: No user ID found");
            return;
          }
          
          console.log(`ProfileStore: Ensuring default subscription for user ${targetUserId}`);
          
          // Special case for test user - they should already have collector subscription
          if (targetUserId === "test-user-123") {
            const testUserProfile = get().getProfileByUserId("test-user-123");
            if (testUserProfile && testUserProfile.subscription && testUserProfile.subscription.id === "collector") {
              console.log("Test user already has collector subscription");
              return;
            }
            console.log("Setting up test user collector subscription");
            // Set up collector subscription directly without calling setupTestUserProfile
            get().setSubscriptionForUser("test-user-123", {
              id: "collector",
              name: "Master Collector",
              price: 20.00,
              renewalDate: "2023-12-31",
              stripeSubscriptionId: "sub_test_collector_123456789",
              stripePriceId: SUBSCRIPTION_PLANS.collector.stripePriceId,
              level: AccessLevel.COLLECTOR
            });
            return;
          }
          
          // For other users, ensure they have a free subscription
          const currentProfile = get().profiles[targetUserId];
          if (!currentProfile || !currentProfile.subscription) {
            console.log(`Creating default free subscription for user ${targetUserId}`);
            get().setSubscriptionForUser(targetUserId, {
              id: "free",
              name: "Free Access",
              price: 0,
              renewalDate: "Never",
              level: AccessLevel.FREE
            });
            
            // Log analytics event
            Analytics.logEvent('default_subscription_created', {
              user_id: targetUserId
            });
          }
        } catch (error) {
          console.error("Error ensuring default subscription:", error);
        }
      },
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profiles: state.profiles
      })
    }
  )
);