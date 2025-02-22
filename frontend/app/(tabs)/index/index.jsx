import React, { useState, useEffect } from 'react'; 
import { View, TextInput, Button, Text, FlatList, StyleSheet, Alert, SafeAreaView, 
ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import {formatTimestamp } from './utils';
import { ScrollView } from 'react-native-gesture-handler';

export default function App() {
  const [note, setNote] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        
       
          <View style={styles.noteBox}>
            <ScrollView style={{flex: 1}}>
              <Text style={styles.text}>{note}</Text>
            </ScrollView>
          </View>
          
          
          
          <View style={styles.interactionArea}>
            
            <AntDesign name="pluscircleo" size={24} color="black" />
            <TextInput
              style={styles.input}
              autoCorrect={false}
              placeholder="Write your note here"
              value={note}
              onChangeText={setNote}
              /> 
            <SimpleLineIcons name="microphone" size={24} color="black" />
          
          </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:{
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5', // Light background for better contrast
  },
  interactionArea:{
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50, // Increased height for better visibility
    width: '80%', // Slightly less than full width for better aesthetics
    borderColor: '#007AFF', // Blue border color
    borderWidth: 2, // Thicker border
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 12, // Padding inside the input
    fontSize: 16, // Larger font size
    backgroundColor: '#fff', // White background for the input
  },
  text: {
    fontSize: 16,
    color: '#333', // Darker text color for better readability
    fontFamily: 'Cambria, Cochin, Georgia, Times, Times New Roman, serif',
    paddingVertical: 10,
    paddingHorizontal: 20,
    
  },
  noteBox: {
    width: '95%',
    height: '86%',

    backgroundColor: '#fff', // Background color of the box
    borderRadius: 10, // Rounded corners
    // Shadow for iOS
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow blur radius
    // Shadow for Android
    elevation: 5, // Elevation for Android shadow
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Cambria, Cochin, Georgia, Times, Times New Roman, serif',
  },
});
