import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Home, Search, Calendar, User, CheckSquare } from 'lucide-react-native';
import colors from '../../constants/colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? colors.muted.dark : colors.muted.light,
        tabBarStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.light,
          borderTopColor: isDark ? colors.border.dark : colors.border.light,
        },
        headerStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.light,
        },
        headerTintColor: isDark ? colors.text.dark : colors.text.light,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: 'Todos',
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}