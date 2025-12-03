import React from 'react';
import { Dimensions, Platform } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';

interface SwipeNavigatorProps {
  children: React.ReactNode;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const TAB_ROUTES = [
  '/(tabs)',
  '/(tabs)/explore',
  '/(tabs)/shop',
  '/(tabs)/events',
  '/(tabs)/profile'
] as const;

const TAB_NAMES = [
  'index',
  'explore',
  'shop', 
  'events',
  'profile'
];

export default function SwipeNavigator({ children }: SwipeNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const translateX = useSharedValue(0);
  const isWeb = Platform.OS === 'web';

  const getCurrentTabIndex = () => {
    const currentPath = pathname;
    if (currentPath === '/(tabs)' || currentPath === '/') return 0;
    if (currentPath.includes('/explore')) return 1;
    if (currentPath.includes('/shop')) return 2;
    if (currentPath.includes('/events')) return 3;
    if (currentPath.includes('/profile')) return 4;
    return 0;
  };

  const navigateToTab = (direction: 'left' | 'right') => {
    const currentIndex = getCurrentTabIndex();
    let newIndex = currentIndex;
    
    if (direction === 'right' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'left' && currentIndex < TAB_NAMES.length - 1) {
      newIndex = currentIndex + 1;
    }
    
    if (newIndex !== currentIndex) {
      console.log(`Swiping from ${TAB_NAMES[currentIndex]} to ${TAB_NAMES[newIndex]}`);
      router.push(TAB_ROUTES[newIndex]);
    }
  };

  const gestureHandler = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    if (isWeb) return;

    const { translationX, velocityX, state } = event.nativeEvent;
    
    if (state === 2) {
      translateX.value = translationX;
    } else if (state === 5) {
      const shouldSwipe = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500;
      
      if (shouldSwipe) {
        if (translationX > 0) {
          runOnJS(navigateToTab)('right');
        } else {
          runOnJS(navigateToTab)('left');
        }
      }
      
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (isWeb) {
      return {};
    }
    return {
      transform: [{ translateX: translateX.value * 0.1 }], // Subtle visual feedback
    };
  });

  // Skip swipe navigation on web for better compatibility
  if (isWeb) {
    return <>{children}</>;
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}