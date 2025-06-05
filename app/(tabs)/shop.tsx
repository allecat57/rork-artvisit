import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingBag } from 'lucide-react-native';
import { useCartStore } from '@/store/useCartStore';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import * as Analytics from '@/utils/analytics';
import { products, productCategories } from '@/mocks/products';
import { Product } from '@/types/product';

export default function ShopScreen() {
  const router = useRouter();
  const { getCurrentUserCart, getCartItemCount } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get cart data
  const cart = getCurrentUserCart();
  const totalItems = getCartItemCount();

  useEffect(() => {
    // Log screen view
    Analytics.logScreenView('shop', 'ShopScreen');
  }, []);
  
  // Get unique categories from products
  const categories = Array.from(new Set(products.map(product => product.category)));
  
  // Filter products based on search query and selected category
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get featured products
  const featuredProducts = products.filter((product: Product) => product.featured);

  const handleProductPress = (productId: string) => {
    router.push(`/shop/product/${productId}`);
    
    // Log product selection
    Analytics.logEvent('select_product', {
      product_id: productId
    });
  };

  const handleCartPress = () => {
    router.push('/shop/cart');
    
    // Log cart view
    Analytics.logEvent('view_cart', {
      cart_size: totalItems,
      cart_value: cart.reduce((total: number, item: any) => total + (item.product.price * item.quantity), 0)
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Log search
    if (query.trim()) {
      Analytics.logEvent('search_products', {
        search_term: query
      });
    }
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    
    // Log category selection
    Analytics.logEvent('filter_products', {
      category: category,
      active: selectedCategory !== category
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Shop</Text>
          <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
            <ShoppingBag size={20} color={colors.primary.accent} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <SearchBar
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchBar}
        />

        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {featuredProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Featured</Text>
            <FlatList
              data={featuredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item.id)}
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsContainer}
            />
          </>
        )}

        <Text style={styles.sectionTitle}>All Products</Text>
        <View style={styles.gridContainer}>
          {filteredProducts.map((product: Product, index: number) => (
            <View key={product.id} style={[
              styles.gridItem,
              index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }
            ]}>
              <ProductCard
                product={product}
                onPress={() => handleProductPress(product.id)}
                compact
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: {
    ...typography.heading1,
    color: colors.primary.text,
  },
  cartButton: {
    backgroundColor: colors.primary.card,
    padding: 10,
    borderRadius: 20,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.primary.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    ...typography.caption,
    color: colors.primary.background,
    fontWeight: '600',
    fontSize: 10,
  },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary.card,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary.accent,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.primary.text,
  },
  categoryTextActive: {
    color: colors.primary.background,
    fontWeight: '600',
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.primary.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  productsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
});