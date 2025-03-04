import { createDrawerNavigator } from '@react-navigation/drawer';
import React, { useContext } from 'react';
import { Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import App from './index/index';
import NotesStack from './components/NotesStack';
import Settings from './components/Settings';
import AiChat from './components/AiChat';
import { RefreshProvider, RefreshContext } from './RefreshContext';

const Drawer = createDrawerNavigator();

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const { settings } = useContext(RefreshContext);
  const noteTitle = settings.language === 'english'? 'Write Note': 'Prends Note';
  const noteStackTitle = settings.language === 'english'? 'Notes': 'Notes';
  const settingsTitle = settings.language === 'english' ? 'Settings': 'Paramètres';
  const chatTitle = settings.language === 'english' ? 'Chat with' + settings.shinigami: 'Cause avec' + settings.shinigami;

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
              title: noteTitle,
              drawerIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
        <Drawer.Screen
          name="NotesStack"
          component={NotesStack}
          options={{
            title: noteStackTitle,
            drawerIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
          }}
        />

        <Drawer.Screen
            name="AiChat"
            component={AiChat}
            options={{
              title: chatTitle,
              drawerIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            }}
          />

        <Drawer.Screen
            name="Settings"
            component={Settings}
            options={{
              title: settingsTitle,
              drawerIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
            }}
          />
        </Drawer.Navigator>
    </RefreshProvider>

  );
}
