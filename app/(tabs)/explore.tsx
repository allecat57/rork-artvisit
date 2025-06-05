import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { useVenueStore } from '@/store/useVenueStore';
import { useLocationStore } from '@/store/useLocationStore';
import { calculateDistance } from '@/utils/calculateDistance';
import CategoryCard from '@/components/CategoryCard';
import VenueCard from '@/components/VenueCard';
import FeaturedVenueCard from '@/components/FeaturedVenueCard';
import SearchBar from '@/components/SearchBar';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import * as Analytics from '@/utils/analytics';

export default function ExploreScreen() {
  const router = useRouter();
  const { venues, categories, isLoading, fetchVenues } = useVenueStore();
  const { currentLocation, locationName, openLocationPicker } = useLocationStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVenues();
    
    // Log screen view
    Analytics.trackScreenView('explore', 'ExploreScreen');
  }, []);

  const featuredVenues = venues.filter(venue => venue.featured);
  
  const nearbyVenues = venues
    .filter(venue => {
      if (!currentLocation || !venue.coordinates) return false;
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        venue.coordinates.latitude,
        venue.coordinates.longitude
      );
      return distance < 10; // Within 10 km
    })
    .sort((a, b) => {
      if (!currentLocation || !a.coordinates || !b.coordinates) return 0;
      const distanceA = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        a.coordinates.latitude,
        a.coordinates.longitude
      );
      const distanceB = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        b.coordinates.latitude,
        b.coordinates.longitude
      );
      return distanceA - distanceB;
    })
    .slice(0, 5);

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
    
    // Log category selection
    Analytics.logEvent('select_category', {
      category_id: categoryId
    });
  };

  const handleVenuePress = (venueId: string) => {
    router.push(`/venue/${venueId}`);
    
    // Log venue selection
    Analytics.logEvent('select_venue', {
      venue_id: venueId
    });
  };

  const handleLocationPress = () => {
    openLocationPicker();
    
    // Log location picker opened
    Analytics.logEvent('open_location_picker', {
      current_location: locationName
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Log search
    if (query.trim()) {
      Analytics.logEvent('search', {
        search_term: query
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
            <MapPin size={16} color={colors.primary.accent} />
            <Text style={styles.locationText} numberOfLines={1}>
              {locationName || 'Set location'}
            </Text>
          </TouchableOpacity>
        </View>

        <SearchBar
          placeholder="Search venues..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchBar}
        />

        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryCard
              category={{
                id: item.id,
                title: item.title,
                imageUrl: item.imageUrl
              }}
              onPress={() => handleCategoryPress(item.id)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        />

        <Text style={styles.sectionTitle}>Featured</Text>
        <FlatList
          data={featuredVenues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            item && <FeaturedVenueCard
              venue={item}
              onPress={() => handleVenuePress(item.id)}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredContainer}
        />

        {currentLocation && nearbyVenues.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Nearby</Text>
            <View style={styles.venuesContainer}>
              {nearbyVenues.map((venue) => (
                venue && <VenueCard
                  key={venue.id}
                  venue={venue}
                  onPress={() => handleVenuePress(venue.id)}
                />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Popular</Text>
        <View style={styles.venuesContainer}>
          {venues
            .filter(venue => venue.rating >= 4.5)
            .slice(0, 4)
            .map((venue) => (
              venue && <VenueCard
                key={venue.id}
                venue={venue}
                onPress={() => handleVenuePress(venue.id)}
              />
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
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: 150,
  },
  locationText: {
    ...typography.bodySmall,
    color: colors.primary.accent,
    marginLeft: 4,
  },
  searchBar: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.primary.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  featuredContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  venuesContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 10,
  },
});