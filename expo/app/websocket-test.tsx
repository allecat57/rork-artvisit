import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimeFrameWebSocket } from '@/hooks/useTimeFrameWebSocket';
import { useTheme } from '@/context/ThemeContext';

export default function WebSocketTestScreen() {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-19), `[${timestamp}] ${message}`]);
  };

  const {
    isConnected,
    connectionStatus,
    connectionError,
    isWebSocketEnabled,
    connect,
    disconnect,
    enableWebSocket,
    disableWebSocket,
    ping,
    resetReconnectionAttempts,
    messages
  } = useTimeFrameWebSocket({
    onConnectionChange: (status) => {
      addLog(`Connection status: ${status.status}${status.error ? ` (${status.error})` : ''}`);
    },
    onMessage: (data) => {
      addLog(`Message received: ${JSON.stringify(data)}`);
    },
    onArtworkAdded: (data) => {
      addLog(`🎨 Artwork added: ${data.title || 'Unknown'}`);
    },
    onArtworkSold: (data) => {
      addLog(`💰 Artwork sold: ${data.title || 'Unknown'}`);
    }
  });

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return colors.success;
      case 'connecting': return colors.warning;
      case 'error': return colors.error;
      default: return colors.muted;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>TimeFrame WebSocket Test</Text>
        <View style={[styles.statusContainer, { backgroundColor: colors.card }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          WebSocket Enabled: {isWebSocketEnabled ? '✅' : '❌'}
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Connected: {isConnected ? '✅' : '❌'}
        </Text>
        {connectionError && (
          <Text style={[styles.errorText, { color: colors.error }]}>
            Error: {connectionError}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isWebSocketEnabled ? colors.muted : colors.accent }]}
          onPress={isWebSocketEnabled ? disableWebSocket : enableWebSocket}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {isWebSocketEnabled ? 'Disable WebSocket' : 'Enable WebSocket'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: isConnected ? colors.muted : colors.accent,
            opacity: !isWebSocketEnabled ? 0.5 : 1
          }]}
          onPress={isConnected ? disconnect : connect}
          disabled={!isWebSocketEnabled}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            {isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: colors.accent,
            opacity: !isConnected ? 0.5 : 1
          }]}
          onPress={ping}
          disabled={!isConnected}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>Ping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.warning }]}
          onPress={resetReconnectionAttempts}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>Reset Attempts</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={[styles.logsContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.logsTitle, { color: colors.text }]}>Connection Logs:</Text>
        {logs.map((log, index) => (
          <Text key={`log-${index}-${log.slice(0, 20)}`} style={[styles.logMessage, { color: colors.textSecondary }]}>
            {log}
          </Text>
        ))}
        
        {messages.length > 0 && (
          <>
            <Text style={[styles.logsTitle, { color: colors.text, marginTop: 16 }]}>WebSocket Messages:</Text>
            {messages.slice(-5).map((msg, index) => (
              <Text key={`msg-${index}-${JSON.stringify(msg).slice(0, 20)}`} style={[styles.logMessage, { color: colors.textSecondary }]}>
                {JSON.stringify(msg, null, 2)}
              </Text>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    fontSize: 20,
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
  infoContainer: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logMessage: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});