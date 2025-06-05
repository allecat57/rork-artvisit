import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export const CartButton = () => {
  const router = useRouter();
  const cartItemCount = useCartStore((state) => state.getCartItemCount());
  const user = useAuthStore((state) => state.user);

  const handleCartPress = () => {
    if (user) {
      router.push("/shop/cart");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <TouchableOpacity onPress={handleCartPress}>
      <View style={{ padding: 10, backgroundColor: "#013025", borderRadius: 20 }}>
        <Text style={{ color: "#AC8901", fontWeight: "bold" }}>
          Cart ({cartItemCount})
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default CartButton;