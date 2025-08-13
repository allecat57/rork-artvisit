

interface WebSocketListeners {
  [eventType: string]: ((data: any) => void)[];
}

class TimeFrameWebSocketService {
  private ws: WebSocket | null = null;
  private listeners: WebSocketListeners = {};
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private isManuallyDisconnected = false;

  private readonly WS_URL = 'wss://18849333-83fa-4dea-9464-e6ba0f0654bf-00-3dsp6vm1uqkpn.kirk.replit.dev/mobile-ws';

  constructor() {
    console.log('TimeFrame WebSocket Service initialized');
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      console.log('Connecting to TimeFrame WebSocket...');
      this.isManuallyDisconnected = false;
      this.ws = new WebSocket(this.WS_URL);

      this.ws.onopen = () => {
        console.log('✅ Connected to TimeFrame WebSocket');
        this.reconnectAttempts = 0;
        
        // Subscribe to real-time updates
        this.send({
          type: 'subscribe',
          events: ['gallery-created', 'gallery-updated', 'artwork-added', 'artwork-sold']
        });

        // Notify listeners about connection
        this.notifyListeners('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Real-time update received:', data);
          
          // Notify listeners about updates
          if (data.type && this.listeners[data.type]) {
            this.listeners[data.type].forEach(callback => callback(data));
          }

          // Also notify general message listeners
          this.notifyListeners('message', data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 Disconnected from TimeFrame WebSocket', event.code, event.reason);
        this.notifyListeners('connection', { status: 'disconnected' });
        
        // Auto-reconnect if not manually disconnected
        if (!this.isManuallyDisconnected && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ TimeFrame WebSocket error:', error);
        this.notifyListeners('connection', { status: 'error', error });
      };

    } catch (error) {
      console.error('Failed to create TimeFrame WebSocket connection:', error);
      this.notifyListeners('connection', { status: 'error', error });
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectInterval}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, this.reconnectInterval);
  }

  send(data: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.ws.send(message);
        console.log('📤 Sent message to TimeFrame:', data);
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    } else {
      console.warn('⚠️ Cannot send message - WebSocket not connected');
      return false;
    }
  }

  // Listen for specific events
  addEventListener(eventType: string, callback: (data: any) => void): void {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
    console.log(`👂 Added listener for event: ${eventType}`);
  }

  // Remove event listener
  removeEventListener(eventType: string, callback: (data: any) => void): void {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
      console.log(`🗑️ Removed listener for event: ${eventType}`);
    }
  }

  // Remove all listeners for an event type
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      delete this.listeners[eventType];
      console.log(`🗑️ Removed all listeners for event: ${eventType}`);
    } else {
      this.listeners = {};
      console.log('🗑️ Removed all event listeners');
    }
  }

  private notifyListeners(eventType: string, data: any): void {
    if (this.listeners[eventType]) {
      this.listeners[eventType].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${eventType}:`, error);
        }
      });
    }
  }

  disconnect(): void {
    console.log('🔌 Manually disconnecting from TimeFrame WebSocket');
    this.isManuallyDisconnected = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.notifyListeners('connection', { status: 'disconnected' });
  }

  // Get connection status
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  // Subscribe to specific gallery updates
  subscribeToGallery(galleryId: string): void {
    this.send({
      type: 'subscribe-gallery',
      galleryId
    });
  }

  // Unsubscribe from gallery updates
  unsubscribeFromGallery(galleryId: string): void {
    this.send({
      type: 'unsubscribe-gallery',
      galleryId
    });
  }

  // Subscribe to artwork updates
  subscribeToArtwork(artworkId: string): void {
    this.send({
      type: 'subscribe-artwork',
      artworkId
    });
  }

  // Ping server to keep connection alive
  ping(): void {
    this.send({ type: 'ping', timestamp: new Date().toISOString() });
  }
}

// Export singleton instance
export default new TimeFrameWebSocketService();