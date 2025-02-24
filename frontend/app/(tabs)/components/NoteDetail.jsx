// components/NoteDetail.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHeaderHeight } from '@react-navigation/elements'
/** 
 * Reuse your existing playAudio or adapt it. 
 * Make sure to export it or define it here. 
 */
import { playAudio } from '../index/audioUtils';

export default function NoteDetail({ route, navigation }) {
  const { folderName } = route.params; // e.g. "1677158025412"
  const [items, setItems] = useState([]);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  const soundRef = useRef(null);

  // Animated refs for each item
  const progressAnims = useRef({});
  const loudnessAnims = useRef({});

  // Returns or creates an Animated.Value for progress
  const getProgressAnim = (index) => {
    if (!progressAnims.current[index]) {
      progressAnims.current[index] = new Animated.Value(0);
    }
    return progressAnims.current[index];
  };

  // Returns or creates an Animated.Value for loudness
  const getLoudnessAnim = (index) => {
    if (!loudnessAnims.current[index]) {
      loudnessAnims.current[index] = new Animated.Value(0);
    }
    return loudnessAnims.current[index];
  };

  // Load note from file system on mount
  useEffect(() => {
    loadNote();
    // If you want to unload sound on unmount:
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadNote = async () => {
    try {
      const noteFolder = FileSystem.documentDirectory + `notes/${folderName}/`;
      // Read note.json
      const noteJson = await FileSystem.readAsStringAsync(noteFolder + 'note.json');
      const parsed = JSON.parse(noteJson);
      setItems(parsed);
    } catch (error) {
      console.warn('Error loading note:', error);
    }
  };

  const handlePlayAudio = async (uri, index) => {
    if (playingAudioIndex === index) {
      // If tapping the same audio => pause
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

    // If a different audio is playing, unload it
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setPlayingAudioIndex(index);

    const newSound = await playAudio(
      uri,
      (status) => {
        const progressPercent = status.duration
          ? status.position / status.duration
          : 0;
        Animated.timing(getProgressAnim(index), {
          toValue: progressPercent,
          duration: 100,
          useNativeDriver: false,
        }).start();

        const simulatedLoudness = Math.abs(Math.sin(Date.now() / 100)) * 50 + 25;
        Animated.timing(getLoudnessAnim(index), {
          toValue: simulatedLoudness,
          duration: 100,
          useNativeDriver: false,
        }).start();
      },
      () => {
        // onFinish
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={useHeaderHeight()}
      >
      <View style={styles.noteBox}>
          <ScrollView>
            <View style={{ alignItems: 'center', width: '100%' }}>
              {items.map((item, index) => {
                if (item.type === 'text') {
                  return (
                    <View key={index} style={styles.textContainer}>
                      <Text style={styles.text}>{item.text}</Text>
                    </View>
                  );
                } else if (item.type === 'image') {
                  return (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: item.uri }} style={styles.image} />
                    </View>
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
                      <TouchableOpacity onPress={() => handlePlayAudio(item.uri, index)}>
                        <Ionicons
                          name={
                            playingAudioIndex === index
                              ? 'pause-circle-outline'
                              : 'caret-forward-circle-outline'
                          }
                          size={37}
                          color="black"
                        />
                      </TouchableOpacity>

                      {/* If you have a duration property, show it */}
                      {item.duration ? (
                        <Text style={styles.audioDuration}>{item.duration}</Text>
                      ) : null}

                      <View style={styles.progressBarContainer}>
                        <Animated.View
                          style={[styles.progressBar, { width: progressBarWidth }]}
                        />
                      </View>

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
            </View>
          </ScrollView>
      </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  interactionArea: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#007AFF',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  noteBox: {
    width: '95%',
    height: '95%',
    backgroundColor: '#fff',
    borderRadius: 10,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android shadow
    elevation: 5,
  },
  textContainer: {
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
    color: '#333',
  },
  imageContainer: {
    width: 300,
    height: 400,
    borderRadius: 10,
    margin: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    width: '100%',
  },
  audioDuration: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  progressBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginLeft: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'black',
  },
  loudnessIndicator: {
    width: 20,
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginLeft: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  loudnessBar: {
    width: '100%',
    backgroundColor: 'black',
  },
});
