import axios from 'axios';

const BASE_URL = 'https://18849333-83fa-4dea-9464-e6ba0f0654bf-00-3dsp6vm1uqkpn.kirk.replit.dev';

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
    const response = await this.api.get('/api/mobile/galleries');
    return response.data;
  }

  // Get specific gallery details
  async getGallery(id: number) {
    const response = await this.api.get(`/api/mobile/galleries/${id}`);
    return response.data;
  }

  // Get artworks for a gallery
  async getGalleryArtworks(galleryId: number) {
    const response = await this.api.get(`/api/mobile/galleries/${galleryId}/artworks`);
    return response.data;
  }

  // Test connection
  async testConnection() {
    const response = await this.api.get('/api/mobile/galleries');
    return {
      status: 'connected',
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }
}

export default new TimeFrameAPI();