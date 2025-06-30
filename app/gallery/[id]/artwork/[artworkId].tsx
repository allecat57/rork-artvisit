import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Share2, ArrowLeft, Info, DollarSign } from 'lucide-react-native';
import colors from '../../../../constants/colors';

// Mock data - in a real app, fetch this from your API
const artworks = [
  {
    id: '101',
    galleryId: '1',
    title: 'Abstract Harmony',
    artist: 'Jane Smith',
    year: '2021',
    medium: 'Oil on canvas',
    dimensions: '120 x 90 cm',
    description: 'This abstract piece explores the harmony between color and form, creating a visual symphony that invites the viewer to interpret their own meaning.',
    price: '$5,200',
    image: 'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '102',
    galleryId: '1',
    title: 'Urban Landscape',
    artist: 'Michael Johnson',
    year: '2019',
    medium: 'Acrylic on canvas',
    dimensions: '150 x 100 cm',
    description: 'A vibrant depiction of city life, capturing the energy and chaos of urban environments through bold colors and dynamic brushstrokes.',
    price: '$4,800',
    image: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '201',
    galleryId: '2',
    title: 'Portrait of a Lady',
    artist: 'Leonardo da Vinci',
    year: '1503',
    medium: 'Oil on poplar panel',
    dimensions: '77 x 53 cm',
    description: 'A masterpiece of Renaissance portraiture, showcasing the artist\'s unparalleled skill in capturing human expression and emotion.',
    price: 'Not for sale',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '202',
    galleryId: '2',
    title: 'Sunset over the Sea',
    artist: 'Claude Monet',
    year: '1872',
    medium: 'Oil on canvas',
    dimensions: '50 x 65 cm',
    description: 'A stunning Impressionist seascape that captures the fleeting effects of light and color at sunset, demonstrating Monet\'s revolutionary approach to painting.',
    price: 'Not for sale',
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  }
];

// Mock gallery data
const galleries = [
  { id: '1', name: 'Modern Art Gallery', location: 'New York, NY' },
  { id: '2', name: 'Classical Art Museum', location: 'London, UK' }
];

export default function ArtworkDetailScreen() {
  const { id: galleryId, artworkId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? colors.light : colors.dark;
  const bgColor = isDark ? colors.dark : colors.light;
  
  const [artwork, setArtwork] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  useEffect(() => {
    // Find artwork and gallery from mock data
    const foundArtwork = artworks.find(a => a.id === artworkId);
    const foundGallery = galleries.find(g => g.id === galleryId);
    
    setArtwork(foundArtwork);
    setGallery(foundGallery);
  }, [galleryId, artworkId]);
  
  if (!artwork || !gallery) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: textColor }]}>Loading artwork...</Text>
      </SafeAreaView>
    );
  }
  
  const handleBack = () => {
    router.back();
  };
  
  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };
  
  const handleShare = () => {
    // Implement share functionality
  };
  
  const handlePurchase = () => {
    // Navigate to purchase flow or show purchase modal
  };
  
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={textColor} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleFavoriteToggle}
            >
              <Heart 
                size={24} 
                color={isFavorite ? colors.primary : textColor} 
                fill={isFavorite ? colors.primary : 'transparent'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Share2 size={24} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Image source={{ uri: artwork.image }} style={styles.image} />
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: textColor }]}>{artwork.title}</Text>
          <Text style={[styles.artist, { color: textColor }]}>{artwork.artist}, {artwork.year}</Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: textColor }]}>Medium:</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>{artwork.medium}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: textColor }]}>Dimensions:</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>{artwork.dimensions}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: textColor }]}>Gallery:</Text>
              <Text style={[styles.detailValue, { color: textColor }]}>{gallery.name}</Text>
            </View>
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionTitle, { color: textColor }]}>Description</Text>
            <Text 
              style={[styles.description, { color: textColor }]}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {artwork.description}
            </Text>
            
            {artwork.description.length > 120 && (
              <TouchableOpacity onPress={toggleDescription} style={styles.readMoreButton}>
                <Text style={styles.readMoreText}>
                  {showFullDescription ? 'Read less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <DollarSign size={20} color={colors.primary} />
              <Text style={[styles.price, { color: textColor }]}>{artwork.price}</Text>
            </View>
            
            {artwork.price !== 'Not for sale' && (
              <TouchableOpacity 
                style={[styles.purchaseButton, { backgroundColor: colors.primary }]}
                onPress={handlePurchase}
              >
                <Text style={styles.purchaseButtonText}>Purchase</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.infoButton, { borderColor: textColor }]}
            onPress={() => {
              // Show more details or navigate to details screen
            }}
          >
            <Info size={18} color={textColor} />
            <Text style={[styles.infoButtonText, { color: textColor }]}>More Information</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.8,
  },
  detailsContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 16,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    color: colors.primary,
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  purchaseButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  purchaseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoButtonText: {
    marginLeft: 8,
    fontSize: 16,
  },
});