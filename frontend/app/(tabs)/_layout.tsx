import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import App from './index/index';
import NotesStack from './components/NotesStack';
import { RefreshProvider } from './RefreshContext';

const Drawer = createDrawerNavigator();

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (

    <RefreshProvider>
        <Drawer.Navigator
          initialRouteName="index"
          screenOptions={{
            headerShown: true,
            drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            drawerStyle: Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
          }}>
          <Drawer.Screen
            name="index"
            component={App}
            options={{
              title: '',
              drawerIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
        <Drawer.Screen
          name="NotesStack"
          component={NotesStack}
          options={{
            title: '',
            drawerIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          }}
        />
        </Drawer.Navigator>
    </RefreshProvider>

  );
}
