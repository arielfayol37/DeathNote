// notes-stack.js (can be anywhere, e.g., in a "navigation" folder)

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NodeList from './NodeList';
import NoteDetail from './NoteDetail';

const Stack = createNativeStackNavigator();

export default function NotesStack() {
  return (
    <Stack.Navigator>
      {/* The "list" screen */}
      <Stack.Screen
        name="NodeList"
        component={NodeList}
        options={{ title: 'Previous Notes' }}
      />
      {/* The "detail" screen */}
      <Stack.Screen
        name="NoteDetail"
        component={NoteDetail}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
}
