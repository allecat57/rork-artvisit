import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Stack } from 'expo-router';
import { MapPin, RefreshCw, Search } from 'lucide-react-native';
import { useLocationMuseums } from '@/hooks/useLocationMuseums';
import { useLocationStore } from '@/store/useLocationStore';
import { LocationBasedMuseum } from '@/utils/location-museum-service';

const colors = {
  background: '#013025',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  accent: '#AC8901',
  card: '#1a4037',
  border: 'rgba(172, 137, 1, 0.2)',
};

const fontFamily = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia, serif',
});

export default function LocationServicesTest() {
  const {
    nearbyMuseums,
    featuredMuseums,
    loading,
    error,
    refetch,
    searchMuseums,
    getMuseumsByCity,
    clearCacheAndRefetch,
  } = useLocationMuseums(50); // 50 mile radius

  const { currentLocation, getCurrentLocation, locationError } = useLocationStore();
  const [searchResults, setSearchResults] = useState<LocationBasedMuseum[]>([]);
  const [cityResults, setCityResults] = useState<LocationBasedMuseum[]>([]);
  const [testLoading, setTestLoading] = useState(false);

  const handleGetLocation = async () => {
    setTestLoading(true);
    try {
      await getCurrentLocation();
    } catch (err) {
      console.error('Error getting location:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const handleSearchTest = async () => {
    setTestLoading(true);
    try {
      const results = await searchMuseums('art');
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching museums:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const handleCityTest = async () => {
    setTestLoading(true);
    try {
      const results = await getMuseumsByCity('Los Angeles');
      setCityResults(results);
    } catch (err) {
      console.error('Error getting city museums:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const renderMuseumCard = (museum: LocationBasedMuseum, index: number) => (
    <View key={`${museum.id}-${index}`} style={styles.museumCard}>
      <Text style={styles.museumName}>{museum.name}</Text>
      <View style={styles.locationRow}>
        <MapPin size={14} color={colors.textSecondary} />
        <Text style={styles.locationText}>{museum.location}</Text>
        {museum.distanceText && (
          <Text style={styles.distanceText}>• {museum.distanceText}</Text>
        )}
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {museum.description}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.rating}>⭐ {museum.rating.toFixed(1)}</Text>
        <Text style={styles.type}>{museum.type}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Location Services Test',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily },
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Location Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location Status</Text>
          <View style={styles.statusCard}>
            {currentLocation ? (
              <>
                <Text style={styles.statusText}>
                  ✅ Location: {currentLocation.city || 'Unknown City'}
                </Text>
                <Text style={styles.coordText}>
                  Lat: {currentLocation.latitude.toFixed(4)}, 
                  Lng: {currentLocation.longitude.toFixed(4)}
                </Text>
              </>
            ) : (
              <Text style={styles.statusText}>
                ❌ No location available
              </Text>
            )}
            {locationError && (
              <Text style={styles.errorText}>Error: {locationError}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleGetLocation}
            disabled={testLoading}
          >
            <MapPin size={16} color={colors.background} />
            <Text style={styles.buttonText}>
              {testLoading ? 'Getting Location...' : 'Get Current Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Museums */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏛️ Nearby Museums ({nearbyMuseums.length})</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.loadingText}>Loading museums...</Text>
            </View>
          ) : error ? (
            <Text style={styles.errorText}>Error: {error}</Text>
          ) : nearbyMuseums.length > 0 ? (
            nearbyMuseums.slice(0, 3).map(renderMuseumCard)
          ) : (
            <Text style={styles.emptyText}>No nearby museums found</Text>
          )}
          
          <TouchableOpacity
            style={styles.button}
            onPress={refetch}
            disabled={loading}
          >
            <RefreshCw size={16} color={colors.background} />
            <Text style={styles.buttonText}>Refresh Museums</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Museums */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Featured Museums ({featuredMuseums.length})</Text>
          {featuredMuseums.length > 0 ? (
            featuredMuseums.slice(0, 2).map(renderMuseumCard)
          ) : (
            <Text style={styles.emptyText}>No featured museums</Text>
          )}
        </View>

        {/* Search Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Search Test (&quot;art&quot;)</Text>
          {searchResults.length > 0 ? (
            searchResults.slice(0, 2).map(renderMuseumCard)
          ) : (
            <Text style={styles.emptyText}>No search results yet</Text>
          )}
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleSearchTest}
            disabled={testLoading}
          >
            <Search size={16} color={colors.background} />
            <Text style={styles.buttonText}>
              {testLoading ? 'Searching...' : 'Search for &quot;art&quot;'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* City Test */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏙️ City Test (Los Angeles)</Text>
          {cityResults.length > 0 ? (
            cityResults.map(renderMuseumCard)
          ) : (
            <Text style={styles.emptyText}>No city results yet</Text>
          )}
          
          <TouchableOpacity
            style={styles.button}
            onPress={handleCityTest}
            disabled={testLoading}
          >
            <MapPin size={16} color={colors.background} />
            <Text style={styles.buttonText}>
              {testLoading ? 'Loading...' : 'Get LA Museums'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Clear Cache */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={clearCacheAndRefetch}
            disabled={loading}
          >
            <RefreshCw size={16} color={colors.text} />
            <Text style={[styles.buttonText, styles.clearButtonText]}>
              Clear Cache & Refresh All
            </Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    fontFamily,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  coordText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 4,
  },
  button: {
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    color: colors.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  museumCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  museumName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    fontFamily,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  distanceText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  type: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});