// Stripe configuration
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Pb8kfBxLtjWXrh67o1GLSYkHMNMAgUTOxSwg8uZTqzhmmPeGfl6NiBWW2HANpkHGlRlUhvZ151k5V17gb1S4qZW00IBpaz1yu';

// API URL for backend (mock)
export const STRIPE_API_URL = 'https://api.example.com/stripe';

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free Access',
    price: 0,
    stripePriceId: null
  },
  essential: {
    id: 'essential',
    name: 'Essential Pass',
    price: 9.00,
    stripePriceId: 'price_1Pb8lkBxLtjWXrh6Yx8HgGvP'
  },
  explorer: {
    id: 'explorer',
    name: 'Art Explorer',
    price: 12.00,
    stripePriceId: 'price_1Pb8mFBxLtjWXrh6lfgvwXYZ'
  },
  collector: {
    id: 'collector',
    name: 'Master Collector',
    price: 20.00,
    stripePriceId: 'price_1Pb8mhBxLtjWXrh6KLpn8765'
  }
};

// Mock API endpoints (in a real app, these would be actual backend endpoints)
export const STRIPE_ENDPOINTS = {
  createPaymentIntent: '/payment-intents',
  createSetupIntent: '/setup-intents',
  createCustomer: '/customers',
  createSubscription: '/subscriptions',
  updateSubscription: '/subscriptions',
  cancelSubscription: '/subscriptions/cancel',
  retrievePaymentMethod: '/payment-methods',
};

// Helper function to check if Stripe is properly configured
export const isStripeConfigured = () => {
  return STRIPE_PUBLISHABLE_KEY && 
    STRIPE_PUBLISHABLE_KEY.startsWith('pk_') && 
    STRIPE_PUBLISHABLE_KEY !== 'pk_test_your_key_here';
};