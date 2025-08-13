import { useEffect, useState, useCallback, useRef } from 'react';
import timeFrameWebSocket from '@/utils/timeframe-websocket';

interface ConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error?: any;
}

interface UseTimeFrameWebSocketOptions {
  autoConnect?: boolean;
  onGalleryCreated?: (data: any) => void;
  onGalleryUpdated?: (data: any) => void;
  onArtworkAdded?: (data: any) => void;
  onArtworkSold?: (data: any) => void;
  onMessage?: (data: any) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

export const useTimeFrameWebSocket = (options: UseTimeFrameWebSocketOptions = {}) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: timeFrameWebSocket.isConnected ? 'connected' : 'disconnected'
  });
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const {
    autoConnect = true,
    onGalleryCreated,
    onGalleryUpdated,
    onArtworkAdded,
    onArtworkSold,
    onMessage,
    onConnectionChange
  } = options;

  // Connection status handler
  const handleConnectionChange = useCallback((data: any) => {
    const newStatus: ConnectionStatus = {
      status: data.status,
      error: data.error
    };
    setConnectionStatus(newStatus);
    onConnectionChange?.(newStatus);
  }, [onConnectionChange]);

  // Message handler
  const handleMessage = useCallback((data: any) => {
    setLastMessage(data);
    setMessages(prev => [...prev.slice(-49), data]); // Keep last 50 messages
    onMessage?.(data);
  }, [onMessage]);

  // Event handlers
  const handleGalleryCreated = useCallback((data: any) => {
    console.log('🎨 Gallery created:', data);
    onGalleryCreated?.(data);
  }, [onGalleryCreated]);

  const handleGalleryUpdated = useCallback((data: any) => {
    console.log('🔄 Gallery updated:', data);
    onGalleryUpdated?.(data);
  }, [onGalleryUpdated]);

  const handleArtworkAdded = useCallback((data: any) => {
    console.log('🖼️ Artwork added:', data);
    onArtworkAdded?.(data);
  }, [onArtworkAdded]);

  const handleArtworkSold = useCallback((data: any) => {
    console.log('💰 Artwork sold:', data);
    onArtworkSold?.(data);
  }, [onArtworkSold]);

  // Connect function
  const connect = useCallback(() => {
    timeFrameWebSocket.connect();
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    timeFrameWebSocket.disconnect();
  }, []);

  // Send message function
  const sendMessage = useCallback((message: any) => {
    return timeFrameWebSocket.send(message);
  }, []);

  // Subscribe to gallery
  const subscribeToGallery = useCallback((galleryId: string) => {
    timeFrameWebSocket.subscribeToGallery(galleryId);
  }, []);

  // Unsubscribe from gallery
  const unsubscribeFromGallery = useCallback((galleryId: string) => {
    timeFrameWebSocket.unsubscribeFromGallery(galleryId);
  }, []);

  // Subscribe to artwork
  const subscribeToArtwork = useCallback((artworkId: string) => {
    timeFrameWebSocket.subscribeToArtwork(artworkId);
  }, []);

  // Ping server
  const ping = useCallback(() => {
    timeFrameWebSocket.ping();
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  useEffect(() => {
    // Add event listeners
    timeFrameWebSocket.addEventListener('connection', handleConnectionChange);
    timeFrameWebSocket.addEventListener('message', handleMessage);
    timeFrameWebSocket.addEventListener('gallery-created', handleGalleryCreated);
    timeFrameWebSocket.addEventListener('gallery-updated', handleGalleryUpdated);
    timeFrameWebSocket.addEventListener('artwork-added', handleArtworkAdded);
    timeFrameWebSocket.addEventListener('artwork-sold', handleArtworkSold);

    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    // Cleanup function
    return () => {
      timeFrameWebSocket.removeEventListener('connection', handleConnectionChange);
      timeFrameWebSocket.removeEventListener('message', handleMessage);
      timeFrameWebSocket.removeEventListener('gallery-created', handleGalleryCreated);
      timeFrameWebSocket.removeEventListener('gallery-updated', handleGalleryUpdated);
      timeFrameWebSocket.removeEventListener('artwork-added', handleArtworkAdded);
      timeFrameWebSocket.removeEventListener('artwork-sold', handleArtworkSold);
    };
  }, [
    autoConnect,
    handleConnectionChange,
    handleMessage,
    handleGalleryCreated,
    handleGalleryUpdated,
    handleArtworkAdded,
    handleArtworkSold,
    connect
  ]);

  return {
    // Connection state
    isConnected: timeFrameWebSocket.isConnected,
    connectionStatus: connectionStatus.status,
    connectionError: connectionStatus.error,
    connectionState: timeFrameWebSocket.connectionState,
    
    // Messages
    lastMessage,
    messages,
    clearMessages,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    ping,
    
    // Gallery/Artwork subscriptions
    subscribeToGallery,
    unsubscribeFromGallery,
    subscribeToArtwork,
  };
};