import { calculateDistance, formatDistance } from '@/utils/calculateDistance';
import TimeFrameAPI from '@/utils/timeframe-api';
import { Venue } from '@/types/venue';

export interface TimeFrameGallery {
  id: number;
  name: string;
  description: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  city: string;
  state: string;
  country: string;
  established: number;
  artworks?: any[];
}

export interface LocationBasedMuseum extends Venue {
  timeframeId: number;
  distanceFromUser?: number;
  distanceText?: string;
}

class LocationMuseumService {
  private cache: Map<string, { data: LocationBasedMuseum[]; timestamp: number }> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private getCachedData(key: string): LocationBasedMuseum[] | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log('📦 Using cached location-based museums');
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: LocationBasedMuseum[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Convert TimeFrame gallery to Venue format
  private convertGalleryToVenue(gallery: TimeFrameGallery, userLocation?: { latitude: number; longitude: number }): LocationBasedMuseum {
    let distance: number | undefined;
    let distanceText: string | undefined;

    if (userLocation && gallery.coordinates) {
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        gallery.coordinates.latitude,
        gallery.coordinates.longitude
      );
      distanceText = formatDistance(distance);
    }

    return {
      id: `timeframe-${gallery.id}`,
      timeframeId: gallery.id,
      name: gallery.name,
      type: 'Museum',
      description: gallery.description,
      imageUrl: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      location: gallery.location,
      distance: distanceText || 'Unknown distance',
      rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
      openingHours: 'Tue-Sun 10AM-6PM',
      admission: '$15-25',
      featured: distance ? distance < 10 : false, // Feature if within 10 miles
      category: 'Art Gallery',
      tags: ['art', 'gallery', 'museum', 'timeframe'],
      coordinates: gallery.coordinates,
      address: gallery.address,
      distanceFromUser: distance,
      distanceText
    };
  }

  // Get museums near user's location
  async getMuseumsNearLocation(
    userLocation?: { latitude: number; longitude: number },
    maxDistance: number = 50, // miles
    useCache: boolean = true
  ): Promise<LocationBasedMuseum[]> {
    const cacheKey = userLocation 
      ? `museums-${userLocation.latitude}-${userLocation.longitude}-${maxDistance}`
      : 'museums-all';

    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.log('🏛️ Fetching museums from TimeFrame API...');
      const galleriesResponse = await TimeFrameAPI.getGalleries(false);
      
      if (!galleriesResponse.success) {
        throw new Error('Failed to fetch galleries from TimeFrame');
      }

      let museums: LocationBasedMuseum[] = galleriesResponse.data.map((gallery: TimeFrameGallery) => 
        this.convertGalleryToVenue(gallery, userLocation)
      );

      // Filter by distance if user location is provided
      if (userLocation && maxDistance > 0) {
        museums = museums.filter((museum: LocationBasedMuseum) => {
          return museum.distanceFromUser !== undefined && museum.distanceFromUser <= maxDistance;
        });
      }

      // Sort by distance (closest first)
      museums.sort((a: LocationBasedMuseum, b: LocationBasedMuseum) => {
        if (a.distanceFromUser === undefined) return 1;
        if (b.distanceFromUser === undefined) return -1;
        return a.distanceFromUser - b.distanceFromUser;
      });

      console.log(`✅ Found ${museums.length} museums ${userLocation ? 'near user location' : 'total'}`);
      
      this.setCachedData(cacheKey, museums);
      return museums;
      
    } catch (error) {
      console.error('❌ Error fetching location-based museums:', error);
      return [];
    }
  }

  // Get museums in a specific city
  async getMuseumsByCity(city: string, useCache: boolean = true): Promise<LocationBasedMuseum[]> {
    const cacheKey = `museums-city-${city.toLowerCase()}`;

    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const galleriesResponse = await TimeFrameAPI.getGalleries(false);
      
      if (!galleriesResponse.success) {
        throw new Error('Failed to fetch galleries from TimeFrame');
      }

      const cityMuseums = galleriesResponse.data
        .filter((gallery: TimeFrameGallery) => 
          gallery.city.toLowerCase().includes(city.toLowerCase()) ||
          gallery.location.toLowerCase().includes(city.toLowerCase())
        )
        .map((gallery: TimeFrameGallery) => this.convertGalleryToVenue(gallery));

      console.log(`✅ Found ${cityMuseums.length} museums in ${city}`);
      
      this.setCachedData(cacheKey, cityMuseums);
      return cityMuseums;
      
    } catch (error) {
      console.error(`❌ Error fetching museums for city ${city}:`, error);
      return [];
    }
  }

  // Get featured museums (closest or most popular)
  async getFeaturedMuseums(
    userLocation?: { latitude: number; longitude: number },
    limit: number = 5
  ): Promise<LocationBasedMuseum[]> {
    const allMuseums = await this.getMuseumsNearLocation(userLocation, 100, true);
    
    // Prioritize by distance and rating
    const featured = allMuseums
      .sort((a, b) => {
        // If both have distance, sort by distance
        if (a.distanceFromUser !== undefined && b.distanceFromUser !== undefined) {
          return a.distanceFromUser - b.distanceFromUser;
        }
        // Otherwise sort by rating
        return b.rating - a.rating;
      })
      .slice(0, limit);

    return featured;
  }

  // Clear cache
  clearCache(): void {
    console.log('🧹 Clearing location museum service cache');
    this.cache.clear();
  }

  // Search museums by name or description
  async searchMuseums(
    query: string,
    userLocation?: { latitude: number; longitude: number }
  ): Promise<LocationBasedMuseum[]> {
    const allMuseums = await this.getMuseumsNearLocation(userLocation, 1000, true); // Large radius for search
    
    const lowercaseQuery = query.toLowerCase();
    return allMuseums.filter(museum => 
      museum.name.toLowerCase().includes(lowercaseQuery) ||
      museum.description.toLowerCase().includes(lowercaseQuery) ||
      museum.location.toLowerCase().includes(lowercaseQuery) ||
      museum.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export default new LocationMuseumService();