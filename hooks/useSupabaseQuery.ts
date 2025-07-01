import { useState, useEffect, useCallback } from 'react';
import { querySupabase, insertSupabase, updateSupabase, deleteSupabase } from '@/utils/api';
import * as Analytics from '@/utils/analytics';

interface UseSupabaseQueryOptions {
  select?: string;
  filters?: Array<{ column: string; operator: string; value: any }>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
  enabled?: boolean;
}

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for querying Supabase data (replaces sandbox API calls)
 */
export const useSupabaseQuery = <T = any>(
  table: string,
  options: UseSupabaseQueryOptions = {}
): UseSupabaseQueryResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (options.enabled === false) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await querySupabase<T>(table, options);
      setData(result);

      // Log successful query
      Analytics.logEvent('hook_query_success', {
        table,
        has_data: !!result
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Log error
      Analytics.logEvent('hook_query_error', {
        table,
        error: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

/**
 * Hook for Supabase mutations (insert, update, delete)
 */
export const useSupabaseMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = useCallback(async <T = any>(
    table: string,
    data: any,
    options: { select?: string; single?: boolean } = {}
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await insertSupabase<T>(table, data, options);
      
      Analytics.logEvent('hook_insert_success', {
        table,
        has_result: !!result
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      Analytics.logEvent('hook_insert_error', {
        table,
        error: errorMessage
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async <T = any>(
    table: string,
    updates: any,
    filters: Array<{ column: string; operator: string; value: any }>,
    options: { select?: string; single?: boolean } = {}
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateSupabase<T>(table, updates, filters, options);
      
      Analytics.logEvent('hook_update_success', {
        table,
        has_result: !!result
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      Analytics.logEvent('hook_update_error', {
        table,
        error: errorMessage
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (
    table: string,
    filters: Array<{ column: string; operator: string; value: any }>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const success = await deleteSupabase(table, filters);
      
      Analytics.logEvent('hook_delete_success', {
        table,
        success
      });

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      Analytics.logEvent('hook_delete_error', {
        table,
        error: errorMessage
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    insert,
    update,
    remove,
    loading,
    error
  };
};

/**
 * Hook for real-time Supabase subscriptions
 */
export const useSupabaseSubscription = <T = any>(
  table: string,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
    filter?: string;
  } = {}
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { querySupabase } = require('@/utils/api');
    const { supabase } = require('@/config/supabase');

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        const result = await querySupabase<T[]>(table);
        if (result) {
          setData(result);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: options.event || '*',
          schema: options.schema || 'public',
          table: table,
          filter: options.filter
        },
        (payload: any) => {
          Analytics.logEvent('realtime_update', {
            table,
            event_type: payload.eventType,
            has_new: !!payload.new,
            has_old: !!payload.old
          });

          // Update local data based on the event
          setData(currentData => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...currentData, payload.new as T];
              case 'UPDATE':
                return currentData.map(item => 
                  (item as any).id === payload.new.id ? payload.new as T : item
                );
              case 'DELETE':
                return currentData.filter(item => 
                  (item as any).id !== payload.old.id
                );
              default:
                return currentData;
            }
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, options.event, options.schema, options.filter]);

  return { data, loading, error };
};