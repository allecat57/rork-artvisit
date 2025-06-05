import { Tabs } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { Home, Search, Calendar, CheckSquare, User } from 'lucide-react-native';
import colors from '@/constants/colors';

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
          borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderTopWidth: 0.5,
          position: 'absolute',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.light,
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          shadowColor: 'transparent',
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        headerTintColor: isDark ? colors.text.dark : colors.text.light,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <Search color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="todos"
        options={{
          title: 'Todos',
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}