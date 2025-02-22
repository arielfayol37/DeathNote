import React, { useState, useEffect } from 'react'; 
import { View, TextInput, Button, Text, FlatList, StyleSheet, Alert, SafeAreaView, 
ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScrollView } from 'react-native-gesture-handler';

import { uploadImage } from './imageUpload';
import {formatTimestamp } from './utils';



export default function App() {
  const [note, setNote] = useState('');

  const [imageUri, setImageUri] = useState(null);

  const handleImageUpload = async () => {
    const uri = await uploadImage();
    if (uri) {
      setImageUri(uri);
      // console.log('Image uploaded:', uri);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        
       
          <View style={styles.noteBox}>
            <ScrollView style={{flex: 1}}>
              <Text style={styles.text}>{note}</Text>
              {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.image} />
              )}
            </ScrollView>
          </View>

          <TouchableOpacity onPress={() => {}}>
              <FontAwesome name="save" size={24} color="black" />
          </TouchableOpacity>
          
          
          
          <View style={styles.interactionArea}>
            <TouchableOpacity onPress={handleImageUpload}>
                <AntDesign name="pluscircleo" size={24} color="black" />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              autoCorrect={false}
              placeholder="Write your note here"
              value={note}
              onChangeText={setNote}
              multiline={true}
              autoFocus={true}
              /> 
            
            <TouchableOpacity onPress={() => {}}>
                <SimpleLineIcons name="microphone" size={24} color="black" />
            </TouchableOpacity>
            
          
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
    borderRadius: 10, // Rounded corners
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
    height: '80%',

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
  image:{
    width: 300,
    height: 300,
    resizeMode: 'contain',
  }
});
