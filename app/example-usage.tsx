import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import Button from '@/components/Button';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import * as Analytics from '@/utils/analytics';
import { logEvent, logVisit, logPurchase, logBooking, logEventRegistration } from '@/utils/firestoreEvents';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function ExampleUsagePage() {
  const { logEvent: logAnalyticsEvent, logFirestoreEvent } = useAnalytics();
  const userId = "user123"; // In a real app, get this from your auth store
  
  useEffect(() => {
    // Log screen view when component mounts
    Analytics.logScreenView('ExampleUsage', 'ExampleUsagePage');
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
    await logEvent({
      type: "button_click",
      userId,
      additionalData: {
        button_name: 'firestore_example',
        screen: 'example_usage'
      }
    });
  };
  
  const handleVisitLog = async () => {
    // Log a visit to a venue
    await logVisit(userId, "venue123", {
      duration_minutes: 60,
      entry_method: "ticket"
    });
  };
  
  const handlePurchaseLog = async () => {
    // Log a purchase
    await logPurchase(userId, "venue123", "artwork456", 99.99, "USD", {
      payment_method: "credit_card",
      is_gift: false
    });
  };
  
  const handleBookingLog = async () => {
    // Log a booking
    await logBooking(
      userId, 
      "venue123", 
      `booking_${Date.now()}`, 
      new Date(Date.now() + 86400000), // tomorrow
      "10:00 AM",
      2,
      { special_requests: "Window seat" }
    );
  };
  
  const handleEventRegistrationLog = async () => {
    // Log an event registration
    await logEventRegistration(
      userId,
      "event789",
      "venue123",
      2,
      { ticket_type: "VIP" }
    );
  };
  
  const handleHookExample = () => {
    // Using the useAnalytics hook
    logAnalyticsEvent('hook_example', {
      method: 'useAnalytics hook',
      screen: 'example_usage'
    });
  };
  
  const handleFirestoreHookExample = () => {
    // Using the useAnalytics hook for Firestore
    logFirestoreEvent({
      type: 'hook_example',
      userId,
      additionalData: {
        method: 'useAnalytics hook',
        screen: 'example_usage'
      }
    });
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
            firestoreEvent={{
              type: "button_component_click",
              userId,
              additionalData: { component: "Button", screen: "example_usage" }
            }}
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