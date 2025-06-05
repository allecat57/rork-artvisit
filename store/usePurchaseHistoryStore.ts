import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product } from "@/types/product";
import { useAuthStore } from "./useAuthStore";
import { v4 as uuidv4 } from "uuid";

export interface PurchaseItem {
  product: Product;
  quantity: number;
  price: number; // Store the price at time of purchase
}

export interface Purchase {
  id: string;
  userId: string;
  items: PurchaseItem[];
  totalAmount: number;
  date: string;
  paymentMethod: {
    cardType: string;
    last4: string;
  };
  status: "completed" | "processing" | "shipped" | "delivered";
  shippingAddress?: string;
}

interface UserPurchases {
  userId: string;
  purchases: Purchase[];
}

interface PurchaseHistoryState {
  userPurchases: Record<string, UserPurchases>;
  
  // Current user getters
  getCurrentUserPurchases: () => Purchase[];
  
  // Actions
  addPurchase: (purchase: Omit<Purchase, "id" | "userId" | "date">) => void;
  updatePurchaseStatus: (purchaseId: string, status: Purchase["status"]) => void;
  
  // Selectors
  getTotalSpent: () => number;
  getPurchaseById: (purchaseId: string) => Purchase | undefined;
}

// Helper to get current user ID from auth store
const getCurrentUserId = (): string | null => {
  const user = useAuthStore.getState().user;
  return user?.id || null;
};

// Generate a random order ID using UUID
const generateOrderId = (): string => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// Create default purchases for a user
const createDefaultUserPurchases = (userId: string): UserPurchases => ({
  userId,
  purchases: [],
});

export const usePurchaseHistoryStore = create<PurchaseHistoryState>()(
  persist(
    (set, get) => ({
      userPurchases: {},
      
      getCurrentUserPurchases: () => {
        const userId = getCurrentUserId();
        if (!userId) return [];
        
        const userPurchases = get().userPurchases;
        return userPurchases[userId]?.purchases || [];
      },
      
      addPurchase: (purchase) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        const newPurchase: Purchase = {
          ...purchase,
          id: generateOrderId(),
          userId,
          date: new Date().toISOString(),
        };
        
        set((state) => {
          const currentUserPurchases = state.userPurchases[userId] || createDefaultUserPurchases(userId);
          
          return {
            userPurchases: {
              ...state.userPurchases,
              [userId]: {
                ...currentUserPurchases,
                purchases: [newPurchase, ...currentUserPurchases.purchases]
              }
            }
          };
        });
      },
      
      updatePurchaseStatus: (purchaseId, status) => {
        const userId = getCurrentUserId();
        if (!userId) return;
        
        set((state) => {
          const currentUserPurchases = state.userPurchases[userId];
          if (!currentUserPurchases) return state;
          
          return {
            userPurchases: {
              ...state.userPurchases,
              [userId]: {
                ...currentUserPurchases,
                purchases: currentUserPurchases.purchases.map(purchase => 
                  purchase.id === purchaseId 
                    ? { ...purchase, status }
                    : purchase
                )
              }
            }
          };
        });
      },
      
      getTotalSpent: () => {
        const purchases = get().getCurrentUserPurchases();
        return purchases.reduce((total, purchase) => total + purchase.totalAmount, 0);
      },
      
      getPurchaseById: (purchaseId) => {
        const purchases = get().getCurrentUserPurchases();
        return purchases.find(purchase => purchase.id === purchaseId);
      },
    }),
    {
      name: "purchase-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);