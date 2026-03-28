import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
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
import { useTimeFrameArtwork } from "@/hooks/useTimeFrameArtwork";
import { useTimeFrameWebSocket } from "@/hooks/useTimeFrameWebSocket";

const artCategories = ["Renaissance", "Cubism", "Surrealism", "Abstract Art"];

export default function ShopScreen() {
  const router = useRouter();
  const cartItemCount = useCartStore(state => state.getCartItemCount());
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // TimeFrame API integration
  const { artworks: timeFrameArtworks, loading: timeFrameLoading, error: timeFrameError, refetch } = useTimeFrameArtwork();
  
  // Combine mock products with TimeFrame artworks
  const allProducts = React.useMemo(() => {
    return [...products, ...timeFrameArtworks];
  }, [timeFrameArtworks]);
  
  // Real-time updates for new artworks
  useTimeFrameWebSocket({
    onArtworkAdded: (data) => {
      console.log('🎨 New artwork added:', data);
      refetch(); // Refresh artwork list
    },
    onArtworkSold: (data) => {
      console.log('💰 Artwork sold:', data);
      refetch(); // Refresh artwork list
    }
  });
  
  useEffect(() => {
    // Log analytics event
    Analytics.logEvent("view_shop_screen", {});
  }, []);
  
  // Filter products based on search query and selected category
  const filteredProducts = React.useMemo(() => {
    let filtered = allProducts;
    
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
  }, [searchQuery, selectedCategory, allProducts]);
  
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
      <View>
        <Text style={styles.screenTitle}>Shop</Text>
        {timeFrameArtworks.length > 0 && (
          <Text style={styles.timeFrameIndicator}>
            {timeFrameArtworks.length} live artworks from TimeFrame
          </Text>
        )}
        {timeFrameError && (
          <Text style={styles.errorText}>TimeFrame: {timeFrameError}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.cartButton}
        onPress={() => router.push("/shop/cart")}
      >
        <ShoppingCart size={20} color={colors.accent} />
        {cartItemCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
  
  // Render search bar
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <SearchBar
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />
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
      
      {timeFrameLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading TimeFrame galleries...</Text>
        </View>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Search size={40} color={colors.textMuted} />}
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
      {renderHeader()}
      {renderSearchBar()}
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenTitle: {
    ...typography.heading1,
    color: colors.text,
    fontSize: 28,
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    ...typography.caption,
    color: colors.background,
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
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryButtonActive: {
    backgroundColor: colors.accent,
  },
  categoryButtonText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: colors.background,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
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
  timeFrameIndicator: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "500",
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
});