import React from "react";
import { View, Text, FlatList, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/types/product";

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ visible, onClose }) => {
  const cartItems = useCartStore((state) => state.getCurrentUserCart());
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  const renderItem = ({ item }: { item: { product: Product; quantity: number } }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemName}>{item.product.name || item.product.title}</Text>
      <Text>Qty: {item.quantity}</Text>
      <Text>${item.product.price.toFixed(2)}</Text>
      <TouchableOpacity onPress={() => removeFromCart(item.product.id)}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Your Cart</Text>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.product.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
        <Text style={styles.total}>Total: ${getCartTotal().toFixed(2)}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close Cart</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#013025" },
  list: { paddingBottom: 20 },
  itemContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc", // Light gray border for separation
    paddingBottom: 10,
  },
  itemName: { fontWeight: "bold", fontSize: 16, color: "#013025" },
  removeText: { color: "#FF0000", marginTop: 5 }, // Red color for "Remove" text
  total: { fontSize: 18, fontWeight: "bold", marginTop: 20, color: "#013025" },
  closeButton: {
    marginTop: 30,
    backgroundColor: "#013025", // Primary color
    padding: 15,
    borderRadius: 10,
  },
  closeText: { color: "#AC8901", textAlign: "center", fontWeight: "bold" }, // Typography color
});

export default CartModal;