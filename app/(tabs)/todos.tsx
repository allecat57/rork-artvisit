import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';
import { CheckSquare, Square, Plus } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import colors from '../../constants/colors';
import * as Analytics from '../../utils/analytics';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export default function TodosScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  
  const isDark = colorScheme === 'dark';
  const textColor = '#AC8901';
  const bgColor = isDark ? colors.background.dark : colors.background.light;
  const accentColor = colors.accent;

  useEffect(() => {
    fetchTodos();
    
    // Log screen view to Analytics
    Analytics.logEvent('screen_view', {
      screen_name: 'Todos',
      screen_class: 'TodosScreen'
    });
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log analytics event to Analytics
      Analytics.logEvent('fetch_todos_started', {
        timestamp: new Date().toISOString()
      });
      
      const { data, error: supabaseError } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setTodos(data as Todo[] || []);
      
      // Log analytics event to Analytics
      Analytics.logEvent('fetch_todos_success', {
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error fetching todos:', errorMessage);
      setError(errorMessage);
      
      // Log analytics event to Analytics
      Analytics.logEvent('fetch_todos_error', {
        error_message: errorMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTodoStatus = async (id: string, completed: boolean) => {
    try {
      const newStatus = !completed;
      
      // Log analytics event to Analytics
      Analytics.logEvent('toggle_todo_status', {
        todo_id: id,
        new_status: newStatus ? 'completed' : 'incomplete',
        timestamp: new Date().toISOString()
      });
      
      // Optimistically update UI
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: newStatus } : todo
      ));
      
      // Update in database
      const { error: supabaseError } = await supabase
        .from('todos')
        .update({ completed: newStatus })
        .eq('id', id);
        
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      // Log analytics event to Analytics
      Analytics.logEvent('toggle_todo_status_success', {
        todo_id: id,
        new_status: newStatus ? 'completed' : 'incomplete',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error updating todo:', errorMessage);
      // Revert optimistic update on error
      fetchTodos();
      
      // Log analytics event to Analytics
      Analytics.logEvent('toggle_todo_status_error', {
        todo_id: id,
        error_message: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <TouchableOpacity 
      style={[styles.todoItem, { backgroundColor: isDark ? colors.card.dark : colors.card.light }]}
      onPress={() => toggleTodoStatus(item.id, item.completed)}
    >
      <View style={styles.todoContent}>
        {item.completed ? (
          <CheckSquare color={accentColor} size={24} />
        ) : (
          <Square color={textColor} size={24} />
        )}
        <Text 
          style={[
            styles.todoText, 
            { color: textColor },
            item.completed && styles.completedText
          ]}
        >
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateTitle, { color: textColor }]}>No todos yet</Text>
      <Text style={[styles.emptyStateSubtitle, { color: textColor }]}>
        {error ? 
          `Error: ${error}` : 
          "Add your first todo by tapping the + button below"}
      </Text>
      {error && (
        <View style={styles.helpBox}>
          <Text style={[styles.helpText, { color: textColor }]}>
            Make sure you have a 'todos' table in your Supabase database with these columns:
          </Text>
          <Text style={[styles.codeBlock, { color: textColor }]}>
            - id: uuid (primary key){"\n"}
            - title: text{"\n"}
            - completed: boolean{"\n"}
            - created_at: timestamp with timezone
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>My Todos</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTodoItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: accentColor }]}
        onPress={() => {
          // Log analytics event to Analytics
          Analytics.logEvent('add_todo_button_pressed', {
            timestamp: new Date().toISOString()
          });
          
          // This would open a modal to add a new todo
          // For now, just refresh the list
          fetchTodos();
        }}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  todoItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  todoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 300,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  helpBox: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginTop: 20,
  },
  helpText: {
    fontSize: 14,
    marginBottom: 8,
  },
  codeBlock: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});