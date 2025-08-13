import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Trash2, RefreshCw, Database } from 'lucide-react-native';
import CacheManager from '@/utils/cache-manager';
import colors from '@/constants/colors';

interface CacheClearButtonProps {
  type?: 'all' | 'timeframe' | 'store';
  storeName?: string;
  onClearComplete?: () => void;
  style?: any;
}

export const CacheClearButton: React.FC<CacheClearButtonProps> = ({
  type = 'all',
  storeName,
  onClearComplete,
  style
}) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    const title = type === 'all' ? 'Clear All Cache' : 
                  type === 'timeframe' ? 'Clear TimeFrame Cache' :
                  `Clear ${storeName} Cache`;
    
    const message = type === 'all' ? 
      'This will clear all cached data including galleries, artworks, favorites, and settings. Continue?' :
      type === 'timeframe' ?
      'This will clear TimeFrame API cache and gallery data. Continue?' :
      `This will clear ${storeName} cache data. Continue?`;

    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            
            try {
              let success = false;
              
              switch (type) {
                case 'all':
                  success = await CacheManager.clearAllCaches();
                  break;
                case 'timeframe':
                  success = await CacheManager.clearTimeFrameCache();
                  break;
                case 'store':
                  if (storeName) {
                    success = await CacheManager.clearStoreCache(storeName);
                  }
                  break;
              }
              
              if (success) {
                Alert.alert('Success', 'Cache cleared successfully!');
                onClearComplete?.();
              } else {
                Alert.alert('Error', 'Failed to clear cache. Please try again.');
              }
            } catch (error) {
              console.error('Cache clear error:', error);
              Alert.alert('Error', 'An error occurred while clearing cache.');
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  const getButtonText = () => {
    switch (type) {
      case 'all':
        return 'Clear All Cache';
      case 'timeframe':
        return 'Clear TimeFrame Cache';
      case 'store':
        return `Clear ${storeName} Cache`;
      default:
        return 'Clear Cache';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'all':
        return <Database size={20} color={colors.white} />;
      case 'timeframe':
        return <RefreshCw size={20} color={colors.white} />;
      default:
        return <Trash2 size={20} color={colors.white} />;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleClearCache}
      disabled={isClearing}
    >
      <View style={styles.buttonContent}>
        {isClearing ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          getIcon()
        )}
        <Text style={styles.buttonText}>
          {isClearing ? 'Clearing...' : getButtonText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});