export const TIMEFRAME_CONFIG = {
  API_BASE: __DEV__ 
    ? "http://localhost:5000"
    : "https://your-domain.replit.app",
  
  USE_MOCK_DATA: false,
  
  ENDPOINTS: {
    GALLERIES: "/api/mobile/galleries",
    GALLERY_DETAIL: "/api/mobile/galleries",
    ARTWORKS: "/api/mobile/galleries",
    WEBSOCKET: "/mobile-ws"
  }
};
