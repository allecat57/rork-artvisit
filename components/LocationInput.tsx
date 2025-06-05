import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Alert
} from "react-native";
import { X, MapPin, Search, Navigation, Compass, AlertCircle } from "lucide-react-native";
import * as Location from 'expo-location';
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";

interface LocationInputProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: { latitude: number; longitude: number }, name: string) => void;
}

interface LocationSuggestion {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

// Enhanced location suggestions for better coverage
const mockLocationSuggestions: LocationSuggestion[] = [
  {
    id: "1",
    name: "New York, NY",
    description: "New York City, United States",
    location: { latitude: 40.7128, longitude: -74.0060 }
  },
  {
    id: "2",
    name: "Los Angeles, CA",
    description: "Los Angeles, United States",
    location: { latitude: 34.0522, longitude: -118.2437 }
  },
  {
    id: "3",
    name: "Chicago, IL",
    description: "Chicago, United States",
    location: { latitude: 41.8781, longitude: -87.6298 }
  },
  {
    id: "4",
    name: "San Francisco, CA",
    description: "San Francisco, United States",
    location: { latitude: 37.7749, longitude: -122.4194 }
  },
  {
    id: "5",
    name: "Washington, DC",
    description: "Washington DC, United States",
    location: { latitude: 38.9072, longitude: -77.0369 }
  },
  {
    id: "6",
    name: "Boston, MA",
    description: "Boston, United States",
    location: { latitude: 42.3601, longitude: -71.0589 }
  },
  {
    id: "7",
    name: "Miami, FL",
    description: "Miami, United States",
    location: { latitude: 25.7617, longitude: -80.1918 }
  },
  {
    id: "8",
    name: "Seattle, WA",
    description: "Seattle, United States",
    location: { latitude: 47.6062, longitude: -122.3321 }
  },
  {
    id: "9",
    name: "Austin, TX",
    description: "Austin, United States",
    location: { latitude: 30.2672, longitude: -97.7431 }
  },
  {
    id: "10",
    name: "Denver, CO",
    description: "Denver, United States",
    location: { latitude: 39.7392, longitude: -104.9903 }
  },
  {
    id: "11",
    name: "Philadelphia, PA",
    description: "Philadelphia, United States",
    location: { latitude: 39.9526, longitude: -75.1652 }
  },
  {
    id: "12",
    name: "Atlanta, GA",
    description: "Atlanta, United States",
    location: { latitude: 33.7490, longitude: -84.3880 }
  },
  {
    id: "13",
    name: "Houston, TX",
    description: "Houston, United States",
    location: { latitude: 29.7604, longitude: -95.3698 }
  },
  {
    id: "14",
    name: "Phoenix, AZ",
    description: "Phoenix, United States",
    location: { latitude: 33.4484, longitude: -112.0740 }
  },
  {
    id: "15",
    name: "San Diego, CA",
    description: "San Diego, United States",
    location: { latitude: 32.7157, longitude: -117.1611 }
  },
  {
    id: "16",
    name: "Dallas, TX",
    description: "Dallas, United States",
    location: { latitude: 32.7767, longitude: -96.7970 }
  },
  {
    id: "17",
    name: "Portland, OR",
    description: "Portland, United States",
    location: { latitude: 45.5051, longitude: -122.6750 }
  },
  {
    id: "18",
    name: "Las Vegas, NV",
    description: "Las Vegas, United States",
    location: { latitude: 36.1699, longitude: -115.1398 }
  },
  {
    id: "19",
    name: "New Orleans, LA",
    description: "New Orleans, United States",
    location: { latitude: 29.9511, longitude: -90.0715 }
  },
  {
    id: "20",
    name: "Nashville, TN",
    description: "Nashville, United States",
    location: { latitude: 36.1627, longitude: -86.7816 }
  }
];

export default function LocationInput({ 
  visible, 
  onClose,
  onSelectLocation
}: LocationInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [recentLocations, setRecentLocations] = useState<LocationSuggestion[]>([]);

  useEffect(() => {
    // Load popular locations when modal opens
    if (visible && searchQuery === "") {
      setSuggestions(mockLocationSuggestions.slice(0, 5));
    }
  }, [visible]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setLocationError(null);
    
    if (text.trim() === "") {
      setSuggestions(mockLocationSuggestions.slice(0, 5));
      return;
    }
    
    // In a real app, we would call a geocoding API here
    // For this demo, we'll filter our mock data
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filteredSuggestions = mockLocationSuggestions.filter(
        suggestion => 
          suggestion.name.toLowerCase().includes(text.toLowerCase()) ||
          suggestion.description.toLowerCase().includes(text.toLowerCase())
      );
      
      setSuggestions(filteredSuggestions);
      setIsLoading(false);
      
      if (filteredSuggestions.length === 0) {
        setLocationError("No locations found matching your search. Please try a different query.");
      }
    }, 500);
  };
  
  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    // Add to recent locations
    const updatedRecents = [suggestion, ...recentLocations.filter(loc => loc.id !== suggestion.id)].slice(0, 3);
    setRecentLocations(updatedRecents);
    
    onSelectLocation(suggestion.location, suggestion.name);
  };
  
  const handleUseCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setLocationError(null);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationError("Location permission denied. Please enable location services in your device settings.");
        setIsLoading(false);
        return;
      }
      
      // Use high accuracy for better location precision
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        mayShowUserSettingsDialog: true
      });
      
      // Get location name
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      let locationName = "Current Location";
      
      if (address) {
        locationName = address.city 
          ? `${address.city}, ${address.region || address.country}`
          : address.region 
            ? `${address.region}, ${address.country}`
            : address.country || "Current Location";
      }
      
      onSelectLocation(
        { 
          latitude: location.coords.latitude, 
          longitude: location.coords.longitude 
        },
        locationName
      );
    } catch (error) {
      console.error("Error getting current location:", error);
      setLocationError("Unable to get your current location. Please check your device settings or enter a location manually.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={[typography.heading3, styles.title]}>Set Location</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.primary.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color={colors.primary.muted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search for a city or address..."
                placeholderTextColor={colors.primary.muted}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSuggestions(mockLocationSuggestions.slice(0, 5));
                    setLocationError(null);
                  }}
                >
                  <X size={18} color={colors.primary.muted} />
                </TouchableOpacity>
              )}
            </View>
            
            <Button
              title="Use Current Location"
              onPress={handleUseCurrentLocation}
              variant="outline"
              icon={<Compass size={18} color={colors.primary.accent} />}
              style={styles.currentLocationButton}
            />
          </View>
          
          {locationError && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.status.error} />
              <Text style={styles.errorText}>{locationError}</Text>
            </View>
          )}
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.accent} />
              <Text style={[typography.body, styles.loadingText]}>
                {searchQuery ? "Searching locations..." : "Getting your location..."}
              </Text>
            </View>
          ) : (
            <>
              {recentLocations.length > 0 && searchQuery === "" && (
                <View style={styles.recentContainer}>
                  <Text style={styles.sectionTitle}>Recent Locations</Text>
                  {recentLocations.map((item) => (
                    <TouchableOpacity 
                      key={`recent-${item.id}`}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <MapPin size={20} color={colors.primary.accent} style={styles.suggestionIcon} />
                      <View>
                        <Text style={[typography.body, styles.suggestionName]}>{item.name}</Text>
                        <Text style={[typography.caption, styles.suggestionDescription]}>{item.description}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <MapPin size={20} color={colors.primary.muted} style={styles.suggestionIcon} />
                    <View>
                      <Text style={[typography.body, styles.suggestionName]}>{item.name}</Text>
                      <Text style={[typography.caption, styles.suggestionDescription]}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.suggestionsList}
                ListHeaderComponent={
                  searchQuery === "" && suggestions.length > 0 ? (
                    <Text style={styles.sectionTitle}>Popular Locations</Text>
                  ) : null
                }
                ListEmptyComponent={
                  !locationError && searchQuery.length > 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={[typography.body, styles.emptyText]}>No locations found</Text>
                    </View>
                  ) : null
                }
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.primary.background,
    borderRadius: Platform.OS === 'ios' ? 24 : 0,
    marginTop: Platform.OS === 'ios' ? 100 : 0,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
    position: "relative",
  },
  title: {
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 20,
    padding: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.primary.text,
    fontSize: 16,
    height: 48,
    fontFamily: "Arapey",
  },
  clearButton: {
    padding: 4,
  },
  currentLocationButton: {
    marginBottom: 8,
  },
  suggestionsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionName: {
    marginBottom: 2,
  },
  suggestionDescription: {
    color: colors.primary.muted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    color: colors.primary.muted,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: colors.primary.muted,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.primary.muted,
    marginBottom: 8,
    fontWeight: "600",
  },
  recentContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});