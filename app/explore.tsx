import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, MapPin, Filter } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import VenueCard from "@/components/VenueCard";
import FeaturedVenueCard from "@/components/FeaturedVenueCard";
import { venues, featuredVenues } from "@/mocks/venues";
import { categories } from "@/mocks/categories";
import { useLocationStore } from "@/store/useLocationStore";
import { useGalleries } from "@/hooks/useGalleries";
import * as Analytics from "@/utils/analytics";

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredVenues, setFilteredVenues] = useState(venues);
  const [galleries, setGalleries] = useState<any[]>([]);
  const { galleries: galleriesData, loading: galleriesLoading } = useGalleries();
  
  const { location, requestLocation } = useLocationStore();

  useEffect(() => {
    // Request location when component mounts
    requestLocation();
    
    // Set galleries from hook
    if (galleriesData && galleriesData.length > 0) {
      setGalleries(galleriesData);
    }
    
    // Log screen view
    Analytics.logEvent("screen_view", { screen_name: "explore" });
  }, []);

  useEffect(() => {
    // Filter venues based on search query and selected category
    let filtered = venues;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(venue =>
        venue.name.toLowerCase().includes(query) ||
        venue.type.toLowerCase().includes(query) ||
        venue.description.toLowerCase().includes(query) ||
        (venue.tags && venue.tags.some((tag: string) => tag.toLowerCase().includes(query)))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(venue => venue.category === selectedCategory);
    }

    setFilteredVenues(filtered);
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Log search event
    Analytics.logEvent("search_performed", {
      query,
      results_count: filteredVenues.length
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    
    // Log category selection
    Analytics.logEvent("category_selected", {
      category_id: categoryId,
      category_name: categories.find(c => c.id === categoryId)?.title
    });
  };

  const handleLocationPress = () => {
    requestLocation();
    
    // Log location request
    Analytics.logEvent("location_requested", {
      current_location: location ? `${location.latitude}, ${location.longitude}` : "none"
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[typography.heading1, styles.title]}>Explore</Text>
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={handleLocationPress}
            >
              <MapPin size={16} color={colors.accent} />
              <Text style={styles.locationText}>
                {location ? "Current Location" : "Set Location"}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search museums, galleries, exhibitions..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Categories */}
        {!searchQuery && (
          <View style={styles.section}>
            <Text style={[typography.heading3, styles.sectionTitle]}>Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onPress={() => handleCategorySelect(category.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Featured Venues */}
        {!searchQuery && !selectedCategory && (
          <View style={styles.section}>
            <Text style={[typography.heading3, styles.sectionTitle]}>Featured</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            >
              {featuredVenues.map((venue) => (
                <FeaturedVenueCard
                  key={venue.id}
                  venue={venue}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Galleries from Supabase */}
        {galleries.length > 0 && !searchQuery && !selectedCategory && (
          <View style={styles.section}>
            <Text style={[typography.heading3, styles.sectionTitle]}>Latest Galleries</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredContainer}
            >
              {galleries.slice(0, 5).map((gallery) => (
                <FeaturedVenueCard
                  key={gallery.id}
                  venue={{
                    id: gallery.id,
                    name: gallery.name || 'Gallery',
                    type: 'Gallery',
                    imageUrl: gallery.image_url || 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1024&q=80',
                    rating: 4.5,
                    distance: '2.1 miles',
                    openingHours: '10:00 AM - 6:00 PM',
                    location: gallery.location || 'Gallery Location',
                    admission: 'Free',
                    featured: true,
                    category: 'gallery',
                    description: gallery.description || 'Art gallery'
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Venues / Search Results */}
        <View style={styles.section}>
          <Text style={[typography.heading3, styles.sectionTitle]}>
            {searchQuery ? `Search Results (${filteredVenues.length})` : 
             selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.title || 'Category'} Venues` :
             'All Venues'}
          </Text>
          
          {filteredVenues.length > 0 ? (
            <View style={styles.venuesGrid}>
              {filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Search size={48} color={colors.textMuted} />
              <Text style={[typography.heading4, styles.emptyTitle]}>
                No venues found
              </Text>
              <Text style={[typography.body, styles.emptyMessage]}>
                Try adjusting your search or browse our categories
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: colors.text,
    marginBottom: 4,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.accent,
    marginLeft: 4,
    fontWeight: "500",
  },
  filterButton: {
    padding: 8,
    marginTop: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  featuredContainer: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  venuesGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: colors.textMuted,
    textAlign: "center",
  },
});