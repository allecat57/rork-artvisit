import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShoppingBag, Trash2 } from 'lucide-react-native';
import { useCartStore } from '@/store/useCartStore';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import Button from '@/components/Button';
import * as Analytics from '@/utils/analytics';

export default function CartScreen() {
  const router = useRouter();
  const { 
    getCurrentUserCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount
  } = useCartStore();
  
  const cartItems = getCurrentUserCart();
  const totalPrice = getCartTotal();
  const itemCount = getCartItemCount();
  
  // Log screen view
  React.useEffect(() => {
    Analytics.sendAnalyticsEvent('screen_view', {
      screen_name: 'Cart',
      screen_class: 'CartScreen'
    });
    
    // Log cart contents
    if (cartItems.length > 0) {
      Analytics.sendAnalyticsEvent('view_cart', {
        value: totalPrice,
        currency: 'USD',
        items: cartItems.map(item => ({
          item_id: item.product.id,
          item_name: item.product.title,
          price: item.product.price,
          quantity: item.quantity
        }))
      });
    }
  }, [cartItems, totalPrice]);
  
  const handleRemoveItem = (productId: string) => {
    // Get the item before removing it for analytics
    const itemToRemove = cartItems.find(item => item.product.id === productId);
    
    if (itemToRemove) {
      // Log remove from cart event
      Analytics.sendAnalyticsEvent('remove_from_cart', {
        item_id: itemToRemove.product.id,
        item_name: itemToRemove.product.title,
        price: itemToRemove.product.price,
        quantity: itemToRemove.quantity,
        value: itemToRemove.product.price * itemToRemove.quantity
      });
    }
    
    removeFromCart(productId);
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add some items before checking out.');
      return;
    }
    
    // Log checkout started event
    Analytics.sendAnalyticsEvent('begin_checkout', {
      value: totalPrice,
      currency: 'USD',
      items: cartItems.map(item => ({
        item_id: item.product.id,
        item_name: item.product.title,
        price: item.product.price,
        quantity: item.quantity
      }))
    });
    
    // Generate a confirmation code for the purchase
    const confirmationCode = `ORDER-${Math.floor(Math.random() * 10000)}`;
    
    // Show success message
    Alert.alert(
      'Purchase Successful',
      `Your order has been placed successfully. Confirmation code: ${confirmationCode}`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            // Log purchase event
            Analytics.sendAnalyticsEvent('purchase', {
              transaction_id: confirmationCode,
              value: totalPrice,
              currency: 'USD',
              items: cartItems.map(item => ({
                item_id: item.product.id,
                item_name: item.product.title,
                price: item.product.price,
                quantity: item.quantity
              }))
            });
            
            clearCart();
            router.push('/shop');
          }
        }
      ]
    );
  };
  
  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color={colors.primary.muted} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some items to get started</Text>
          <Button
            title="Browse Shop"
            onPress={() => router.push('/shop')}
            variant="primary"
            style={styles.browseButton}
            analyticsEventName="empty_cart_browse_shop"
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[typography.heading2, styles.title]}>Your Cart</Text>
        <Text style={styles.itemCount}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
      </View>
      
      <ScrollView style={styles.scrollContainer}>
        {cartItems.map((item) => (
          <View key={item.product.id} style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product.title}</Text>
              <Text style={styles.itemPrice}>${item.product.price.toFixed(2)}</Text>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantity: </Text>
                <Text style={styles.quantity}>{item.quantity}</Text>
              </View>
            </View>
            <View style={styles.itemActions}>
              <Text style={styles.itemTotal}>${(item.product.price * item.quantity).toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.product.id)}
              >
                <Trash2 size={20} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>
        
        <Button
          title="Check Out"
          onPress={handleCheckout}
          variant="primary"
          analyticsEventName="proceed_to_checkout"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border
  },
  title: {
    marginBottom: 4
  },
  itemCount: {
    ...typography.body,
    color: colors.primary.muted
  },
  scrollContainer: {
    flex: 1
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    ...typography.heading4,
    marginBottom: 4
  },
  itemPrice: {
    ...typography.body,
    color: colors.primary.muted,
    marginBottom: 8
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  quantityLabel: {
    ...typography.body,
    color: colors.primary.muted
  },
  quantity: {
    ...typography.body,
    fontWeight: 'bold'
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  itemTotal: {
    ...typography.heading4,
    marginBottom: 8
  },
  removeButton: {
    padding: 8
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.primary.border
  },
  summaryContainer: {
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    ...typography.body,
    color: colors.primary.muted
  },
  summaryValue: {
    ...typography.body
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.primary.border
  },
  totalLabel: {
    ...typography.heading4
  },
  totalValue: {
    ...typography.heading4,
    color: colors.primary.accent
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyTitle: {
    ...typography.heading3,
    marginTop: 16,
    marginBottom: 8
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.primary.muted,
    marginBottom: 24,
    textAlign: 'center'
  },
  browseButton: {
    minWidth: 200
  }
});