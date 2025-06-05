import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showTagline?: boolean;
}

export default function Logo({ 
  size = 'medium', 
  color = colors.primary.accent,
  showTagline = true
}: LogoProps) {
  const fontSize = size === 'small' ? 18 : size === 'medium' ? 24 : 32;
  
  return (
    <View style={styles.container}>
      <Text style={[
        styles.logo, 
        { fontSize, color }
      ]}>
        TIMEFRAME
      </Text>
      {showTagline && (
        <Text style={[
          styles.tagline,
          { color, fontSize: fontSize * 0.4 }
        ]}>
          Art At Your Fingertips
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logo: {
    ...typography.heading1,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  tagline: {
    ...typography.caption,
    marginTop: 2,
    letterSpacing: 0.5,
  }
});