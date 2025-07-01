import { supabase, isSupabaseConfigured } from '@/config/supabase';
import * as Analytics from '@/utils/analytics';
import { Alert } from 'react-native';

/**
 * Generic Supabase query wrapper to replace sandbox API calls
 */
export const querySupabase = async <T = any>(
  table: string,
  options: {
    select?: string;
    filters?: Array<{ column: string; operator: string; value: any }>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  } = {}
): Promise<T | null> => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot query data');
      return null;
    }

    let query = supabase.from(table);

    // Apply select
    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }

    // Apply filters
    if (options.filters) {
      options.filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.column, filter.value);
            break;
          case 'gte':
            query = query.gte(filter.column, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.column, filter.value);
            break;
          case 'lte':
            query = query.lte(filter.column, filter.value);
            break;
          case 'like':
            query = query.like(filter.column, filter.value);
            break;
          case 'ilike':
            query = query.ilike(filter.column, filter.value);
            break;
          case 'in':
            query = query.in(filter.column, filter.value);
            break;
          case 'is':
            query = query.is(filter.column, filter.value);
            break;
          default:
            console.warn(`Unknown filter operator: ${filter.operator}`);
        }
      });
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    // Execute query
    const { data, error } = options.single 
      ? await query.single()
      : await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Log successful query
    Analytics.logEvent('supabase_query_success', {
      table,
      filters_count: options.filters?.length || 0,
      has_ordering: !!options.orderBy,
      has_limit: !!options.limit,
      is_single: !!options.single,
      result_count: Array.isArray(data) ? data.length : (data ? 1 : 0)
    });

    return data as T;
  } catch (error) {
    console.error('Supabase query failed:', error);
    
    // Log error
    Analytics.logEvent('supabase_query_error', {
      table,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Show user-friendly error
    Alert.alert(
      "Connection Error", 
      "Unable to fetch data. Please check your connection and try again."
    );
    
    return null;
  }
};

/**
 * Insert data into Supabase table
 */
export const insertSupabase = async <T = any>(
  table: string,
  data: any,
  options: {
    select?: string;
    single?: boolean;
  } = {}
): Promise<T | null> => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot insert data');
      return null;
    }

    let query = supabase.from(table).insert(data);

    if (options.select) {
      query = query.select(options.select);
    }

    const { data: result, error } = options.single 
      ? await query.single()
      : await query;

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    // Log successful insert
    Analytics.logEvent('supabase_insert_success', {
      table,
      has_select: !!options.select,
      is_single: !!options.single
    });

    return result as T;
  } catch (error) {
    console.error('Supabase insert failed:', error);
    
    // Log error
    Analytics.logEvent('supabase_insert_error', {
      table,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    Alert.alert(
      "Save Error", 
      "Unable to save data. Please try again."
    );
    
    return null;
  }
};

/**
 * Update data in Supabase table
 */
export const updateSupabase = async <T = any>(
  table: string,
  updates: any,
  filters: Array<{ column: string; operator: string; value: any }>,
  options: {
    select?: string;
    single?: boolean;
  } = {}
): Promise<T | null> => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot update data');
      return null;
    }

    let query = supabase.from(table).update(updates);

    // Apply filters
    filters.forEach(filter => {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value);
          break;
        default:
          console.warn(`Unknown filter operator: ${filter.operator}`);
      }
    });

    if (options.select) {
      query = query.select(options.select);
    }

    const { data: result, error } = options.single 
      ? await query.single()
      : await query;

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    // Log successful update
    Analytics.logEvent('supabase_update_success', {
      table,
      filters_count: filters.length,
      has_select: !!options.select,
      is_single: !!options.single
    });

    return result as T;
  } catch (error) {
    console.error('Supabase update failed:', error);
    
    // Log error
    Analytics.logEvent('supabase_update_error', {
      table,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    Alert.alert(
      "Update Error", 
      "Unable to update data. Please try again."
    );
    
    return null;
  }
};

/**
 * Delete data from Supabase table
 */
export const deleteSupabase = async (
  table: string,
  filters: Array<{ column: string; operator: string; value: any }>
): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot delete data');
      return false;
    }

    let query = supabase.from(table).delete();

    // Apply filters
    filters.forEach(filter => {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.column, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value);
          break;
        default:
          console.warn(`Unknown filter operator: ${filter.operator}`);
      }
    });

    const { error } = await query;

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    // Log successful delete
    Analytics.logEvent('supabase_delete_success', {
      table,
      filters_count: filters.length
    });

    return true;
  } catch (error) {
    console.error('Supabase delete failed:', error);
    
    // Log error
    Analytics.logEvent('supabase_delete_error', {
      table,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    Alert.alert(
      "Delete Error", 
      "Unable to delete data. Please try again."
    );
    
    return false;
  }
};

/**
 * Execute a custom SQL query (for complex queries)
 */
export const executeSupabaseRPC = async <T = any>(
  functionName: string,
  params: any = {}
): Promise<T | null> => {
  try {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot execute RPC');
      return null;
    }

    const { data, error } = await supabase.rpc(functionName, params);

    if (error) {
      console.error('Supabase RPC error:', error);
      throw error;
    }

    // Log successful RPC
    Analytics.logEvent('supabase_rpc_success', {
      function_name: functionName,
      params_count: Object.keys(params).length
    });

    return data as T;
  } catch (error) {
    console.error('Supabase RPC failed:', error);
    
    // Log error
    Analytics.logEvent('supabase_rpc_error', {
      function_name: functionName,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    Alert.alert(
      "Query Error", 
      "Unable to execute query. Please try again."
    );
    
    return null;
  }
};

/**
 * Legacy function to replace sandbox API calls
 * @deprecated Use querySupabase instead
 */
export const replaceSandboxCall = async (
  sandboxId: string,
  queryType: string = 'query',
  params: any = {}
): Promise<any> => {
  console.warn('replaceSandboxCall is deprecated. Use querySupabase instead.');
  
  // Map common sandbox calls to Supabase queries
  switch (queryType) {
    case 'galleries':
      return querySupabase('galleries', {
        filters: params.featured ? [{ column: 'featured', operator: 'eq', value: true }] : undefined,
        orderBy: { column: 'created_at', ascending: false }
      });
    
    case 'events':
      return querySupabase('events', {
        orderBy: { column: 'date', ascending: true }
      });
    
    case 'venues':
      return querySupabase('venues', {
        orderBy: { column: 'name', ascending: true }
      });
    
    default:
      console.warn(`Unknown sandbox query type: ${queryType}`);
      return null;
  }
};