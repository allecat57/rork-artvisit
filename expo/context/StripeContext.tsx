import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Platform } from 'react-native';
import { STRIPE_PUBLISHABLE_KEY, STRIPE_API_URL, STRIPE_ENDPOINTS, isStripeConfigured } from '@/config/stripe';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import * as Analytics from '@/utils/analytics';

// Define the shape of our Stripe context
interface StripeContextType {
  isLoading: boolean;
  isStripeInitialized: boolean;
  createPaymentMethod: (cardDetails: any) => Promise<any>;
  createPaymentIntent: (amount: number, currency: string, paymentMethodId: string) => Promise<any>;
  processPayment: (amount: number, currency: string) => Promise<any>;
  createSubscription: (priceId: string, paymentMethodId: string) => Promise<any>;
  updateSubscription: (subscriptionId: string, newPriceId: string) => Promise<any>;
  cancelSubscription: (subscriptionId: string) => Promise<any>;
  retrievePaymentMethod: (paymentMethodId: string) => Promise<any>;
}

// Create the context with a default value
const StripeContext = createContext<StripeContextType>({
  isLoading: false,
  isStripeInitialized: false,
  createPaymentMethod: async () => ({}),
  createPaymentIntent: async () => ({}),
  processPayment: async () => ({}),
  createSubscription: async () => ({}),
  updateSubscription: async () => ({}),
  cancelSubscription: async () => ({}),
  retrievePaymentMethod: async () => ({}),
});

// Custom hook to use the Stripe context
export const useStripe = () => useContext(StripeContext);

// Props for the StripeProvider component
interface StripeProviderProps {
  children: ReactNode;
}

// The StripeProvider component
export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeInitialized, setIsStripeInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const { user } = useAuthStore();
  const { getCurrentStripeCustomerId, setStripeCustomerId } = useProfileStore();
  
  // Initialize Stripe when the component mounts
  useEffect(() => {
    const initializeStripe = async () => {
      if (!isStripeConfigured()) {
        console.warn('Stripe is not properly configured. Check your publishable key.');
        return;
      }

      try {
        // For simplicity, we'll just set initialized to true
        console.log('Stripe initialized successfully');
        setIsStripeInitialized(true);
        
        // Log analytics event
        Analytics.logEvent('stripe_initialized', {
          success: true
        });
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        
        // Log analytics event
        Analytics.logEvent('stripe_initialization_failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    initializeStripe();
  }, []);

  // Create a payment method with Stripe
  const createPaymentMethod = async (cardDetails: any) => {
    setIsLoading(true);
    
    try {
      // Log analytics event
      Analytics.logEvent('create_payment_method_started', {
        card_brand: cardDetails.brand || 'unknown'
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock payment method
      const mockPaymentMethod = {
        id: `pm_${Math.random().toString(36).substring(2, 15)}`,
        type: 'card',
        card: {
          brand: cardDetails.brand || 'visa',
          last4: cardDetails.last4 || cardDetails.number.slice(-4),
          exp_month: cardDetails.exp_month,
          exp_year: cardDetails.exp_year,
        },
        created: Date.now(),
        customer: getCurrentStripeCustomerId(),
      };
      
      // Log success
      Analytics.logEvent('create_payment_method_success', {
        payment_method_id: mockPaymentMethod.id,
        card_brand: mockPaymentMethod.card.brand,
        mode: 'mock'
      });
      
      return mockPaymentMethod;
    } catch (error) {
      console.error('Error in createPaymentMethod:', error);
      
      // Log error
      Analytics.logEvent('create_payment_method_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a payment intent with Stripe
  const createPaymentIntent = async (amount: number, currency: string, paymentMethodId: string) => {
    setIsLoading(true);
    
    try {
      // Log analytics event
      Analytics.logEvent('create_payment_intent_started', {
        amount,
        currency,
        payment_method_id: paymentMethodId
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a mock payment intent
      const mockPaymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        amount,
        currency,
        status: 'succeeded',
        created: Date.now(),
        customer: getCurrentStripeCustomerId(),
      };
      
      // Log success
      Analytics.logEvent('create_payment_intent_success', {
        payment_intent_id: mockPaymentIntent.id,
        amount,
        currency,
        mode: 'simulated'
      });
      
      return mockPaymentIntent;
    } catch (error) {
      console.error('Error in createPaymentIntent:', error);
      
      // Log error
      Analytics.logEvent('create_payment_intent_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        amount,
        currency
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Process a payment with Stripe
  const processPayment = async (amount: number, currency: string) => {
    setIsLoading(true);
    
    try {
      // Log analytics event
      Analytics.logEvent('process_payment_started', {
        amount,
        currency
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a mock payment intent
      const mockPaymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        amount,
        currency,
        status: 'succeeded',
        created: Date.now(),
        customer: getCurrentStripeCustomerId(),
      };
      
      // Log success
      Analytics.logEvent('process_payment_success', {
        payment_intent_id: mockPaymentIntent.id,
        amount,
        currency,
        mode: 'mock'
      });
      
      return mockPaymentIntent;
    } catch (error) {
      console.error('Error in processPayment:', error);
      
      // Log error
      Analytics.logEvent('process_payment_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        amount,
        currency
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a subscription with Stripe
  const createSubscription = async (priceId: string, paymentMethodId: string) => {
    setIsLoading(true);
    
    try {
      // Log analytics event
      Analytics.logEvent('create_subscription_started', {
        price_id: priceId
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return a mock subscription
      const mockSubscription = {
        id: `sub_${Math.random().toString(36).substring(2, 15)}`,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        customer: getCurrentStripeCustomerId(),
        items: {
          data: [
            {
              id: `si_${Math.random().toString(36).substring(2, 15)}`,
              price: {
                id: priceId,
              },
            },
          ],
        },
      };
      
      // Log success
      Analytics.logEvent('create_subscription_success', {
        subscription_id: mockSubscription.id,
        price_id: priceId,
        mode: 'simulated'
      });
      
      return mockSubscription;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      
      // Log error
      Analytics.logEvent('create_subscription_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        price_id: priceId
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a subscription with Stripe
  const updateSubscription = async (subscriptionId: string, newPriceId: string) => {
    setIsLoading(true);
    
    try {
      // Log analytics event
      Analytics.logEvent('update_subscription_started', {
        subscription_id: subscriptionId,
        new_price_id: newPriceId
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock updated subscription
      const mockSubscription = {
        id: subscriptionId,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        customer: getCurrentStripeCustomerId(),
        items: {
          data: [
            {
              id: `si_${Math.random().toString(36).substring(2, 15)}`,
              price: {
                id: newPriceId,
              },
            },
          ],
        },
      };
      
      // Log success
      Analytics.logEvent('update_subscription_success', {
        subscription_id: subscriptionId,
        new_price_id: newPriceId,
        mode: 'simulated'
      });
      
      return mockSubscription;
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      
      // Log error
      Analytics.logEvent('update_subscription_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscription_id: subscriptionId,
        new_price_id: newPriceId
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a subscription with Stripe
  const cancelSubscription = async (subscriptionId: string) => {
    setIsLoading(true);
    
    try {
      // Log analytics event
      Analytics.logEvent('cancel_subscription_started', {
        subscription_id: subscriptionId
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock canceled subscription
      const mockSubscription = {
        id: subscriptionId,
        status: 'canceled',
        cancel_at_period_end: true,
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
        customer: getCurrentStripeCustomerId(),
      };
      
      // Log success
      Analytics.logEvent('cancel_subscription_success', {
        subscription_id: subscriptionId,
        mode: 'simulated'
      });
      
      return mockSubscription;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      
      // Log error
      Analytics.logEvent('cancel_subscription_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscription_id: subscriptionId
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Retrieve a payment method with Stripe
  const retrievePaymentMethod = async (paymentMethodId: string) => {
    setIsLoading(true);
    
    try {
      // Log analytics event
      Analytics.logEvent('retrieve_payment_method_started', {
        payment_method_id: paymentMethodId
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return a mock payment method
      const mockPaymentMethod = {
        id: paymentMethodId,
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2025,
        },
        created: Date.now(),
        customer: getCurrentStripeCustomerId(),
      };
      
      // Log success
      Analytics.logEvent('retrieve_payment_method_success', {
        payment_method_id: paymentMethodId,
        mode: 'simulated'
      });
      
      return mockPaymentMethod;
    } catch (error) {
      console.error('Error in retrievePaymentMethod:', error);
      
      // Log error
      Analytics.logEvent('retrieve_payment_method_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        payment_method_id: paymentMethodId
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StripeContext.Provider
      value={{
        isLoading,
        isStripeInitialized,
        createPaymentMethod,
        createPaymentIntent,
        processPayment,
        createSubscription,
        updateSubscription,
        cancelSubscription,
        retrievePaymentMethod,
      }}
    >
      {children}
    </StripeContext.Provider>
  );
};