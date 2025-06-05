import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, CartItem } from "@/types/product";
import { useAuthStore } from "./useAuthStore";
import * as Analytics from "@/utils/analytics";

interface CartState {
  // Cart data
  cartItems: Record<string, CartItem[]>;
  
  // Getters
  getCurrentUserCart: () => CartItem[];
  getCartItemCount: () => number;
  getCartTotal: () => number;
  
  // Actions
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: {},
      
      getCurrentUserCart: () => {
        const userId = useAuthStore.getState().user?.id || "guest";
        return get().cartItems[userId] || [];
      },
      
      getCartItemCount: () => {
        const cart = get().getCurrentUserCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },
      
      getCartTotal: () => {
        const cart = get().getCurrentUserCart();
        return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },
      
      addToCart: (product: Product, quantity: number) => {
        const userId = useAuthStore.getState().user?.id || "guest";
        const userCart = get().cartItems[userId] || [];
        
        // Check if product already exists in cart
        const existingItemIndex = userCart.findIndex(item => item.product.id === product.id);
        
        if (existingItemIndex >= 0) {
          // Update quantity if product already exists
          const updatedCart = [...userCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + quantity
          };
          
          set(state => ({
            cartItems: {
              ...state.cartItems,
              [userId]: updatedCart
            }
          }));
          
          // Log analytics event
          Analytics.logEvent(Analytics.Events.ADD_TO_CART, {
            product_id: product.id,
            product_name: product.title,
            price: product.price,
            quantity,
            new_quantity: updatedCart[existingItemIndex].quantity,
            user_id: userId
          });
        } else {
          // Add new product to cart
          set(state => ({
            cartItems: {
              ...state.cartItems,
              [userId]: [
                ...userCart,
                { product, quantity }
              ]
            }
          }));
          
          // Log analytics event
          Analytics.logEvent(Analytics.Events.ADD_TO_CART, {
            product_id: product.id,
            product_name: product.title,
            price: product.price,
            quantity,
            user_id: userId
          });
        }
      },
      
      removeFromCart: (productId: string) => {
        const userId = useAuthStore.getState().user?.id || "guest";
        const userCart = get().cartItems[userId] || [];
        
        // Find the product to remove
        const productToRemove = userCart.find(item => item.product.id === productId);
        
        if (productToRemove) {
          // Remove product from cart
          const updatedCart = userCart.filter(item => item.product.id !== productId);
          
          set(state => ({
            cartItems: {
              ...state.cartItems,
              [userId]: updatedCart
            }
          }));
          
          // Log analytics event
          Analytics.logEvent(Analytics.Events.REMOVE_FROM_CART, {
            product_id: productId,
            product_name: productToRemove.product.title,
            price: productToRemove.product.price,
            quantity: productToRemove.quantity,
            user_id: userId
          });
        }
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        const userId = useAuthStore.getState().user?.id || "guest";
        const userCart = get().cartItems[userId] || [];
        
        // Find the product to update
        const existingItemIndex = userCart.findIndex(item => item.product.id === productId);
        
        if (existingItemIndex >= 0) {
          const updatedCart = [...userCart];
          const oldQuantity = updatedCart[existingItemIndex].quantity;
          
          if (quantity <= 0) {
            // Remove product if quantity is 0 or less
            updatedCart.splice(existingItemIndex, 1);
          } else {
            // Update quantity
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity
            };
          }
          
          set(state => ({
            cartItems: {
              ...state.cartItems,
              [userId]: updatedCart
            }
          }));
          
          // Log analytics event
          Analytics.logEvent("update_cart_quantity", {
            product_id: productId,
            product_name: userCart[existingItemIndex].product.title,
            price: userCart[existingItemIndex].product.price,
            old_quantity: oldQuantity,
            new_quantity: quantity,
            user_id: userId
          });
        }
      },
      
      clearCart: () => {
        const userId = useAuthStore.getState().user?.id || "guest";
        
        set(state => ({
          cartItems: {
            ...state.cartItems,
            [userId]: []
          }
        }));
        
        // Log analytics event
        Analytics.logEvent("clear_cart", {
          user_id: userId
        });
      }
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);