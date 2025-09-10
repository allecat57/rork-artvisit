

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
  private isEnabled = false; // Disable by default to prevent errors

  private readonly WS_URL = 'wss://18849333-83fa-4dea-9464-e6ba0f0654bf-00-3dsp6vm1uqkpn.kirk.replit.dev/mobile-ws';

  constructor() {
    console.log('TimeFrame WebSocket Service initialized');
  }

  connect(): void {
    // Check if WebSocket is enabled
    if (!this.isEnabled) {
      console.log('⚠️ TimeFrame WebSocket is disabled. Enable it first with enableWebSocket().');
      this.notifyListeners('connection', { 
        status: 'error', 
        error: 'WebSocket is disabled' 
      });
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    // Skip connection if we've exceeded max attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('⚠️ Max reconnection attempts reached. Skipping WebSocket connection.');
      this.notifyListeners('connection', { 
        status: 'error', 
        error: 'Max reconnection attempts reached' 
      });
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
        let errorMessage = 'WebSocket connection failed';
        let errorDetails: any = {};
        
        // Better error handling for different error types
        if (error instanceof ErrorEvent) {
          errorMessage = error.message || 'WebSocket ErrorEvent occurred';
          errorDetails = {
            type: 'ErrorEvent',
            message: error.message,
            filename: error.filename,
            lineno: error.lineno,
            colno: error.colno
          };
        } else if (error instanceof Event) {
          errorMessage = `WebSocket ${error.type} event occurred`;
          errorDetails = {
            type: 'Event',
            eventType: error.type,
            target: error.target?.constructor?.name || 'WebSocket',
            timeStamp: error.timeStamp
          };
        } else if (error && typeof error === 'object') {
          errorMessage = JSON.stringify(error);
          errorDetails = error;
        } else if (typeof error === 'string') {
          errorMessage = error;
          errorDetails = { message: error };
        }
        
        console.error('❌ TimeFrame WebSocket error:', errorMessage);
        console.error('Error details:', {
          ...errorDetails,
          url: this.WS_URL,
          readyState: this.ws?.readyState,
          reconnectAttempts: this.reconnectAttempts,
          timestamp: new Date().toISOString()
        });
        
        this.notifyListeners('connection', { status: 'error', error: errorMessage });
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

  // Reset reconnection attempts (useful for manual retry)
  resetReconnectionAttempts(): void {
    this.reconnectAttempts = 0;
    console.log('🔄 Reconnection attempts reset');
  }

  // Enable WebSocket connections
  enableWebSocket(): void {
    this.isEnabled = true;
    console.log('✅ TimeFrame WebSocket enabled');
  }

  // Disable WebSocket connections
  disableWebSocket(): void {
    this.isEnabled = false;
    this.disconnect();
    console.log('❌ TimeFrame WebSocket disabled');
  }

  // Check if WebSocket is enabled
  get isWebSocketEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export default new TimeFrameWebSocketService();