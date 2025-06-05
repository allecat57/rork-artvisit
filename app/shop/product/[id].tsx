import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Image } from "expo-image";
import { User, DollarSign, Calendar, Ruler, Info, ShoppingBag, ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import { products } from "@/mocks/products";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import * as Analytics from "@/utils/analytics";
import CartButton from "@/components/CartButton";

export default function ProductDetailScreen() {
  const { id, galleryId } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart, getCartItemById } = useCartStore();
  const { user } = useAuthStore();
  const cartItem = id ? getCartItemById(id as string) : undefined;
  
  useEffect(() => {
    if (id && typeof id === "string") {
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Log view event
        if (user) {
          // Log product view event
          Analytics.logEvent("screen_view", {
            screen_name: "ProductDetail",
            product_id: id,
            product_name: foundProduct.title,
            gallery_id: galleryId
          });
        }
      }
    }
  }, [id, user, galleryId]);
  
  const handleAddToCart = async () => {
    if (product) {
      addToCart(product, 1);
      
      // Log add to cart event
      if (user) {
        try {
          Analytics.logEvent("add_to_cart", {
            user_id: user.id,
            gallery_id: galleryId,
            artwork_id: product.id,
            price: product.price,
            currency: "USD"
          });
          console.log("Add to cart event logged!");
        } catch (error) {
          console.error("Error logging add to cart event:", error);
        }
      }
      
      Alert.alert(
        "Added to Cart",
        `${product.title} has been added to your cart.`,
        [
          {
            text: "Continue Shopping",
            style: "cancel",
          },
          {
            text: "View Cart",
            onPress: () => router.push("/shop/cart"),
          },
        ]
      );
    }
  };
  
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={typography.body}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen 
        options={{ 
          title: product.title,
          headerLeft: () => (
            <Button
              title="Back"
              onPress={() => router.back()}
              variant="text"
              icon={<ArrowLeft size={24} color={colors.primary.text} />}
              style={styles.backButton}
            />
          ),
          headerRight: () => (
            <CartButton />
          )
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: product.imageUrl || product.image }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        
        <View style={styles.content}>
          <Text style={[typography.heading2, styles.title]}>{product.title}</Text>
          
          <View style={styles.artistRow}>
            <User size={18} color={colors.primary.muted} />
            <Text style={[typography.body, styles.artist]}>{product.artist || "Unknown Artist"}</Text>
          </View>
          
          <View style={styles.priceContainer}>
            <DollarSign size={20} color={colors.primary.accent} />
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={[typography.heading3, styles.sectionTitle]}>About this Artwork</Text>
          <Text style={[typography.body, styles.description]}>{product.description}</Text>
          
          <View style={styles.divider} />
          
          <Text style={[typography.heading3, styles.sectionTitle]}>Details</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Info size={16} color={colors.primary.muted} />
              <Text style={[typography.bodySmall, styles.detailLabel]}>Medium</Text>
              <Text style={[typography.body, styles.detailValue]}>{product.medium || "Not specified"}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ruler size={16} color={colors.primary.muted} />
              <Text style={[typography.bodySmall, styles.detailLabel]}>Dimensions</Text>
              <Text style={[typography.body, styles.detailValue]}>{product.dimensions || "Not specified"}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Calendar size={16} color={colors.primary.muted} />
              <Text style={[typography.bodySmall, styles.detailLabel]}>Year</Text>
              <Text style={[typography.body, styles.detailValue]}>{product.year || "Not specified"}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <ShoppingBag size={16} color={colors.primary.muted} />
              <Text style={[typography.bodySmall, styles.detailLabel]}>Availability</Text>
              <Text 
                style={[
                  typography.body, 
                  styles.detailValue,
                  product.inStock ? styles.inStock : styles.outOfStock
                ]}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
          </View>
          
          <View style={styles.galleryContainer}>
            <Text style={[typography.bodySmall, styles.galleryLabel]}>Available at</Text>
            <Text style={[typography.body, styles.galleryName]}>{product.gallery || "Main Gallery"}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={cartItem ? "Added to Cart" : "Add to Cart"}
          onPress={handleAddToCart}
          disabled={!product.inStock || !!cartItem}
          icon={<ShoppingBag size={18} color={colors.primary.background} />}
        />
        
        <Button
          title="Back to Shop"
          onPress={() => router.push("/shop")}
          variant="outline"
          style={styles.backToShopButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary.background,
  },
  image: {
    height: 300,
    width: "100%",
  },
  content: {
    padding: 20,
  },
  title: {
    marginBottom: 12,
  },
  artistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  artist: {
    marginLeft: 8,
    color: colors.primary.text,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  price: {
    ...typography.heading3,
    color: colors.primary.accent,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primary.border,
    marginVertical: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  description: {
    lineHeight: 24,
    color: colors.primary.text,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    color: colors.primary.muted,
    width: 100,
    marginLeft: 8,
  },
  detailValue: {
    color: colors.primary.text,
    flex: 1,
  },
  inStock: {
    color: colors.status.success,
  },
  outOfStock: {
    color: colors.status.error,
  },
  galleryContainer: {
    backgroundColor: colors.primary.card,
    padding: 16,
    borderRadius: 12,
  },
  galleryLabel: {
    color: colors.primary.muted,
    marginBottom: 4,
  },
  galleryName: {
    color: colors.primary.text,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.primary.border,
    gap: 10,
  },
  backButton: {
    marginRight: 8,
  },
  backToShopButton: {
    marginTop: 8,
  },
});