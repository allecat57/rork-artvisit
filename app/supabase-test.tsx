import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack } from 'expo-router';
import { supabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/supabase';
import TimeFrameAPI from '@/utils/timeframe-api';
import colors from '@/constants/colors';

interface TableInfo {
  table_name: string;
  row_count: number;
  columns: string[];
  sample_data?: any[];
}

interface TimeFrameStatus {
  status: 'checking' | 'connected' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
}

export default function SupabaseTestScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrameStatus, setTimeFrameStatus] = useState<TimeFrameStatus>({ status: 'checking' });
  const [timeFrameLoading, setTimeFrameLoading] = useState(false);

  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Testing Supabase connection...');
      
      // Check configuration
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not properly configured');
      }
      
      // Test basic connection with a simple query to galleries table
      console.log('🔗 Testing connection with galleries table...');
      const { data: testData, error: connectionError } = await supabase
        .from('galleries')
        .select('id')
        .limit(1);
      
      if (connectionError) {
        const errorDetails = {
          message: connectionError.message || 'Unknown error',
          details: connectionError.details || 'No details available',
          hint: connectionError.hint || 'No hint available',
          code: connectionError.code || 'No code available'
        };
        
        console.error('❌ Connection test failed:', errorDetails);
        
        // Create a more detailed error message
        const detailedError = `Connection failed: ${errorDetails.message}\n\nDetails: ${errorDetails.details}\n\nHint: ${errorDetails.hint}\n\nCode: ${errorDetails.code}`;
        throw new Error(detailedError);
      }
      
      console.log('✅ Supabase connection successful!', { testData });
      setConnectionStatus('connected');
      
      // Get all tables info
      await getAllTablesInfo();
      
    } catch (err: any) {
      const errorDetails = {
        message: err.message || 'Unknown error occurred',
        details: err.details || 'No details available',
        hint: err.hint || 'No hint available',
        code: err.code || 'No code available',
        stack: err.stack || 'No stack trace available'
      };
      
      console.error('❌ Supabase test failed:', errorDetails);
      
      // Create a user-friendly error message
      const userError = `${errorDetails.message}\n\nTechnical Details:\n- Code: ${errorDetails.code}\n- Details: ${errorDetails.details}\n- Hint: ${errorDetails.hint}`;
      
      setError(userError);
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getAllTablesInfo = async () => {
    try {
      const tablesInfo: TableInfo[] = [];
      
      // Instead of querying information_schema, let's test the known tables from our config
      const knownTables = [
        'profiles',
        'galleries', 
        'featured_galleries',
        'venues',
        'events',
        'reservations',
        'event_registrations',
        'favorites',
        'visit_history',
        'purchase_history',
        'products',
        'cart_items',
        'notifications',
        'privacy_settings'
      ];
      
      console.log('📋 Testing known tables:', knownTables);
      
      // For each known table, test if it exists and get info
      for (const tableName of knownTables) {
        try {
          console.log(`🔍 Testing table: ${tableName}`);
          
          // Get row count
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.warn(`⚠️ Table ${tableName} not accessible:`, {
              message: countError.message,
              code: countError.code
            });
            continue; // Skip this table if it doesn't exist or isn't accessible
          }
          
          // Get sample data (first 3 rows)
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(3);
          
          if (sampleError) {
            console.warn(`⚠️ Could not get sample data for ${tableName}:`, {
              message: sampleError.message,
              code: sampleError.code
            });
          }
          
          // Get column names from the sample data
          const columns = sampleData && sampleData.length > 0 
            ? Object.keys(sampleData[0]) 
            : [];
          
          tablesInfo.push({
            table_name: tableName,
            row_count: count || 0,
            columns: columns,
            sample_data: sampleData || []
          });
          
          console.log(`✅ ${tableName}: ${count || 0} rows, ${columns.length} columns`);
          
        } catch (tableError: any) {
          console.warn(`⚠️ Error processing table ${tableName}:`, {
            message: tableError.message || 'Unknown error',
            code: tableError.code || 'No code'
          });
        }
      }
      
      console.log(`📊 Successfully tested ${tablesInfo.length} tables`);
      setTableInfo(tablesInfo);
      
    } catch (err: any) {
      const errorDetails = {
        message: err.message || 'Unknown error occurred',
        code: err.code || 'No code available',
        stack: err.stack || 'No stack trace available'
      };
      
      console.error('❌ Error getting tables info:', errorDetails);
      throw new Error(`Failed to get table info: ${errorDetails.message}`);
    }
  };

  const testSpecificTable = async (tableName: string) => {
    try {
      Alert.alert(
        'Testing Table',
        `Testing operations on ${tableName}...`,
        [{ text: 'OK' }]
      );
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
      
      if (error) {
        console.error('❌ Table test error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Table test failed: ${error.message || 'Unknown error'}`);
      }
      
      Alert.alert(
        'Table Test Result',
        `✅ Successfully queried ${tableName}\n\nFound ${data?.length || 0} records\n\nFirst record: ${JSON.stringify(data?.[0] || {}, null, 2)}`,
        [{ text: 'OK' }]
      );
      
    } catch (err: any) {
      console.error(`❌ Table test failed for ${tableName}:`, {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code
      });
      Alert.alert(
        'Table Test Failed',
        `❌ Error testing ${tableName}:\n\n${err.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  const testGalleryQueries = async () => {
    try {
      setIsLoading(true);
      console.log('🎨 Testing gallery-specific queries...');
      
      // Test 1: Get all galleries
      console.log('📋 Testing: Get all galleries');
      const { data: allGalleries, error: allError } = await supabase
        .from('galleries') 
        .select('*')
        .order('created_at', { ascending: false });
      
      if (allError) {
        throw new Error(`All galleries query failed: ${allError.message}`);
      }
      
      console.log(`✅ Found ${allGalleries?.length || 0} galleries`);
      
      // Test 2: Get specific gallery by ID (using ID 4 as you mentioned)
      console.log('🔍 Testing: Get gallery with ID 4');
      const { data: specificGallery, error: specificError } = await supabase
        .from('galleries')
        .select('*') 
        .eq('id', 4)
        .single();
      
      if (specificError && specificError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Specific gallery query failed: ${specificError.message}`);
      }
      
      const results = {
        totalGalleries: allGalleries?.length || 0,
        galleryWithId4: specificGallery ? 'Found' : 'Not found',
        sampleGallery: allGalleries?.[0] || null
      };
      
      console.log('🎨 Gallery query results:', results);
      
      Alert.alert(
        '🎨 Gallery Queries Test Results',
        `✅ All Galleries: ${results.totalGalleries} found\n\n` +
        `🔍 Gallery ID 4: ${results.galleryWithId4}\n\n` +
        `📋 Sample Gallery:\n${results.sampleGallery ? JSON.stringify(results.sampleGallery, null, 2) : 'No galleries found'}`,
        [{ text: 'OK' }]
      );
      
    } catch (err: any) {
      console.error('❌ Gallery queries test failed:', {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
        stack: err.stack
      });
      Alert.alert(
        '❌ Gallery Queries Failed',
        `Error: ${err.message || 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testTimeFrameAPI = async () => {
    try {
      setTimeFrameLoading(true);
      setTimeFrameStatus({ status: 'checking' });
      console.log('🌐 Testing TimeFrame API connection...');
      
      const result = await TimeFrameAPI.testConnection();
      
      console.log('✅ TimeFrame API connection successful:', result);
      setTimeFrameStatus({
        status: 'connected',
        data: result.data,
        timestamp: result.timestamp
      });
      
      Alert.alert(
        '🌐 TimeFrame API Test Results',
        `✅ Connection successful!\n\n` +
        `📊 Found ${result.data?.length || 0} galleries\n\n` +
        `🕒 Timestamp: ${result.timestamp}\n\n` +
        `📋 Sample Data:\n${result.data?.[0] ? JSON.stringify(result.data[0], null, 2) : 'No data'}`,
        [{ text: 'OK' }]
      );
      
    } catch (err: any) {
      console.error('❌ TimeFrame API test failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setTimeFrameStatus({
        status: 'error',
        error: errorMessage
      });
      
      Alert.alert(
        '❌ TimeFrame API Test Failed',
        `Error: ${errorMessage}\n\nStatus: ${err.response?.status || 'No status'}\n\nURL: ${err.config?.url || 'No URL'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setTimeFrameLoading(false);
    }
  };

  const testSpecificGalleryAPI = async () => {
    try {
      setTimeFrameLoading(true);
      console.log('🎨 Testing specific gallery API calls...');
      
      // Test getting all galleries
      const galleries = await TimeFrameAPI.getGalleries();
      console.log('✅ Got galleries:', galleries);
      
      // Test getting specific gallery (if any exist)
      let specificGallery = null;
      if (galleries && galleries.length > 0) {
        const firstGalleryId = galleries[0].id;
        specificGallery = await TimeFrameAPI.getGallery(firstGalleryId);
        console.log('✅ Got specific gallery:', specificGallery);
        
        // Test getting artworks for this gallery
        try {
          const artworks = await TimeFrameAPI.getGalleryArtworks(firstGalleryId);
          console.log('✅ Got artworks:', artworks);
        } catch (artworkError: any) {
          console.warn('⚠️ Artworks endpoint might not exist:', artworkError.message);
        }
      }
      
      Alert.alert(
        '🎨 Gallery API Test Results',
        `✅ All tests completed!\n\n` +
        `📊 Total Galleries: ${galleries?.length || 0}\n\n` +
        `🏛️ First Gallery: ${specificGallery?.name || 'N/A'}\n\n` +
        `📋 Sample Gallery Data:\n${galleries?.[0] ? JSON.stringify(galleries[0], null, 2) : 'No galleries'}`,
        [{ text: 'OK' }]
      );
      
    } catch (err: any) {
      console.error('❌ Gallery API test failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      
      Alert.alert(
        '❌ Gallery API Test Failed',
        `Error: ${errorMessage}\n\nStatus: ${err.response?.status || 'No status'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setTimeFrameLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      testConnection(),
      testTimeFrameAPI()
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    const runTest = async () => {
      await testConnection();
      await testTimeFrameAPI();
    };
    runTest();
  }, [testConnection]);

  const renderTableCard = (table: TableInfo) => (
    <TouchableOpacity
      key={table.table_name}
      style={styles.tableCard}
      onPress={() => testSpecificTable(table.table_name)}
    >
      <View style={styles.tableHeader}>
        <Text style={styles.tableName}>{table.table_name}</Text>
        <Text style={styles.rowCount}>{table.row_count} rows</Text>
      </View>
      
      <Text style={styles.columnsLabel}>Columns ({table.columns.length}):</Text>
      <Text style={styles.columnsList}>
        {table.columns.join(', ')}
      </Text>
      
      {table.sample_data && table.sample_data.length > 0 && (
        <>
          <Text style={styles.sampleLabel}>Sample Data:</Text>
          <ScrollView horizontal style={styles.sampleDataContainer}>
            <Text style={styles.sampleData}>
              {JSON.stringify(table.sample_data[0], null, 2)}
            </Text>
          </ScrollView>
        </>
      )}
      
      <Text style={styles.tapHint}>Tap to test this table</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Supabase Database Test',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Supabase Connection Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Supabase Connection Status</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusIndicator,
              connectionStatus === 'connected' ? styles.statusConnected :
              connectionStatus === 'error' ? styles.statusError :
              styles.statusChecking
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus === 'connected' ? '✅ Connected' :
               connectionStatus === 'error' ? '❌ Connection Failed' :
               '🔍 Checking...'}
            </Text>
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        {/* TimeFrame API Connection Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>TimeFrame API Connection Status</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusIndicator,
              timeFrameStatus.status === 'connected' ? styles.statusConnected :
              timeFrameStatus.status === 'error' ? styles.statusError :
              styles.statusChecking
            ]} />
            <Text style={styles.statusText}>
              {timeFrameStatus.status === 'connected' ? '✅ Connected' :
               timeFrameStatus.status === 'error' ? '❌ Connection Failed' :
               '🔍 Checking...'}
            </Text>
          </View>
          
          {timeFrameStatus.error && (
            <Text style={styles.errorText}>{timeFrameStatus.error}</Text>
          )}
          
          {timeFrameStatus.status === 'connected' && timeFrameStatus.data && (
            <Text style={styles.successText}>
              ✅ Found {timeFrameStatus.data.length} galleries
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.refreshButton]} 
            onPress={testConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={styles.buttonText}>🔄 Test Supabase</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.galleryButton]} 
            onPress={testGalleryQueries}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>🎨 Test Gallery Queries</Text>
          </TouchableOpacity>
        </View>

        {/* TimeFrame API Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.timeframeButton]} 
            onPress={testTimeFrameAPI}
            disabled={timeFrameLoading}
          >
            {timeFrameLoading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={styles.buttonText}>🌐 Test TimeFrame API</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.apiTestButton]} 
            onPress={testSpecificGalleryAPI}
            disabled={timeFrameLoading}
          >
            <Text style={styles.buttonText}>🏛️ Test Gallery APIs</Text>
          </TouchableOpacity>
        </View>

        {/* Tables Info */}
        {tableInfo.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              📊 Database Tables ({tableInfo.length})
            </Text>
            
            {tableInfo.map(renderTableCard)}
          </>
        )}

        {/* Configuration Info */}
        <View style={styles.configCard}>
          <Text style={styles.configTitle}>Configuration</Text>
          <Text style={styles.configText}>URL: {SUPABASE_URL}</Text>
          <Text style={styles.configText}>Key: {SUPABASE_ANON_KEY.substring(0, 20)}...</Text>
          <Text style={styles.configText}>Configured: {isSupabaseConfigured() ? '✅' : '❌'}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  statusCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusError: {
    backgroundColor: '#F44336',
  },
  statusChecking: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500' as const,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButton: {
    backgroundColor: colors.accent,
  },
  galleryButton: {
    backgroundColor: '#9C27B0',
  },
  timeframeButton: {
    backgroundColor: '#2196F3',
  },
  apiTestButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 16,
  },
  tableCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tableName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.accent,
  },
  rowCount: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  columnsLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  columnsList: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  sampleLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  sampleDataContainer: {
    maxHeight: 100,
    marginBottom: 12,
  },
  sampleData: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    backgroundColor: colors.background,
    padding: 8,
    borderRadius: 4,
  },
  tapHint: {
    fontSize: 12,
    color: colors.accent,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  configCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  configText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500' as const,
  },
});