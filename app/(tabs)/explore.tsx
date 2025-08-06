import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import colors from "@/constants/colors";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import VenueCard from "@/components/VenueCard";
import FeaturedVenueCard from "@/components/FeaturedVenueCard";
import VenueModal from "@/components/VenueModal";
import { useVenueStore } from "@/store/useVenueStore";
import { categories } from "@/mocks/categories";
import { Venue } from "@/types/venue";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

export default function ExploreScreen() {
  const { venues, isLoading, searchQuery: storeSearchQuery } = useVenueStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVenues(filtered);
    } else {
      setFilteredVenues(venues);
    }
  }, [searchQuery, venues]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const featuredVenues = filteredVenues.filter(venue => venue.featured);
  const regularVenues = filteredVenues.filter(venue => !venue.featured);

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        placeholder="Search venues, locations..."
        onChangeText={handleSearch}
        onClear={handleClearSearch}
        value={searchQuery}
      />
      
      {!searchQuery && (
        <>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }: { item: any }) => <CategoryCard category={item} onPress={() => {}} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </>
      )}

      {featuredVenues.length > 0 && (
        <Text style={styles.sectionTitle}>
          {searchQuery ? "Featured Results" : "Featured Venues"}
        </Text>
      )}
    </View>
  );

  const handleVenuePress = (venue: Venue) => {
    setSelectedVenue(venue);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedVenue(null);
  };

  const renderFeaturedVenue = ({ item }: { item: Venue }) => (
    <FeaturedVenueCard venue={item} onPress={() => handleVenuePress(item)} />
  );

  const renderVenue = ({ item }: { item: Venue }) => (
    <VenueCard venue={item} onPress={() => handleVenuePress(item)} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {searchQuery ? "No venues found" : "No venues available"}
      </Text>
      <Text style={styles.emptyDescription}>
        {searchQuery 
          ? `No venues match "${searchQuery}". Try a different search term.`
          : "Check back later for new venue listings."
        }
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading venues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[]}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View>
            {featuredVenues.length > 0 && (
              <FlatList
                data={featuredVenues}
                keyExtractor={(item: Venue) => `featured-${item.id}`}
                renderItem={renderFeaturedVenue}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredContainer}
              />
            )}
            
            {regularVenues.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>
                  {searchQuery ? "Other Results" : "All Venues"}
                </Text>
                <FlatList
                  data={regularVenues}
                  keyExtractor={(item: Venue) => item.id}
                  renderItem={renderVenue}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </>
            )}
            
            {filteredVenues.length === 0 && renderEmptyState()}
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      />
      
      <VenueModal
        visible={modalVisible}
        venue={selectedVenue}
        onClose={handleCloseModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
    fontFamily,
  },
  categoriesContainer: {
    paddingRight: 16,
  },
  featuredContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
    fontFamily,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});