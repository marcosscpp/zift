import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

type BottomNavTab = 'calendar' | 'experimenta' | 'people' | 'account';

interface BottomNavProps {
  active: BottomNavTab;
  style?: ViewStyle;
}

interface NavItem {
  id: BottomNavTab;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, style }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const navItems: NavItem[] = [
    {
      id: 'calendar',
      icon: 'calendar-outline',
      iconActive: 'calendar',
      route: '/calendar',
    },
    {
      id: 'experimenta',
      icon: 'gift-outline',
      iconActive: 'gift',
      route: '/experimenta',
    },
    {
      id: 'people',
      icon: 'people-outline',
      iconActive: 'people',
      route: '/presenteados',
    },
    {
      id: 'account',
      icon: 'person-outline',
      iconActive: 'person',
      route: '/account',
    },
  ];

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) + 12 }, style]}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navButton}
              onPress={() => navigateTo(item.route)}
              disabled={isActive}
              activeOpacity={0.7}
            >
              {isActive && <View style={styles.activeGlow} />}
              <Ionicons
                name={isActive ? item.iconActive : item.icon}
                size={24}
                color={isActive ? theme.colors.primary : 'rgba(255,255,255,0.5)'}
              />
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24, // fallback, overridden by dynamic insets
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.backgroundDark,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: theme.colors.darkBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  navButton: {
    width: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}25`,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});
