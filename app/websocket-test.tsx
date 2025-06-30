import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebSocketTest } from '@/components/WebSocketTest';

export default function WebSocketTestScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebSocketTest />
    </SafeAreaView>
  );
}