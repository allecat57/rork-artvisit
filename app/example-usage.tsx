import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Button from '../components/Button';
import colors from '../constants/colors';
import typography from '../constants/typography';
import * as Analytics from '../utils/analytics';
import { useAnalytics } from '../hooks/useAnalytics';

export default function ExampleUsagePage() {
  const { trackEvent, trackScreenView } = useAnalytics();
  const userId = "user123"; // In a real app, get this from your auth store
  
  useEffect(() => {
    // Log screen view when component mounts
    Analytics.trackScreenView('ExampleUsage', 'ExampleUsagePage');
  }, []);
  
  const handleGoogleAnalyticsEvent = () => {
    // Using the Analytics utility directly
    Analytics.sendAnalyticsEvent('button_click', {
      button_name: 'google_analytics_example',
      screen: 'example_usage'
    });
  };
  
  const handleFirestoreEvent = async () => {
    // Using the Firestore events utility
    console.log("Logging firestore event");
    // This would normally call a firestore logging function
  };
  
  const handleVisitLog = async () => {
    // Log a visit to a venue
    console.log("Logging visit");
    // This would normally call a visit logging function
  };
  
  const handlePurchaseLog = async () => {
    // Log a purchase
    console.log("Logging purchase");
    // This would normally call a purchase logging function
  };
  
  const handleBookingLog = async () => {
    // Log a booking
    console.log("Logging booking");
    // This would normally call a booking logging function
  };
  
  const handleEventRegistrationLog = async () => {
    // Log an event registration
    console.log("Logging event registration");
    // This would normally call an event registration logging function
  };
  
  const handleHookExample = () => {
    // Using the useAnalytics hook
    trackEvent('hook_example', {
      method: 'useAnalytics hook',
      screen: 'example_usage'
    });
  };
  
  const handleFirestoreHookExample = () => {
    // Using the useAnalytics hook for Firestore
    console.log("Logging firestore event with hook");
    // This would normally call a firestore logging function through the hook
  };
  
  const handleButtonComponentExample = () => {
    console.log('Button with built-in analytics clicked');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        title: "Analytics Examples",
        headerStyle: { backgroundColor: colors.primary.background },
        headerTintColor: colors.primary.text
      }} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Analytics Examples</Text>
        <Text style={styles.description}>
          This page demonstrates different ways to log events in the app.
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <Button 
            title="Log Analytics Event" 
            onPress={handleGoogleAnalyticsEvent}
            variant="primary"
            style={styles.button}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Logging</Text>
          <Button 
            title="Log Basic Event" 
            onPress={handleFirestoreEvent}
            variant="secondary"
            style={styles.button}
          />
          
          <Button 
            title="Log Visit" 
            onPress={handleVisitLog}
            variant="secondary"
            style={styles.button}
          />
          
          <Button 
            title="Log Purchase" 
            onPress={handlePurchaseLog}
            variant="secondary"
            style={styles.button}
          />
          
          <Button 
            title="Log Booking" 
            onPress={handleBookingLog}
            variant="secondary"
            style={styles.button}
          />
          
          <Button 
            title="Log Event Registration" 
            onPress={handleEventRegistrationLog}
            variant="secondary"
            style={styles.button}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Using Hooks</Text>
          <Button 
            title="Use Analytics Hook" 
            onPress={handleHookExample}
            variant="outline"
            style={styles.button}
          />
          
          <Button 
            title="Use Event Logging Hook" 
            onPress={handleFirestoreHookExample}
            variant="outline"
            style={styles.button}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Button Component</Text>
          <Text style={styles.description}>
            The Button component has built-in analytics support.
          </Text>
          
          <Button 
            title="Button with Analytics" 
            onPress={handleButtonComponentExample}
            variant="primary"
            style={styles.button}
            analyticsEventName="button_component_click"
            analyticsParams={{ component: "Button", screen: "example_usage" }}
          />
          
          <Button 
            title="Button with Event Logging" 
            onPress={handleButtonComponentExample}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    ...typography.heading1,
    color: colors.primary.text,
    marginBottom: 10,
  },
  description: {
    ...typography.body,
    color: colors.primary.muted,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
    backgroundColor: colors.primary.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.primary.text,
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
});