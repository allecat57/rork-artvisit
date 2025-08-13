import React, { useState, useEffect } from 'react';
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
import colors from '@/constants/colors';

interface TableInfo {
  table_name: string;
  row_count: number;
  columns: string[];
  sample_data?: any[];
}

export default function SupabaseTestScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [tableInfo, setTableInfo] = useState<TableInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const testConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Testing Supabase connection...');
      
      // Check configuration
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not properly configured');
      }
      
      // Test basic connection
      const { error: connectionError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);
      
      if (connectionError) {
        console.error('❌ Connection test failed:', connectionError);
        throw connectionError;
      }
      
      console.log('✅ Supabase connection successful!');
      setConnectionStatus('connected');
      
      // Get all tables info
      await getAllTablesInfo();
      
    } catch (err: any) {
      console.error('❌ Supabase test failed:', err);
      setError(err.message || 'Unknown error occurred');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getAllTablesInfo = async () => {
    try {
      const tablesInfo: TableInfo[] = [];
      
      // Get all public tables
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');
      
      if (tablesError) {
        throw tablesError;
      }
      
      console.log('📋 Found tables:', tables?.map(t => t.table_name));
      
      // For each table, get column info and row count
      for (const table of tables || []) {
        try {
          // Get columns
          const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_schema', 'public')
            .eq('table_name', table.table_name)
            .order('ordinal_position');
          
          if (columnsError) {
            console.warn(`⚠️ Could not get columns for ${table.table_name}:`, columnsError);
            continue;
          }
          
          // Get row count
          const { count, error: countError } = await supabase
            .from(table.table_name)
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.warn(`⚠️ Could not get count for ${table.table_name}:`, countError);
          }
          
          // Get sample data (first 3 rows)
          const { data: sampleData, error: sampleError } = await supabase
            .from(table.table_name)
            .select('*')
            .limit(3);
          
          if (sampleError) {
            console.warn(`⚠️ Could not get sample data for ${table.table_name}:`, sampleError);
          }
          
          tablesInfo.push({
            table_name: table.table_name,
            row_count: count || 0,
            columns: columns?.map(c => c.column_name) || [],
            sample_data: sampleData || []
          });
          
          console.log(`📊 ${table.table_name}: ${count || 0} rows, ${columns?.length || 0} columns`);
          
        } catch (tableError) {
          console.warn(`⚠️ Error processing table ${table.table_name}:`, tableError);
        }
      }
      
      setTableInfo(tablesInfo);
      
    } catch (err: any) {
      console.error('❌ Error getting tables info:', err);
      throw err;
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
        throw error;
      }
      
      Alert.alert(
        'Table Test Result',
        `✅ Successfully queried ${tableName}\n\nFound ${data?.length || 0} records\n\nFirst record: ${JSON.stringify(data?.[0] || {}, null, 2)}`,
        [{ text: 'OK' }]
      );
      
    } catch (err: any) {
      Alert.alert(
        'Table Test Failed',
        `❌ Error testing ${tableName}:\n\n${err.message}`,
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
      console.error('❌ Gallery queries test failed:', err);
      Alert.alert(
        '❌ Gallery Queries Failed',
        `Error: ${err.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await testConnection();
    setRefreshing(false);
  };

  useEffect(() => {
    const runTest = async () => {
      await testConnection();
    };
    runTest();
  }, []);

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
        {/* Connection Status */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Connection Status</Text>
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
              <Text style={styles.buttonText}>🔄 Refresh Test</Text>
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
});