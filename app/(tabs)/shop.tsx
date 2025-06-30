import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ShoppingCart, Search, Tag } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "@/store/useCartStore";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { products } from "@/mocks/products";
import { Product } from "@/types/product";
import * as Analytics from "@/utils/analytics";

const artCategories = ["Renaissance", "Cubism", "Surrealism", "Abstract Art"];

export default function ShopScreen() {
  const router = useRouter();
  const cartItemCount = useCartStore(state => state.getCartItemCount());
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    // Log analytics event
    Analytics.logEvent("view_shop_screen", {});
  }, []);
  
  // Filter products based on search query and selected category
  const filteredProducts = React.useMemo(() => {
    let filtered = products;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((product: Product) => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((product: Product) => product.category === selectedCategory);
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);
  
  // Handle product card press
  const handleProductPress = (productId: string) => {
    router.push(`/shop/product/${productId}`);
    
    // Log analytics event
    Analytics.logEvent("select_product", {
      product_id: productId
    });
  };
  
  // Render header with search and cart
  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />
      
      <TouchableOpacity 
        style={styles.cartButton}
        onPress={() => router.push("/shop/cart")}
      >
        <ShoppingCart size={20} color="#AC8901" />
        {cartItemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
  
  // Render category filters
  const renderCategories = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriesContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === null && styles.categoryButtonActive
        ]}
        onPress={() => setSelectedCategory(null)}
      >
        <Text style={[
          styles.categoryButtonText,
          selectedCategory === null && styles.categoryButtonTextActive
        ]}>All</Text>
      </TouchableOpacity>
      
      {artCategories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === category && styles.categoryButtonTextActive
          ]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  // Render all products grid
  const renderProductGrid = () => (
    <View style={styles.productsContainer}>
      <Text style={styles.sectionTitle}>
        {selectedCategory ? selectedCategory : "All Products"}
      </Text>
      
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Search size={40} color="#AC8901" />}
          title="No products found"
          message={searchQuery ? `No products matching "${searchQuery}"` : "There are no products available at this time."}
        />
      ) : (
        <View style={styles.productsGrid}>
          {filteredProducts.map((product: Product, index: number) => (
            <View 
              key={product.id} 
              style={[
                styles.productGridItem,
                index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }
              ]}
            >
              <ProductCard 
                product={product} 
                onPress={() => handleProductPress(product.id)}
                compact={true}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen options={{ 
        title: "Shop",
        headerTitleStyle: { ...typography.heading3, color: "#AC8901" },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#013025" }
      }} />
      
      {renderHeader()}
      {renderCategories()}
      
      <ScrollView style={styles.content}>
        {renderProductGrid()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#013025",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a4037",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#AC8901",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#AC8901",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    ...typography.caption,
    color: "#013025",
    fontWeight: "bold",
    fontSize: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#1a4037",
    borderWidth: 1,
    borderColor: "#AC8901",
    alignItems: "center",
  },
  categoryButtonActive: {
    backgroundColor: "#AC8901",
  },
  categoryButtonText: {
    ...typography.caption,
    color: "#AC8901",
    fontSize: 12,
  },
  categoryButtonTextActive: {
    color: "#013025",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.heading4,
    color: "#AC8901",
  },
  productsContainer: {
    padding: 16,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    marginBottom: 24,
  },
  productGridItem: {
    width: "48%",
    marginBottom: 16,
  },
});