import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SUBSCRIPTION_PLANS } from "@/config/stripe";
import * as Analytics from "@/utils/analytics";
import { supabase, isSupabaseConfigured, TABLES } from "@/config/supabase";
// Import type only to avoid circular dependency
import type { Subscription } from "./useAuthStore";

interface PaymentMethod {
  cardType: string;
  last4: string;
  expirationDate: string;
  stripePaymentMethodId?: string; // Added for Stripe integration
}

interface UserProfile {
  userId: string;
  profileImage: string | null;
  paymentMethod: PaymentMethod | null;
  subscription: Subscription | null;
  stripeCustomerId?: string; // Added for Stripe integration
}

interface ProfileState {
  profiles: Record<string, UserProfile>;
  
  // Current user getters (derived from auth store)
  getCurrentProfile: () => UserProfile | null;
  getCurrentProfileImage: () => string | null;
  getCurrentPaymentMethod: () => PaymentMethod | null;
  getCurrentSubscription: () => Subscription | null;
  getCurrentStripeCustomerId: () => string | null; // Added for Stripe integration
  
  // Actions
  setProfileImage: (imageUri: string | null) => void;
  setPaymentMethod: (paymentMethod: PaymentMethod | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setStripeCustomerId: (customerId: string) => void; // Added for Stripe integration
  ensureDefaultSubscription: () => void;
  getProfileByUserId: (userId: string) => UserProfile | null;
  
  // Direct user profile manipulation (for test user setup)
  setPaymentMethodForUser: (userId: string, paymentMethod: PaymentMethod | null) => void;
  setSubscriptionForUser: (userId: string, subscription: Subscription | null) => void;
  setStripeCustomerIdForUser: (userId: string, customerId: string) => void; // Added for Stripe integration
}

// Helper to get current user ID from auth store
const getCurrentUserId = (): string | null => {
  try {
    // Import dynamically to avoid circular dependency
    const { useAuthStore } = require("./useAuthStore");
    const user = useAuthStore.getState().user;
    return user?.id || null;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
};

// Create a default profile for a user
const createDefaultProfile = (userId: string): UserProfile => ({
  userId,
  profileImage: null,
  paymentMethod: null,
  subscription: {
    id: "free",
    name: "Free Access",
    price: 0,
    renewalDate: "Never"
  },
});

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: {},
      
      getCurrentProfile: () => {
        const userId = getCurrentUserId();
        if (!userId) return null;
        
        const profiles = get().profiles;
        
        // If Supabase is configured, try to fetch from Supabase
        if (isSupabaseConfigured()) {
          // This would normally be an async operation, but for simplicity
          // we'll use the local cache and update it in the background
          supabase
            .from(TABLES.PROFILES)
            .select('*')
            .eq('user_id', userId)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching profile from Supabase:", error);
                return;
              }
              
              if (data) {
                // Update the local cache with Supabase data
                const updatedProfile: UserProfile = {
                  userId: data.user_id,
                  profileImage: data.profile_image,
                  paymentMethod: data.payment_method,
                  subscription: {
                    id: data.subscription_id,
                    name: data.subscription_name,
                    price: data.subscription_price,
                    renewalDate: data.subscription_renewal_date,
                    stripeSubscriptionId: data.stripe_subscription_id,
                    stripePriceId: data.stripe_price_id
                  },
                  stripeCustomerId: data.stripe_customer_id
                };
                
                set((state) => ({
                  profiles: {
                    ...state.profiles,
                    [userId]: updatedProfile
                  }
                }));
              }
            });
        }
        
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
      
      getProfileByUserId: (userId: string) => {
        if (!userId) return null;
        const profiles = get().profiles;
        
        // If Supabase is configured, try to fetch from Supabase
        if (isSupabaseConfigured()) {
          // This would normally be an async operation, but for simplicity
          // we'll use the local cache and update it in the background
          supabase
            .from(TABLES.PROFILES)
            .select('*')
            .eq('user_id', userId)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching profile from Supabase:", error);
                return;
              }
              
              if (data) {
                // Update the local cache with Supabase data
                const updatedProfile: UserProfile = {
                  userId: data.user_id,
                  profileImage: data.profile_image,
                  paymentMethod: data.payment_method,
                  subscription: {
                    id: data.subscription_id,
                    name: data.subscription_name,
                    price: data.subscription_price,
                    renewalDate: data.subscription_renewal_date,
                    stripeSubscriptionId: data.stripe_subscription_id,
                    stripePriceId: data.stripe_price_id
                  },
                  stripeCustomerId: data.stripe_customer_id
                };
                
                set((state) => ({
                  profiles: {
                    ...state.profiles,
                    [userId]: updatedProfile
                  }
                }));
              }
            });
        }
        
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
        const userId = getCurrentUserId();
        if (!userId) return null;
        
        const profiles = get().profiles;
        return profiles[userId]?.profileImage || null;
      },
      
      getCurrentPaymentMethod: () => {
        const userId = getCurrentUserId();
        if (!userId) return null;
        
        const profiles = get().profiles;
        return profiles[userId]?.paymentMethod || null;
      },
      
      getCurrentSubscription: () => {
        const userId = getCurrentUserId();
        if (!userId) return null;
        
        const profiles = get().profiles;
        
        // If user exists but has no subscription, create a default one
        if (profiles[userId] && !profiles[userId].subscription) {
          const updatedProfile = {
            ...profiles[userId],
            subscription: {
              id: "free",
              name: "Free Access",
              price: 0,
              renewalDate: "Never"
            }
          };
          
          set((state) => ({
            profiles: {
              ...state.profiles,
              [userId]: updatedProfile
            }
          }));
          
          return updatedProfile.subscription;
        }
        
        return profiles[userId]?.subscription || null;
      },
      
      getCurrentStripeCustomerId: () => {
        const userId = getCurrentUserId();
        if (!userId) return null;
        
        const profiles = get().profiles;
        return profiles[userId]?.stripeCustomerId || null;
      },
      
      setProfileImage: (imageUri) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentProfile = state.profiles[userId] || createDefaultProfile(userId);
          
          // Log analytics event
          Analytics.logEvent('profile_image_updated', {
            has_image: !!imageUri
          });
          
          // If Supabase is configured, update the profile in Supabase
          if (isSupabaseConfigured()) {
            supabase
              .from(TABLES.PROFILES)
              .update({ profile_image: imageUri })
              .eq('user_id', userId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating profile image in Supabase:", error);
                }
              });
          }
          
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                ...currentProfile,
                profileImage: imageUri
              }
            }
          };
        });
      },
      
      setPaymentMethod: (paymentMethod) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentProfile = state.profiles[userId] || createDefaultProfile(userId);
          
          // Log analytics event
          Analytics.logEvent('payment_method_updated', {
            card_type: paymentMethod?.cardType || 'none',
            has_stripe_id: !!paymentMethod?.stripePaymentMethodId
          });
          
          // If Supabase is configured, update the payment method in Supabase
          if (isSupabaseConfigured()) {
            supabase
              .from(TABLES.PROFILES)
              .update({ payment_method: paymentMethod })
              .eq('user_id', userId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating payment method in Supabase:", error);
                }
              });
          }
          
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                ...currentProfile,
                paymentMethod
              }
            }
          };
        });
        
        console.log(`Payment method set for current user:`, paymentMethod);
      },
      
      setPaymentMethodForUser: (userId, paymentMethod) => {
        if (!userId) return;
        
        set((state) => {
          const currentProfile = state.profiles[userId] || createDefaultProfile(userId);
          
          // If Supabase is configured, update the payment method in Supabase
          if (isSupabaseConfigured()) {
            supabase
              .from(TABLES.PROFILES)
              .update({ payment_method: paymentMethod })
              .eq('user_id', userId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating payment method in Supabase:", error);
                }
              });
          }
          
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                ...currentProfile,
                paymentMethod
              }
            }
          };
        });
        
        console.log(`Payment method set for user ${userId}:`, paymentMethod);
      },
      
      setSubscription: (subscription) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentProfile = state.profiles[userId] || createDefaultProfile(userId);
          
          // Log analytics event
          Analytics.logEvent('subscription_updated', {
            subscription_id: subscription?.id || 'none',
            subscription_name: subscription?.name || 'none',
            price: subscription?.price || 0,
            has_stripe_subscription_id: !!subscription?.stripeSubscriptionId
          });
          
          // If Supabase is configured, update the subscription in Supabase
          if (isSupabaseConfigured() && subscription) {
            supabase
              .from(TABLES.PROFILES)
              .update({
                subscription_id: subscription.id,
                subscription_name: subscription.name,
                subscription_price: subscription.price,
                subscription_renewal_date: subscription.renewalDate,
                stripe_subscription_id: subscription.stripeSubscriptionId,
                stripe_price_id: subscription.stripePriceId
              })
              .eq('user_id', userId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating subscription in Supabase:", error);
                }
              });
          }
          
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                ...currentProfile,
                subscription
              }
            }
          };
        });
        
        console.log(`Subscription set for current user:`, subscription);
      },
      
      setSubscriptionForUser: (userId, subscription) => {
        if (!userId) return;
        
        set((state) => {
          const currentProfile = state.profiles[userId] || createDefaultProfile(userId);
          
          // If Supabase is configured, update the subscription in Supabase
          if (isSupabaseConfigured() && subscription) {
            supabase
              .from(TABLES.PROFILES)
              .update({
                subscription_id: subscription.id,
                subscription_name: subscription.name,
                subscription_price: subscription.price,
                subscription_renewal_date: subscription.renewalDate,
                stripe_subscription_id: subscription.stripeSubscriptionId,
                stripe_price_id: subscription.stripePriceId
              })
              .eq('user_id', userId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating subscription in Supabase:", error);
                }
              });
          }
          
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                ...currentProfile,
                subscription
              }
            }
          };
        });
        
        console.log(`Subscription set for user ${userId}:`, subscription);
      },
      
      setStripeCustomerId: (customerId) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentProfile = state.profiles[userId] || createDefaultProfile(userId);
          
          // Log analytics event
          Analytics.logEvent('stripe_customer_id_set', {
            customer_id: customerId
          });
          
          // If Supabase is configured, update the Stripe customer ID in Supabase
          if (isSupabaseConfigured()) {
            supabase
              .from(TABLES.PROFILES)
              .update({ stripe_customer_id: customerId })
              .eq('user_id', userId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating Stripe customer ID in Supabase:", error);
                }
              });
          }
          
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                ...currentProfile,
                stripeCustomerId: customerId
              }
            }
          };
        });
        
        console.log(`Stripe customer ID set for current user:`, customerId);
      },
      
      setStripeCustomerIdForUser: (userId, customerId) => {
        if (!userId) return;
        
        set((state) => {
          const currentProfile = state.profiles[userId] || createDefaultProfile(userId);
          
          // If Supabase is configured, update the Stripe customer ID in Supabase
          if (isSupabaseConfigured()) {
            supabase
              .from(TABLES.PROFILES)
              .update({ stripe_customer_id: customerId })
              .eq('user_id', userId)
              .then(({ error }) => {
                if (error) {
                  console.error("Error updating Stripe customer ID in Supabase:", error);
                }
              });
          }
          
          return {
            profiles: {
              ...state.profiles,
              [userId]: {
                ...currentProfile,
                stripeCustomerId: customerId
              }
            }
          };
        });
        
        console.log(`Stripe customer ID set for user ${userId}:`, customerId);
      },
      
      ensureDefaultSubscription: () => {
        const userId = getCurrentUserId();
        if (!userId) {
          console.log("Cannot ensure default subscription: No user ID found");
          return;
        }
        
        // Special case for test user - ensure they have the collector subscription
        if (userId === "test-user-123") {
          const testUserProfile = get().getProfileByUserId("test-user-123");
          if (!testUserProfile || !testUserProfile.subscription || testUserProfile.subscription.id !== "collector") {
            console.log("Ensuring test user has collector subscription");
            // Import dynamically to avoid circular dependency
            const { useAuthStore } = require("./useAuthStore");
            useAuthStore.getState().setupTestUserProfile();
            return;
          }
        }
        
        set((state) => {
          // If user exists but has no profile or no subscription, set the free tier
          const currentProfile = state.profiles[userId];
          
          if (!currentProfile || !currentProfile.subscription) {
            console.log(`Creating default profile for user ${userId}`);
            const updatedProfile = currentProfile || createDefaultProfile(userId);
            
            if (!updatedProfile.subscription) {
              updatedProfile.subscription = {
                id: "free",
                name: "Free Access",
                price: 0,
                renewalDate: "Never"
              };
              
              // Log analytics event
              Analytics.logEvent('default_subscription_created', {
                user_id: userId
              });
              
              // If Supabase is configured, create a default profile in Supabase
              if (isSupabaseConfigured()) {
                supabase
                  .from(TABLES.PROFILES)
                  .upsert({
                    user_id: userId,
                    subscription_id: "free",
                    subscription_name: "Free Access",
                    subscription_price: 0,
                    subscription_renewal_date: "Never"
                  })
                  .then(({ error }) => {
                    if (error) {
                      console.error("Error creating default profile in Supabase:", error);
                    }
                  });
              }
            }
            
            return {
              profiles: {
                ...state.profiles,
                [userId]: updatedProfile
              }
            };
          }
          
          return state;
        });
      },
    }),
    {
      name: "profile-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Persist the entire profiles object to ensure it survives across sessions
      // This is critical for maintaining payment and subscription data across logouts
      partialize: (state) => ({
        profiles: state.profiles
      })
    }
  )
);