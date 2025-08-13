import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ShoppingBag, Filter, Grid, List, ChevronRight } from "lucide-react-native";
import colors from "@/constants/colors";
import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";

import { products } from "@/mocks/products";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import { useTimeFrameArtwork } from "@/hooks/useTimeFrameArtwork";
import { useTimeFrameWebSocket } from "@/hooks/useTimeFrameWebSocket";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onViewAll, showViewAll = true }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {showViewAll && onViewAll && (
      <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>View All</Text>
        <ChevronRight size={16} color={colors.accent} />
      </TouchableOpacity>
    )}
  </View>
);

export default function ShopScreen() {
  const router = useRouter();
  const { getCurrentUserCart } = useCartStore();
  const items = getCurrentUserCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // TimeFrame API integration
  const { artworks: timeFrameArtworks, loading: timeFrameLoading, error: timeFrameError, refetch } = useTimeFrameArtwork();
  
  // Combine mock products with TimeFrame artworks
  const allProducts = React.useMemo(() => {
    return [...products, ...timeFrameArtworks];
  }, [timeFrameArtworks]);
  
  const loading = timeFrameLoading;
  
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
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.artist && product.artist.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchQuery, allProducts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const featuredProducts = filteredProducts.filter(product => product.featured).slice(0, 3);
  const regularProducts = filteredProducts.filter(product => !product.featured);
  
  const categories = Array.from(new Set(allProducts.map(p => p.category)));
  
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard 
        product={item} 
        compact 
        onPress={() => router.push(`/shop/product/${item.id}`)}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <ShoppingBag size={32} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No products found" : "No products available"}
      </Text>
      <Text style={styles.emptyDescription}>
        {searchQuery 
          ? `No products match "${searchQuery}". Try a different search term.`
          : "Check back later for new art pieces."
        }
      </Text>
    </View>
  );

  const renderCategoryCard = (category: string) => (
    <TouchableOpacity 
      key={category}
      style={styles.categoryCard}
      onPress={() => {
        // Filter by category
        const categoryProducts = allProducts.filter(p => p.category === category);
        setFilteredProducts(categoryProducts);
      }}
    >
      <Text style={styles.categoryText}>{category}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedProduct = (product: Product) => (
    <TouchableOpacity 
      key={product.id}
      style={styles.featuredCard}
      onPress={() => router.push(`/shop/product/${product.id}`)}
    >
      <View style={styles.featuredContent}>
        <Text style={styles.featuredCategory}>{product.category}</Text>
        <Text style={styles.featuredTitle}>{product.title}</Text>
        <Text style={styles.featuredPrice}>${product.price}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading TimeFrame galleries...</Text>
        <Text style={styles.loadingSubtext}>Connecting to live art marketplace</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Art Shop</Text>
              <Text style={styles.headerSubtitle}>
                {timeFrameArtworks.length > 0 
                  ? `${timeFrameArtworks.length} live artworks from TimeFrame galleries`
                  : 'Discover unique pieces'
                }
              </Text>
              {timeFrameError && (
                <Text style={styles.errorText}>TimeFrame: {timeFrameError}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.cartIconContainer}
              onPress={() => router.push('/shop/cart')}
            >
              <ShoppingBag size={24} color={colors.text} />
              {items.length > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{items.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <SearchBar
            placeholder="Search art, artists, categories..."
            onChangeText={handleSearch}
            onClear={handleClearSearch}
            value={searchQuery}
          />
        </View>

        {!searchQuery && (
          <>
            {/* Categories */}
            <View style={styles.section}>
              <SectionHeader title="Browse Categories" showViewAll={false} />
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
              >
                {categories.map(renderCategoryCard)}
              </ScrollView>
            </View>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Featured Artwork" showViewAll={false} />
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredContainer}
                >
                  {featuredProducts.map(renderFeaturedProduct)}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* Products Grid */}
        <View style={styles.section}>
          <View style={styles.productsHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery 
                ? `${filteredProducts.length} results for "${searchQuery}"`
                : 'All Artwork'
              }
            </Text>
            <View style={styles.viewToggle}>
              <TouchableOpacity 
                style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
                onPress={() => setViewMode('grid')}
              >
                <Grid size={16} color={viewMode === 'grid' ? colors.accent : colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
                onPress={() => setViewMode('list')}
              >
                <List size={16} color={viewMode === 'list' ? colors.accent : colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {filteredProducts.length > 0 ? (
            <FlatList
              data={searchQuery ? filteredProducts : regularProducts}
              keyExtractor={(item) => item.id}
              renderItem={renderProduct}
              numColumns={viewMode === 'grid' ? 2 : 1}
              key={viewMode}
              columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
              contentContainerStyle={styles.productsContainer}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            renderEmptyState()
          )}
        </View>


      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    fontFamily,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  cartIconContainer: {
    position: "relative",
    padding: 8,
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.background,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontFamily,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: "600",
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  featuredContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  featuredCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    width: 200,
  },
  featuredContent: {
    gap: 8,
  },
  featuredCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.accent,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 2,
  },
  viewButton: {
    padding: 8,
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: colors.background,
  },
  productsContainer: {
    paddingHorizontal: 24,
  },
  row: {
    justifyContent: "space-between",
    gap: 12,
  },
  productContainer: {
    flex: 1,
  },
  separator: {
    height: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "400",
    marginTop: 4,
  },
});