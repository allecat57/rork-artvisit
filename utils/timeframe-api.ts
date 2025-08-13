import axios from 'axios';
import { mockApiResponses } from '@/mocks/timeframe-data';

const BASE_URL = 'https://18849333-83fa-4dea-9464-e6ba0f0654bf-00-3dsp6vm1uqkpn.kirk.replit.dev';
const USE_MOCK_DATA = false; // Set to true for development/testing

class TimeFrameAPI {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Get all galleries and museums
  async getGalleries() {
    if (USE_MOCK_DATA) {
      console.log('🎨 Using mock TimeFrame data');
      return mockApiResponses.galleries;
    }
    
    try {
      const response = await this.api.get('/api/mobile/galleries');
      return response.data;
    } catch (error) {
      console.warn('⚠️ TimeFrame API unavailable, using mock data');
      return mockApiResponses.galleries;
    }
  }

  // Get specific gallery details
  async getGallery(id: number) {
    if (USE_MOCK_DATA) {
      const gallery = mockApiResponses.galleries.data.find(g => g.id === id);
      return {
        success: true,
        data: gallery || null
      };
    }
    
    try {
      const response = await this.api.get(`/api/mobile/galleries/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ TimeFrame API unavailable for gallery ${id}, using mock data`);
      const gallery = mockApiResponses.galleries.data.find(g => g.id === id);
      return {
        success: true,
        data: gallery || null
      };
    }
  }

  // Get artworks for a gallery
  async getGalleryArtworks(galleryId: number) {
    if (USE_MOCK_DATA) {
      return mockApiResponses.getGalleryArtworks(galleryId);
    }
    
    try {
      const response = await this.api.get(`/api/mobile/galleries/${galleryId}/artworks`);
      return response.data;
    } catch (error) {
      console.warn(`⚠️ TimeFrame API unavailable for gallery ${galleryId} artworks, using mock data`);
      return mockApiResponses.getGalleryArtworks(galleryId);
    }
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