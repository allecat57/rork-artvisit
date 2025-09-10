import axios from 'axios';
import { mockApiResponses } from '@/mocks/timeframe-data';
import { calculateDistance } from '@/utils/calculateDistance';

const BASE_URL = 'https://18849333-83fa-4dea-9464-e6ba0f0654bf-00-3dsp6vm1uqkpn.kirk.replit.dev';
const USE_MOCK_DATA = false; // Set to true for development/testing - using mock data for now

class TimeFrameAPI {
  private api;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Clear all cached data
  clearCache() {
    console.log('🧹 Clearing TimeFrame API cache');
    this.cache.clear();
  }

  // Check if cached data is still valid
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  // Get cached data if valid
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  // Set cached data
  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Get galleries near a location
  async getGalleriesNearLocation(
    latitude?: number,
    longitude?: number,
    radius: number = 50, // miles
    useCache: boolean = true
  ) {
    const cacheKey = latitude && longitude 
      ? `galleries-location-${latitude}-${longitude}-${radius}`
      : 'galleries-all';
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log('📦 Using cached location-based galleries data');
        return cached;
      }
    }
    
    // For now, return all galleries and let the client filter by location
    // In a real implementation, the API would handle location filtering
    const allGalleries = await this.getGalleries(useCache);
    
    if (latitude && longitude && allGalleries.success) {
      // Client-side filtering by distance (in a real app, this would be server-side)
      
      const filteredGalleries = allGalleries.data.filter((gallery: any) => {
        if (!gallery.coordinates) return false;
        
        const distance = calculateDistance(
          latitude,
          longitude,
          gallery.coordinates.latitude,
          gallery.coordinates.longitude
        );
        
        return distance <= radius;
      });
      
      const result = {
        ...allGalleries,
        data: filteredGalleries,
        count: filteredGalleries.length
      };
      
      this.setCachedData(cacheKey, result);
      return result;
    }
    
    return allGalleries;
  }

  // Get galleries by city
  async getGalleriesByCity(city: string, useCache: boolean = true) {
    const cacheKey = `galleries-city-${city.toLowerCase()}`;
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log(`📦 Using cached galleries data for city: ${city}`);
        return cached;
      }
    }
    
    const allGalleries = await this.getGalleries(useCache);
    
    if (allGalleries.success) {
      const cityGalleries = allGalleries.data.filter((gallery: any) => 
        gallery.city?.toLowerCase().includes(city.toLowerCase()) ||
        gallery.location?.toLowerCase().includes(city.toLowerCase())
      );
      
      const result = {
        ...allGalleries,
        data: cityGalleries,
        count: cityGalleries.length
      };
      
      this.setCachedData(cacheKey, result);
      return result;
    }
    
    return allGalleries;
  }

  // Get all galleries and museums
  async getGalleries(useCache: boolean = true) {
    const cacheKey = 'galleries';
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log('📦 Using cached galleries data');
        return cached;
      }
    }
    
    if (USE_MOCK_DATA) {
      console.log('🎨 Using mock TimeFrame data');
      const data = mockApiResponses.galleries;
      this.setCachedData(cacheKey, data);
      return data;
    }
    
    try {
      const response = await this.api.get('/api/mobile/galleries');
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ TimeFrame API unavailable, using mock data');
      const data = mockApiResponses.galleries;
      this.setCachedData(cacheKey, data);
      return data;
    }
  }

  // Get specific gallery details
  async getGallery(id: number, useCache: boolean = true) {
    const cacheKey = `gallery-${id}`;
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log(`📦 Using cached gallery ${id} data`);
        return cached;
      }
    }
    
    if (USE_MOCK_DATA) {
      const gallery = mockApiResponses.galleries.data.find(g => g.id === id);
      const data = {
        success: true,
        data: gallery || null
      };
      this.setCachedData(cacheKey, data);
      return data;
    }
    
    try {
      const response = await this.api.get(`/api/mobile/galleries/${id}`);
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ TimeFrame API unavailable for gallery ${id}, using mock data`);
      const gallery = mockApiResponses.galleries.data.find(g => g.id === id);
      const data = {
        success: true,
        data: gallery || null
      };
      this.setCachedData(cacheKey, data);
      return data;
    }
  }

  // Get artworks for a gallery
  async getGalleryArtworks(galleryId: number, useCache: boolean = true) {
    const cacheKey = `gallery-${galleryId}-artworks`;
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log(`📦 Using cached artworks for gallery ${galleryId}`);
        return cached;
      }
    }
    
    if (USE_MOCK_DATA) {
      const data = mockApiResponses.getGalleryArtworks(galleryId);
      this.setCachedData(cacheKey, data);
      return data;
    }
    
    try {
      const response = await this.api.get(`/api/mobile/galleries/${galleryId}/artworks`);
      this.setCachedData(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ TimeFrame API unavailable for gallery ${galleryId} artworks, using mock data`);
      const data = mockApiResponses.getGalleryArtworks(galleryId);
      this.setCachedData(cacheKey, data);
      return data;
    }
  }

  // Search galleries by query
  async searchGalleries(query: string, useCache: boolean = true) {
    const cacheKey = `galleries-search-${query.toLowerCase()}`;
    
    if (useCache) {
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log(`📦 Using cached search results for: ${query}`);
        return cached;
      }
    }
    
    const allGalleries = await this.getGalleries(useCache);
    
    if (allGalleries.success) {
      const lowercaseQuery = query.toLowerCase();
      const searchResults = allGalleries.data.filter((gallery: any) => 
        gallery.name?.toLowerCase().includes(lowercaseQuery) ||
        gallery.description?.toLowerCase().includes(lowercaseQuery) ||
        gallery.location?.toLowerCase().includes(lowercaseQuery) ||
        gallery.city?.toLowerCase().includes(lowercaseQuery)
      );
      
      const result = {
        ...allGalleries,
        data: searchResults,
        count: searchResults.length
      };
      
      this.setCachedData(cacheKey, result);
      return result;
    }
    
    return allGalleries;
  }

  // Test connection
  async testConnection() {
    if (USE_MOCK_DATA) {
      return {
        status: 'mock',
        data: mockApiResponses.galleries,
        timestamp: new Date().toISOString()
      };
    }
    
    try {
      const response = await this.api.get('/api/mobile/galleries');
      return {
        status: 'connected',
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'fallback',
        data: mockApiResponses.galleries,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default new TimeFrameAPI();