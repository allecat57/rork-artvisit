import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTheme } from '@/context/ThemeContext';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL.replace('http', 'ws');
  }

  // Fallback for development
  if (__DEV__) {
    return "ws://localhost:3000";
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const WebSocketTest: React.FC = () => {
  const { colors } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const { isConnected, connectionStatus, sendMessage } = useWebSocket(
    `${getBaseUrl()}/api/ws`,
    {
      onMessage: (msg) => {
        setMessages(prev => [...prev, `Received: ${JSON.stringify(msg, null, 2)}`]);
      },
      onOpen: () => {
        setMessages(prev => [...prev, 'Connected to WebSocket server']);
      },
      onClose: () => {
        setMessages(prev => [...prev, 'Disconnected from WebSocket server']);
      },
      onError: (error) => {
        setMessages(prev => [...prev, `Error: ${error}`]);
      },
    }
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      const success = sendMessage({ message: message.trim(), timestamp: new Date().toISOString() });
      if (success) {
        setMessages(prev => [...prev, `Sent: ${message}`]);
        setMessage('');
      } else {
        setMessages(prev => [...prev, 'Failed to send message - not connected']);
      }
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return colors.success;
      case 'connecting': return colors.warning;
      case 'error': return colors.error;
      default: return colors.muted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>WebSocket Test</Text>
        <View style={[styles.statusContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </Text>
        </View>
      </View>

      <ScrollView style={[styles.messagesContainer, { backgroundColor: colors.card }]}>
        {messages.map((msg, index) => (
          <Text key={index} style={[styles.message, { color: colors.textSecondary }]}>
            {msg}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.surface, 
            color: colors.textSecondary,
            borderColor: colors.border 
          }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter message..."
          placeholderTextColor={colors.muted}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: isConnected ? colors.accent : colors.muted 
          }]}
          onPress={handleSendMessage}
          disabled={!isConnected}
        >
          <Text style={[styles.sendButtonText, { color: colors.background }]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});