import React, { useState, useEffect, useRef } from 'react'; 
import { View, TextInput, Button, Text, FlatList, StyleSheet, Alert, SafeAreaView, 
ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ScrollView} from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

import { startRecording, stopRecording, playAudio } from './audioUtils';
import { uploadImage } from './imageUpload';
import {formatTimestamp } from './utils';



export default function App() {
  const [items, setItems] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const scrollViewRef = useRef(null);

  const handleImageUpload = async () => {
    const uri = await uploadImage();
    if (uri) {
      const newItems = [...items];
      newItems.push({ 'type': 'image', 'uri': uri }, { 'type': 'text', 'text': '' });
      setCurrentText(''); // Clear the text input
      setCurrentIndex(items.length + 1);
      setItems(newItems);

      setTimeout(() => {
      scrollViewRef.current?.scrollTo({ 
        y:200, 
        animated: true });
    }, 100);
      // console.log('Image uploaded:', uri);
    }
  };
  
  const changeItemText = (index, text) => {
    const newItems = [...items];
    newItems[index] = { 'type': 'text', 'text':text };
    setItems(newItems);
  }

  const handleTextInput = (text) => {
    setCurrentText(text);
    changeItemText(currentIndex, text);
  
  }

  const handleTextPress = (index) => {
    setCurrentIndex(index);
    setCurrentText(items[index].text);
  }


  // Handle recording button press
  const handleRecordingPress = async () => {
    if (recording) {
      await stopRecording(recording, setRecording, setItems);
    } else {
      await startRecording(setRecording);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}> 
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
       
          <View style={styles.noteBox}>
            <ScrollView ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
              <View style={{alignItems: 'center', width: '100%'}}>
                  {items.map((item, index) => (
                    item.type==='text'?
                    <TouchableOpacity key={index} onPress={() => handleTextPress(index)}
                      style={{width: '100%'}}> 
                        <View style={styles.textContainer}>
                          <Text style={styles.text}>
                            {item.text}
                          </Text>
                        </View>
                    </TouchableOpacity>: 
                    item.type==='image'? 
                    <TouchableOpacity key={index} onPress={() => {}}>
                        <View style={styles.imageContainer}>
                          <Image source={{uri: item.uri}} style={styles.image}/>
                        </View>
                        
                    </TouchableOpacity>
                    : item.type==='audio'?
                      <TouchableOpacity key={index} onPress={() => playAudio(item.uri)}>
                        <View style={styles.audioContainer}>
                          <Ionicons name="caret-forward-circle-outline" size={24} color="black" />
                          <Text style={styles.audioDuration}>{item.duration}</Text>
                        </View>
                      </TouchableOpacity>: null
                  ))}
              </View>
            </ScrollView>
          </View>

          <TouchableOpacity onPress={() => {}}>
              <FontAwesome name="save" size={24} color="black" />
          </TouchableOpacity>
          
          
          
          <View style={styles.interactionArea}>
            <TouchableOpacity onPress={handleImageUpload}>
                <AntDesign name="pluscircleo" size={24} color="black" />
            </TouchableOpacity>
            
            {recording ? <ActivityIndicator size="large" color="red" /> :
            <TextInput
              style={styles.input}
              autoCorrect={false}
              placeholder="Write your note here"
              value={currentText}
              onChangeText={handleTextInput}
              multiline={true}
              autoFocus={true}
              /> }
            
            <TouchableOpacity onPress={handleRecordingPress}>
              {recording ? <SimpleLineIcons name="control-pause" size={24} color="red"/> : <SimpleLineIcons name="microphone" size={24} color="black"/>}
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
  textContainer:{
    padding: 5,
    margin: 2,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#D3D3D3',
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#333', // Darker text color for better readability
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
  imageContainer:{
    width: 300,
    height: 400,
    borderRadius: 10,
    backgroundColor: 'grey',
    margin: 5,
  },
  image:{
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  audioDuration: {
    marginLeft: 8, // Space between icon and duration text
    fontSize: 16,
    color: '#333',
  },
});
