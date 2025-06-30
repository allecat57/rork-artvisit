import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { ShoppingCart, Star } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import * as Analytics from "@/utils/analytics";

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  compact?: boolean;
}

export default function ProductCard({ product, onPress, compact = false }: ProductCardProps) {
  const { addToCart } = useCartStore();
  
  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    addToCart(product, 1);
    
    // Log analytics event
    Analytics.logEvent(Analytics.Events.ADD_TO_CART, {
      product_id: product.id,
      product_name: product.title,
      price: product.price,
      quantity: 1
    });
  };
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: product.image }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text style={styles.compactCategory}>{product.category}</Text>
          <Text style={styles.compactTitle} numberOfLines={2}>{product.title}</Text>
          <View style={styles.compactFooter}>
            <Text style={styles.compactPrice}>${product.price.toFixed(2)}</Text>
            <TouchableOpacity 
              style={styles.compactCartButton}
              onPress={handleAddToCart}
            >
              <ShoppingCart size={14} color="#013025" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: product.image }} style={styles.image} />
      
      {product.featured && (
        <View style={styles.featuredBadge}>
          <Star size={12} color="#013025" />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={handleAddToCart}
          >
            <ShoppingCart size={16} color="#013025" />
            <Text style={styles.cartButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1a4037",
    borderRadius: 12,
    overflow: "hidden",
    width: 220,
    borderWidth: 1,
    borderColor: "#AC8901",
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#AC8901",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    ...typography.caption,
    color: "#013025",
    fontWeight: "600",
    marginLeft: 4,
  },
  content: {
    padding: 12,
  },
  category: {
    ...typography.caption,
    color: "#AC8901",
    marginBottom: 4,
  },
  title: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: "#AC8901",
    marginBottom: 4,
  },
  description: {
    ...typography.caption,
    color: "#AC8901",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    ...typography.body,
    fontWeight: "700",
    color: "#AC8901",
  },
  cartButton: {
    backgroundColor: "#AC8901",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cartButtonText: {
    ...typography.caption,
    color: "#013025",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 10,
  },
  
  // Compact styles
  compactContainer: {
    backgroundColor: "#1a4037",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#AC8901",
    height: 220,
  },
  compactImage: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  compactContent: {
    padding: 8,
    flex: 1,
    justifyContent: "space-between",
  },
  compactCategory: {
    ...typography.caption,
    color: "#AC8901",
    fontSize: 9,
  },
  compactTitle: {
    ...typography.caption,
    fontWeight: "600",
    color: "#AC8901",
    marginVertical: 2,
    fontSize: 10,
  },
  compactFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactPrice: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: "#AC8901",
    fontSize: 11,
  },
  compactCartButton: {
    backgroundColor: "#AC8901",
    padding: 3,
    borderRadius: 8,
  },
});