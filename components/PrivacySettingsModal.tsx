import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { X, Shield, Eye, EyeOff, Database, BarChart } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { usePrivacyStore } from '@/store/usePrivacyStore';
import * as Analytics from '@/utils/analytics';

interface PrivacySettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacySettingsModal = ({ visible, onClose }: PrivacySettingsModalProps) => {
  const { 
    dataCollection, 
    locationTracking, 
    personalization, 
    analyticsEnabled,
    setDataCollection,
    setLocationTracking,
    setPersonalization,
    setAnalyticsEnabled
  } = usePrivacyStore();

  // Local state to track changes before saving
  const [localDataCollection, setLocalDataCollection] = useState(dataCollection);
  const [localLocationTracking, setLocalLocationTracking] = useState(locationTracking);
  const [localPersonalization, setLocalPersonalization] = useState(personalization);
  const [localAnalyticsEnabled, setLocalAnalyticsEnabled] = useState(analyticsEnabled);

  // Reset local state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setLocalDataCollection(dataCollection);
      setLocalLocationTracking(locationTracking);
      setLocalPersonalization(personalization);
      setLocalAnalyticsEnabled(analyticsEnabled);
      
      // Log modal open event
      Analytics.logEvent("privacy_settings_open");
    }
  }, [visible, dataCollection, locationTracking, personalization, analyticsEnabled]);

  const handleSave = () => {
    // Update the store with local state
    setDataCollection(localDataCollection);
    setLocationTracking(localLocationTracking);
    setPersonalization(localPersonalization);
    setAnalyticsEnabled(localAnalyticsEnabled);
    
    // Update analytics collection based on user preference
    Analytics.setAnalyticsEnabled(localAnalyticsEnabled);
    
    // Log privacy settings update
    Analytics.logEvent("privacy_settings_updated", {
      data_collection: localDataCollection,
      location_tracking: localLocationTracking,
      personalization: localPersonalization,
      analytics_enabled: localAnalyticsEnabled
    });
    
    // Set user property for analytics
    Analytics.setUserProperties({
      [Analytics.UserProperties.LOCATION_ENABLED]: localLocationTracking ? "true" : "false"
    });
    
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Privacy Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.primary.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Shield size={24} color={colors.primary.accent} />
                <Text style={styles.sectionTitle}>Data Privacy</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Control how your data is collected and used within the app.
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Data Collection</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to collect usage data to improve your experience
                  </Text>
                </View>
                <Switch
                  value={localDataCollection}
                  onValueChange={setLocalDataCollection}
                  trackColor={{ false: colors.primary.muted, true: colors.primary.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localDataCollection ? colors.primary.secondary : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Location Tracking</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to track your location to show nearby venues
                  </Text>
                </View>
                <Switch
                  value={localLocationTracking}
                  onValueChange={setLocalLocationTracking}
                  trackColor={{ false: colors.primary.muted, true: colors.primary.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localLocationTracking ? colors.primary.secondary : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Personalization</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to personalize content based on your preferences
                  </Text>
                </View>
                <Switch
                  value={localPersonalization}
                  onValueChange={setLocalPersonalization}
                  trackColor={{ false: colors.primary.muted, true: colors.primary.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localPersonalization ? colors.primary.secondary : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BarChart size={24} color={colors.primary.accent} />
                <Text style={styles.sectionTitle}>Analytics</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Control how we analyze your usage to improve our services.
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Usage Analytics</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to collect anonymous usage statistics
                  </Text>
                </View>
                <Switch
                  value={localAnalyticsEnabled}
                  onValueChange={setLocalAnalyticsEnabled}
                  trackColor={{ false: colors.primary.muted, true: colors.primary.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localAnalyticsEnabled ? colors.primary.secondary : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Database size={24} color={colors.primary.accent} />
                <Text style={styles.sectionTitle}>Your Data</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.dataButton}
                onPress={() => {
                  // Log data export request
                  Analytics.logEvent("request_data_export");
                }}
              >
                <Text style={styles.dataButtonText}>Request Data Export</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dataButton, styles.deleteButton]}
                onPress={() => {
                  // Log data deletion request
                  Analytics.logEvent("request_data_deletion");
                }}
              >
                <Text style={[styles.dataButtonText, styles.deleteButtonText]}>Request Data Deletion</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.privacyPolicyText}>
              For more information, please read our{' '}
              <Text 
                style={styles.privacyPolicyLink}
                onPress={() => {
                  // Log privacy policy view
                  Analytics.logEvent("view_privacy_policy");
                  
                  // Open privacy policy
                  // In a real app, this would open a web view or navigate to a privacy policy screen
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.primary.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.primary.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.heading3,
    marginLeft: 12,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.primary.muted,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    ...typography.bodySmall,
    color: colors.primary.muted,
  },
  dataButton: {
    backgroundColor: colors.primary.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dataButtonText: {
    ...typography.body,
    color: colors.primary.accent,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  deleteButtonText: {
    color: colors.status.error,
  },
  privacyPolicyText: {
    ...typography.bodySmall,
    color: colors.primary.muted,
    textAlign: 'center',
    marginBottom: 24,
  },
  privacyPolicyLink: {
    color: colors.primary.accent,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.primary.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary.border,
    borderRadius: 8,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.primary.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.primary.accent,
    borderRadius: 8,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.primary.background,
    fontWeight: '600',
  },
});

export default PrivacySettingsModal;