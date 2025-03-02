// @app/(tabs)/index/index.jsx
import React, { useState, useRef, useContext } from 'react'; 
import { 
  View, 
  TextInput, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  Image, 
  TouchableOpacity, 
  SafeAreaView, 
  Animated,
  Alert,
  Settings,
} from 'react-native';

import { useHeaderHeight } from '@react-navigation/elements'
import * as FileSystem from 'expo-file-system';

import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BlurView } from 'expo-blur';

import { startRecording, stopRecording, playAudio } from './audioUtils';
import { uploadImage } from './imageUpload';
import styles from './styles';


import SettingsForm from './SettingsForm';
import CustomLoader from '../components/customLoader';
import { RefreshContext } from '../RefreshContext';



export default function App() {
  const [items, setItems] = useState([{ type: 'text', text: '' }]);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  const { setShouldRefreshNotes, errorMessage, setErrorMessage, settings, setSettings,
          saveSettings, hasSettings
   } = useContext(RefreshContext);


  // Keep track of the currently playing sound object
  const soundRef = useRef(null);

  // Animated refs for each item
  const progressAnims = useRef({});
  const loudnessAnims = useRef({});

  const scrollViewRef = useRef(null);

  const getProgressAnim = (index) => {
    if (!progressAnims.current[index]) {
      progressAnims.current[index] = new Animated.Value(0);
    }
    return progressAnims.current[index];
  };

  const getLoudnessAnim = (index) => {
    if (!loudnessAnims.current[index]) {
      loudnessAnims.current[index] = new Animated.Value(0);
    }
    return loudnessAnims.current[index];
  };

  const handleImageUpload = async () => {
    const uri = await uploadImage();
    if (uri) {
      const newItems = [...items];
      newItems.push({ type: 'image', uri });
      setItems(newItems);

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 200, animated: true });
      }, 100);
    }
  };

  const addNewText = () => {
    const newItems = [...items];
    newItems.push({ type: 'text', text: '' });
    setCurrentText('');
    setCurrentIndex(items.length);
    setItems(newItems);
  };
  
  const changeItemText = (index, text) => {
    const newItems = [...items];
    newItems[index] = { type: 'text', text };
    setItems(newItems);
  };

  const handleTextInput = (text) => {
    setCurrentText(text);
    changeItemText(currentIndex, text);
  };

  const handleTextPress = (index) => {
    setCurrentIndex(index);
    setCurrentText(items[index].text);
  };

  // Play / pause audio
  const handlePlayAudio = async (uri, index) => {
    if (playingAudioIndex === index) {
      // => Pause
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
      setPlayingAudioIndex(null);

      Animated.timing(getProgressAnim(index), {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      Animated.timing(getLoudnessAnim(index), {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();

      return;
    }

    // If some other audio is playing, unload it first
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    // Play the requested audio
    setPlayingAudioIndex(index);

    const newSound = await playAudio(
      uri,
      (status) => {
        // Update progress
        const progressPercent = status.duration
          ? status.position / status.duration
          : 0;
        Animated.timing(getProgressAnim(index), {
          toValue: progressPercent,
          duration: 100,
          useNativeDriver: false,
        }).start();

        // Simulate loudness
        const simulatedLoudness = Math.abs(Math.sin(Date.now() / 100)) * 50 + 25;
        Animated.timing(getLoudnessAnim(index), {
          toValue: simulatedLoudness,
          duration: 100,
          useNativeDriver: false,
        }).start();
      },
      () => {
        // Audio finished
        setPlayingAudioIndex(null);
        soundRef.current = null;
        Animated.timing(getProgressAnim(index), {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
        Animated.timing(getLoudnessAnim(index), {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    );

    soundRef.current = newSound;
  };

  // Start / stop recording
  const handleRecordingPress = async () => {
    if (recording) {
      await stopRecording(recording, setRecording, setItems);
    } else {
      await startRecording(setRecording);
    }
  };

  /**
   * Create a new folder for this note and store items:
   * 1) Creates: <documentDirectory>/notes/<timestamp>/
   * 2) Copies each item file (images, audio) into that folder
   * 3) Writes a note.json containing the final items array
   */
  const handleSaveNote = async () => {
    try {
        if (items.length === 1 && currentText === '') {
          if (settings.language === 'english'){
            Alert.alert('Error', 'Cannot save an empty note.');
          }else{
            Alert.alert('Erreur', 'Impossible d\'enregistrer une note vide.');
          }
          
          return;
        }

      // 1. Create a unique directory for this note
      const timestamp = Date.now();
      const noteFolder = FileSystem.documentDirectory + `notes/${timestamp}/`;
      // Make sure "notes" and subfolder exist
      await FileSystem.makeDirectoryAsync(noteFolder, { intermediates: true });

      // 2. Build the final items array, copying files for images/audio
      const finalItems = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.type === 'text') {
          // Just store text as-is
          finalItems.push(item);
        } else if (item.type === 'image') {
          // Copy the image file to noteFolder
          const newFileName = `image-${i}.jpg`;
          const newPath = noteFolder + newFileName;
          await FileSystem.copyAsync({ from: item.uri, to: newPath });

          // Then store the item with updated URI
          finalItems.push({ type: 'image', uri: newPath });
        } else if (item.type === 'audio') {
          // Copy the audio file
          const newFileName = `audio-${i}.m4a`;
          const newPath = noteFolder + newFileName;
          await FileSystem.copyAsync({ from: item.uri, to: newPath });

          // Store item with updated URI + duration
          finalItems.push({
            type: 'audio',
            uri: newPath,
            duration: item.duration
          });
        }
      }

      // 3. Write a JSON file describing these items
      const noteJson = JSON.stringify(finalItems, null, 2);
      await FileSystem.writeAsStringAsync(noteFolder + 'note.json', noteJson);

      if(settings.language === 'english'){
        Alert.alert('Success', 'Note saved successfully!');
      }else{
        Alert.alert('Succès', 'Noté avec succès!');
      }
      
      
      setItems([]);
      setCurrentIndex(0);
      setCurrentText('');
      setShouldRefreshNotes(true);

    } catch (error) {
      console.warn('Error saving note:', error);
      alert('Failed to save note: ' + error.message);
    }
  };



  // MAIN RENDER
  return (
    <SafeAreaView style={styles.safeArea}>

        {/* If settings already exist, go to main note UI; otherwise show settings form */}
        {hasSettings ? (
        <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={useHeaderHeight()}
        >
          <View style={styles.noteBox}>
            <ScrollView
              ref={scrollViewRef}
              onContentSizeChange={() =>
                currentIndex === items.length - 1
                  ? scrollViewRef.current?.scrollToEnd({ animated: true })
                  : null
              }
            >
              <View style={{ height: 50 }} />
              <View style={{ alignItems: 'center', width: '100%' }}>
                {items.map((item, index) => {
                  if (item.type === 'text') {
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleTextPress(index)}
                        style={{ width: '100%' }}
                      >
                        <View style={styles.textContainer}>
                          <Text style={styles.text}>{item.text}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  } else if (item.type === 'image') {
                    return (
                      <TouchableOpacity key={index} onPress={() => {}}>
                        <View style={styles.imageContainer}>
                          <Image source={{ uri: item.uri }} style={styles.image} />
                        </View>
                      </TouchableOpacity>
                    );
                  } else if (item.type === 'audio') {
                    const progressValue = getProgressAnim(index);
                    const loudnessValue = getLoudnessAnim(index);

                    const progressBarWidth = progressValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    });
                    const loudnessBarHeight = loudnessValue.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    });

                    return (
                      <View key={index} style={styles.audioItem}>
                        <TouchableOpacity
                          onPress={() => handlePlayAudio(item.uri, index)}
                        >
                          <Ionicons
                            name={
                              playingAudioIndex === index
                                ? 'pause-circle-outline'
                                : 'caret-forward-circle-outline'
                            }
                            size={37}
                          />
                        </TouchableOpacity>
                        <Text style={styles.audioDuration}>{item.duration}</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                          <Animated.View
                            style={[styles.progressBar, { width: progressBarWidth }]}
                          />
                        </View>

                        {/* Loudness Indicator */}
                        <View style={styles.loudnessIndicator}>
                          <Animated.View
                            style={[styles.loudnessBar, { height: loudnessBarHeight }]}
                          />
                        </View>
                      </View>
                    );
                  }
                  return null;
                })}

                {/* Button to add new blank text item */}
                <TouchableOpacity
                  onPress={addNewText}
                  style={{ margin: 8 }}
                  hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                >
                  <AntDesign name="pluscircleo" size={24} />
                </TouchableOpacity>
              </View>

              <View style={{ height: 75 }} />
            </ScrollView>

            {/* Top Blur Overlay */}
            <BlurView
              intensity={5}
              tint="light"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 50,
              }}
              pointerEvents="none"
            />

            {/* Bottom Blur Overlay */}
            <BlurView
              intensity={5}
              tint="light"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 50,
              }}
              pointerEvents="none"
            />
          </View>   
          <TouchableOpacity 
              onPress={handleSaveNote}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <MaterialCommunityIcons name="draw-pen" size={24} />
            </TouchableOpacity>

            <View style={styles.interactionArea}>
              <TouchableOpacity 
                onPress={handleImageUpload}
                hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
              >
                <AntDesign name="camerao" size={24} />
              </TouchableOpacity>

              {recording ? (
                <CustomLoader size={60} />
              ) : (
                <TextInput
                  style={styles.input}
                  autoCorrect={false}
                  placeholder={settings.language==='english'? "Write your note here": "Ecris ici"}
                  value={currentText}
                  onChangeText={handleTextInput}
                  multiline={true}
                />
              )}

              <TouchableOpacity 
                onPress={handleRecordingPress}
                hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
              >
                {recording ? (
                  <SimpleLineIcons name="control-pause" size={24} color="red" />
                ) : (
                  <SimpleLineIcons name="microphone" size={24} />
                )}
              </TouchableOpacity>
            </View>       

        </KeyboardAvoidingView>
        ) : (
          // Show the user settings form if we do NOT have valid settings yet

          <SettingsForm
            settings={settings}
            setSettings={setSettings}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            saveSettings={saveSettings}
          />
        )}

      
    </SafeAreaView>
  );
}