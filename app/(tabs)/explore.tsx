import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { MapPin, Clock, Star, RefreshCw } from "lucide-react-native";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import VenueCard from "@/components/VenueCard";
import FeaturedVenueCard from "@/components/FeaturedVenueCard";
import VenueModal from "@/components/VenueModal";
import GalleryModal from "@/components/GalleryModal";
import { useVenueStore } from "@/store/useVenueStore";
import { useGalleries } from "@/hooks/useGalleries";
import { categories } from "@/mocks/categories";
import { Venue } from "@/types/venue";

// Define colors directly to avoid import issues
const colors = {
  background: "#013025",
  text: "#FFFFFF",
  textSecondary: "#B0B0B0",
  accent: "#AC8901",
  card: "#1a4037",
  border: "rgba(172, 137, 1, 0.2)",
};

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

export default function ExploreScreen() {
  const { venues, isLoading, fetchVenues } = useVenueStore();
  const { galleries, loading: galleriesLoading, error: galleriesError, refetch: refetchGalleries, isUsingMockData } = useGalleries();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [filteredGalleries, setFilteredGalleries] = useState<any[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<any>(null);
  const [venueModalVisible, setVenueModalVisible] = useState(false);
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'venues' | 'galleries'>('venues');

  useEffect(() => {
    // Load venues on component mount
    console.log('🔄 Explore screen mounted, loading venues...');
    fetchVenues();
  }, [fetchVenues]);

  // Also trigger loading when the screen comes into focus
  useEffect(() => {
    const loadInitialData = async () => {
      if (venues.length === 0) {
        console.log('🔄 No venues found, triggering fetch...');
        await fetchVenues();
      } else {
        console.log(`✅ Found ${venues.length} venues already loaded`);
      }
    };
    
    loadInitialData();
  }, [fetchVenues, venues.length]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filteredV = venues.filter(venue =>
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVenues(filteredV);
      
      const filteredG = galleries.filter(gallery =>
        gallery.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gallery.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gallery.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGalleries(filteredG);
    } else {
      setFilteredVenues(venues);
      setFilteredGalleries(galleries);
    }
  }, [searchQuery, venues, galleries]);

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
        placeholder="Search venues, galleries, locations..."
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
          
          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'venues' && styles.activeTab]}
              onPress={() => setActiveTab('venues')}
            >
              <Text style={[styles.tabText, activeTab === 'venues' && styles.activeTabText]}>Venues</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'galleries' && styles.activeTab]}
              onPress={() => setActiveTab('galleries')}
            >
              <Text style={[styles.tabText, activeTab === 'galleries' && styles.activeTabText]}>Galleries</Text>
            </TouchableOpacity>
          </View>
          
          {/* Test Buttons */}
          <View style={styles.testButtonsContainer}>
            <TouchableOpacity 
              style={[styles.testButton, styles.timeframeButton]}
              onPress={() => router.push('/timeframe-test')}
            >
              <Text style={styles.testButtonText}>🏛️ Test TimeFrame</Text>
            </TouchableOpacity>
          </View>
          
          {/* Refresh TimeFrame Data Button */}
          <TouchableOpacity 
            style={[styles.testButton, styles.refreshButton]}
            onPress={async () => {
              setRefreshing(true);
              await fetchVenues();
              await refetchGalleries();
              setRefreshing(false);
            }}
            disabled={refreshing}
          >
            <Text style={styles.testButtonText}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}
            </Text>
          </TouchableOpacity>
          
          {isUsingMockData && (
            <View style={styles.mockDataBanner}>
              <Text style={styles.mockDataText}>
                📱 Using sample data - TIMEFRAME API unavailable
              </Text>
            </View>
          )}

          {galleriesError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>
                ⚠️ {galleriesError}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={refetchGalleries}>
                <RefreshCw size={14} color={colors.accent} />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {((activeTab === 'venues' && featuredVenues.length > 0) || searchQuery) && (
        <Text style={styles.sectionTitle}>
          {searchQuery ? "Featured Results" : "Featured Venues"}
        </Text>
      )}
    </View>
  );

  const handleVenuePress = (venue: Venue) => {
    setSelectedVenue(venue);
    setVenueModalVisible(true);
  };

  const handleGalleryPress = (gallery: any) => {
    setSelectedGallery(gallery);
    setGalleryModalVisible(true);
  };

  const handleCloseVenueModal = () => {
    setVenueModalVisible(false);
    setSelectedVenue(null);
  };

  const handleCloseGalleryModal = () => {
    setGalleryModalVisible(false);
    setSelectedGallery(null);
  };

  const renderFeaturedVenue = ({ item }: { item: Venue }) => (
    <FeaturedVenueCard venue={item} onPress={() => handleVenuePress(item)} />
  );

  const renderVenue = ({ item }: { item: Venue }) => (
    <VenueCard venue={item} onPress={() => handleVenuePress(item)} />
  );

  const renderGalleryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.galleryCard}
      onPress={() => handleGalleryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.accent} fill={colors.accent} />
            <Text style={styles.rating}>{item.rating || 4.8}</Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.metaContainer}>
          <View style={styles.hoursContainer}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={styles.hours}>{item.hours || "Open today 10AM - 6PM"}</Text>
          </View>
          <Text style={styles.category}>{item.category || "Gallery"}</Text>
        </View>
      </View>
    </TouchableOpacity>
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

  if (isLoading || galleriesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  const renderContent = () => {
    if (searchQuery) {
      // Show combined search results
      const allResults = [...filteredVenues, ...filteredGalleries];
      if (allResults.length === 0) {
        return renderEmptyState();
      }
      
      return (
        <View>
          {filteredVenues.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Venues</Text>
              <FlatList
                data={filteredVenues}
                keyExtractor={(item: Venue) => `venue-${item.id}`}
                renderItem={renderVenue}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </>
          )}
          
          {filteredGalleries.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Galleries</Text>
              <FlatList
                data={filteredGalleries}
                keyExtractor={(item: any) => `gallery-${item.id}`}
                renderItem={renderGalleryItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </>
          )}
        </View>
      );
    }
    
    if (activeTab === 'venues') {
      return (
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
              <Text style={styles.sectionTitle}>All Venues</Text>
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
      );
    }
    
    // Galleries tab
    return (
      <View>
        {filteredGalleries.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>All Galleries</Text>
            <FlatList
              data={filteredGalleries}
              keyExtractor={(item: any) => item.id}
              renderItem={renderGalleryItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No galleries available</Text>
            <Text style={styles.emptyDescription}>
              Check back later for new gallery listings.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
        <View style={styles.contentContainer}>
          {renderContent()}
        </View>
      </ScrollView>
      
      <VenueModal
        visible={venueModalVisible}
        venue={selectedVenue}
        onClose={handleCloseVenueModal}
      />
      
      <GalleryModal
        visible={galleryModalVisible}
        gallery={selectedGallery}
        onClose={handleCloseGalleryModal}
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
    fontWeight: "700" as const,
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
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.background,
  },
  galleryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardContent: {
    padding: 20,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  galleryName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
    flex: 1,
    marginRight: 12,
    fontFamily,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.accent,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hoursContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hours: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
  category: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "600" as const,
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mockDataBanner: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mockDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    flex: 1,
    marginRight: 12,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.card,
  },
  retryText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "600" as const,
  },
  testButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  testButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  timeframeButton: {
    backgroundColor: '#AC8901', // TimeFrame gold color
  },
  refreshButton: {
    backgroundColor: '#2563eb', // Blue color for refresh
    marginTop: 8,
    flex: 0,
  },
  testButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "600" as const,
  },
});