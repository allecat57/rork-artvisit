import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import * as Analytics from "@/utils/analytics";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  onPress?: () => void;
}

export default function ProductCard({ product, compact = false, onPress }: ProductCardProps) {
  const router = useRouter();
  const addToCart = useCartStore(state => state.addToCart);
  
  const handlePress = () => {
    // Log analytics event
    Analytics.logEvent("product_card_click", {
      product_id: product.id,
      product_title: product.title,
      product_category: product.category,
      product_price: product.price
    });
    
    // Use the provided onPress handler or navigate to product details
    if (onPress) {
      onPress();
    } else {
      router.push(`/shop/product/${product.id}`);
    }
  };
  
  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    
    addToCart(product, 1);
    
    // Log analytics event
    Analytics.logEvent(Analytics.Events.ADD_TO_CART, {
      product_id: product.id,
      product_title: product.title,
      product_price: product.price,
      quantity: 1
    });
  };
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: product.imageUrl }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text style={[typography.bodySmall, styles.compactArtist]}>{product.artist}</Text>
          <Text style={[typography.bodySmall, styles.compactTitle]} numberOfLines={2}>
            {product.title}
          </Text>
          <View style={styles.compactFooter}>
            <Text style={styles.compactPrice}>${product.price}</Text>
            <TouchableOpacity 
              style={styles.compactAddButton}
              onPress={handleAddToCart}
            >
              <ShoppingBag size={14} color={colors.primary.background} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      
      {!product.inStock && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={[typography.bodySmall, styles.artist]}>{product.artist}</Text>
        <Text style={[typography.heading4, styles.title]} numberOfLines={2}>
          {product.title}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price}</Text>
          
          {product.inStock && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddToCart}
            >
              <ShoppingBag size={16} color={colors.primary.background} />
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary.border,
    width: 250,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  outOfStockBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.status.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  outOfStockText: {
    ...typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  artist: {
    color: colors.primary.muted,
    marginBottom: 4,
  },
  title: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    ...typography.heading4,
    color: colors.primary.text,
  },
  addButton: {
    backgroundColor: colors.primary.accent,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.bodySmall,
    color: colors.primary.background,
    fontWeight: "600",
    marginLeft: 6,
  },
  
  // Compact styles
  compactContainer: {
    backgroundColor: colors.primary.card,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primary.border,
    height: 220,
  },
  compactImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  compactContent: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  compactArtist: {
    color: colors.primary.muted,
    fontSize: 10,
  },
  compactTitle: {
    fontWeight: "600",
    marginVertical: 4,
  },
  compactFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactPrice: {
    ...typography.bodySmall,
    color: colors.primary.text,
    fontWeight: "600",
  },
  compactAddButton: {
    backgroundColor: colors.primary.accent,
    padding: 6,
    borderRadius: 6,
  },
});