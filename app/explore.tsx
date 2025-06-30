import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Filter, MapPin, Search } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import VenueCard from "@/components/VenueCard";
import CategoryCard from "@/components/CategoryCard";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { useVenueStore } from "@/store/useVenueStore";
import { useLocationStore } from "@/store/useLocationStore";
import { categories } from "@/mocks/categories";
import { Venue } from "@/types/venue";

export default function ExploreScreen() {
  const router = useRouter();
  const { venues, isLoading, fetchVenues } = useVenueStore();
  const { currentLocation, getCurrentLocation } = useLocationStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchVenues();
    getCurrentLocation();
  }, []);
  
  // Filter venues based on search query and selected category
  const filteredVenues = React.useMemo(() => {
    let filtered = venues;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((venue: Venue) => 
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (venue.tags && venue.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((venue: Venue) => venue.category === selectedCategory);
    }
    
    return filtered;
  }, [venues, searchQuery, selectedCategory]);
  
  const handleVenuePress = (venueId: string) => {
    router.push(`/venue/${venueId}`);
  };
  
  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.titleContainer}>
          <Text style={styles.screenTitle}>Explore</Text>
          {currentLocation && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color={colors.muted} />
              <Text style={styles.locationText}>
                {currentLocation.city || "Current Location"}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <SearchBar
        placeholder="Search venues, events, or locations..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />
    </View>
  );
  
  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard 
            category={item} 
            onPress={() => handleCategoryPress(item.id)}
          />
        )}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );
  
  const renderVenuesList = () => (
    <View style={styles.venuesSection}>
      <Text style={styles.sectionTitle}>
        {selectedCategory ? `${selectedCategory} Venues` : "All Venues"}
      </Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Loading venues...</Text>
        </View>
      ) : filteredVenues.length === 0 ? (
        <EmptyState
          icon={<Search size={40} color={colors.muted} />}
          title="No venues found"
          message={searchQuery ? `No venues matching "${searchQuery}"` : "There are no venues available at this time."}
        />
      ) : (
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VenueCard 
              venue={item} 
              onPress={() => handleVenuePress(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.venuesList}
        />
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {renderHeader()}
      {renderSearchBar()}
      
      <FlatList
        data={[1]}
        renderItem={() => (
          <View>
            {renderCategories()}
            {renderVenuesList()}
          </View>
        )}
        keyExtractor={() => "explore-content"}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleContainer: {
    flex: 1,
  },
  screenTitle: {
    ...typography.heading1,
    color: colors.text,
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.muted,
    marginLeft: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoriesSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesList: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 12,
  },
  venuesSection: {
    flex: 1,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    ...typography.body,
    color: colors.muted,
    marginTop: 12,
  },
  venuesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});