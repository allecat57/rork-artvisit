import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimeFrameAPI from '@/utils/timeframe-api';
import WebSocketService from '@/utils/timeframe-websocket';
import { Stack } from 'expo-router';

interface Gallery {
  id: number;
  name: string;
  description: string;
  artworks?: Artwork[];
}

interface Artwork {
  id: number;
  name: string;
  sold: boolean;
}

const TimeFrameTestScreen = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Listen for connection status changes
    WebSocketService.addEventListener('connection', (update) => {
      setConnectionStatus(update.status);
      if (update.status === 'connected') {
        addTestResult('✅ WebSocket connected!');
      } else if (update.status === 'disconnected') {
        addTestResult('🔌 WebSocket disconnected');
      } else if (update.status === 'error') {
        addTestResult('❌ WebSocket error');
      }
    });
    
    // Listen for new galleries (when museums sign up on website)
    WebSocketService.addEventListener('gallery-created', (update) => {
      addTestResult(`🏛️ New gallery: ${update.data.name}`);
      setGalleries(prev => [...prev, update.data]);
      Alert.alert('New Gallery!', `${update.data.name} just joined TimeFrame`);
    });

    // Listen for new artwork uploads
    WebSocketService.addEventListener('artwork-added', (update) => {
      addTestResult(`🎨 New artwork: ${update.data.artwork.name}`);
      
      setGalleries(prev => 
        prev.map(gallery => 
          gallery.id === update.data.galleryId 
            ? { 
                ...gallery, 
                artworks: [...(gallery.artworks || []), update.data.artwork]
              }
            : gallery
        )
      );
      
      Alert.alert('New Artwork!', `${update.data.artwork.name} was just added`);
    });

    // Listen for artwork sales (remove from shop)
    WebSocketService.addEventListener('artwork-sold', (update) => {
      addTestResult(`💰 Artwork sold: ${update.data.artworkName}`);
      
      setGalleries(prev => 
        prev.map(gallery => ({
          ...gallery,
          artworks: gallery.artworks?.map(artwork => 
            artwork.id === update.data.artworkId 
              ? { ...artwork, sold: true }
              : artwork
          ) || []
        }))
      );
      
      Alert.alert('Artwork Sold!', `${update.data.artworkName} was just purchased`);
    });

    // Cleanup on unmount
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  const addTestResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const testAPIConnection = async () => {
    try {
      setLoading(true);
      addTestResult('🔄 Testing API connection...');
      
      const response = await TimeFrameAPI.getGalleries();
      
      if (response.success) {
        setGalleries(response.data);
        addTestResult(`✅ API connected! Loaded ${response.count} galleries`);
        console.log(`Loaded ${response.count} galleries from TimeFrame`);
      } else {
        addTestResult('❌ API response not successful');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      addTestResult(`❌ API connection failed: ${errorMsg}`);
      console.error('API Error:', error);
      Alert.alert('Connection Error', 'Failed to load galleries from TimeFrame');
    } finally {
      setLoading(false);
    }
  };

  const testWebSocketConnection = () => {
    addTestResult('🔄 Testing WebSocket connection...');
    WebSocketService.connect();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await testAPIConnection();
    setRefreshing(false);
  };

  const renderGallery = ({ item }: { item: Gallery }) => (
    <View style={styles.galleryCard}>
      <Text style={styles.galleryName}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.artworkCount}>
        {item.artworks?.filter(art => !art.sold).length || 0} available artworks
      </Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Live from TimeFrame</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'TimeFrame Test', headerShown: true }} />
      
      <ScrollView style={styles.scrollView}>
        <Text style={styles.header}>TimeFrame Connection Test</Text>
        
        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>WebSocket Status:</Text>
          <View style={[styles.statusIndicator, 
            connectionStatus === 'connected' ? styles.connected : 
            connectionStatus === 'connecting' ? styles.connecting : styles.disconnected
          ]}>
            <Text style={styles.statusText}>{connectionStatus}</Text>
          </View>
        </View>

        {/* Test Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.apiButton]} 
            onPress={testAPIConnection}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Testing API...' : 'Test API Connection'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.wsButton]} 
            onPress={testWebSocketConnection}
          >
            <Text style={styles.buttonText}>Test WebSocket</Text>
          </TouchableOpacity>
        </View>

        {/* Test Results Log */}
        <View style={styles.logContainer}>
          <Text style={styles.logHeader}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.logEntry}>{result}</Text>
          ))}
        </View>

        {/* Galleries List */}
        {galleries.length > 0 && (
          <View style={styles.galleriesContainer}>
            <Text style={styles.galleriesHeader}>Loaded Galleries ({galleries.length}):</Text>
            <FlatList
              data={galleries}
              renderItem={renderGallery}
              keyExtractor={item => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#AC8901',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    color: '#333',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  connecting: {
    backgroundColor: '#FF9800',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  apiButton: {
    backgroundColor: '#2196F3',
  },
  wsButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  logHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  logEntry: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
    color: '#666',
  },
  galleriesContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
  },
  galleriesHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  galleryCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#AC8901',
  },
  galleryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  artworkCount: {
    fontSize: 12,
    color: '#AC8901',
    fontWeight: '600',
    marginBottom: 5,
  },
  statusBadge: {
    backgroundColor: '#AC8901',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
});

export default TimeFrameTestScreen;