import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import typography from "@/constants/typography";

export const CartButton = () => {
  const router = useRouter();
  const cartItemCount = useCartStore((state) => state.getCartItemCount());
  const user = useAuthStore((state) => state.user);

  const handleCartPress = () => {
    if (user) {
      router.push("/shop/cart");
    } else {
      router.push("/login");
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleCartPress}>
      <ShoppingCart size={16} color="#AC8901" />
      <Text style={styles.text}>
        Cart ({cartItemCount})
      </Text>
      {cartItemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartItemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a4037",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#AC8901",
    gap: 6,
  },
  text: {
    fontSize: 14,
    color: "#AC8901",
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#AC8901",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 9,
    color: "#013025",
    fontWeight: "bold",
  },
});

export default CartButton;