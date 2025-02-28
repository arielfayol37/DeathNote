// components/NoteDetail.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Animated,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useHeaderHeight } from '@react-navigation/elements';
import { BlurView } from 'expo-blur';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
/** 
 * Reuse your existing playAudio or adapt it. 
 * Make sure to export it or define it here. 
 */
import { playAudio } from '../index/audioUtils';
import styles from '../index/styles';

export default function NoteDetail({ route }) {
  const { folderName } = route.params; // e.g. "1677158025412"
  const [items, setItems] = useState([]);
  const [aiInfo, setAiInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('original');
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  const [userName, setUserName] = useState('');

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
    // Cleanup: unload sound on unmount
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
      const parsedItems = JSON.parse(noteJson);
      setItems(parsedItems);

      // Read ai_info.json
      const aiInfoPath = FileSystem.documentDirectory + `notes/${folderName}/ai_info.json`;
      const info = await FileSystem.getInfoAsync(aiInfoPath);
      if (info.exists) {
        const aiInfoString = await FileSystem.readAsStringAsync(aiInfoPath);
        const parsedAiInfo = JSON.parse(aiInfoString);
        setAiInfo(parsedAiInfo);
      }
    } catch (error) {
      console.warn('Error loading note:', error);
    }
  };

  const handlePlayAudio = async (uri, index) => {
    // If tapping the same audio => pause
    if (playingAudioIndex === index) {
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

    // If a different audio is playing, unload it first
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setPlayingAudioIndex(index);

    const newSound = await playAudio(
      uri,
      // onPlaybackStatusUpdate:
      (status) => {
        const progressPercent = status.duration
          ? status.position / status.duration
          : 0;
        Animated.timing(getProgressAnim(index), {
          toValue: progressPercent,
          duration: 100,
          useNativeDriver: false,
        }).start();

        // Simulate loudness (replace with actual data if you have it)
        const simulatedLoudness = Math.abs(Math.sin(Date.now() / 100)) * 50 + 25;
        Animated.timing(getLoudnessAnim(index), {
          toValue: simulatedLoudness,
          duration: 100,
          useNativeDriver: false,
        }).start();
      },
      // onFinish:
      () => {
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
        <View style={[styles.noteBox, { height: '90%' }]}>
          <ScrollView>
            {/* Spacing at the top */}
            <View style={{ height: 50 }} />

            <View style={{ alignItems: 'center', width: '100%' }}>
              {/* Show the original items if activeTab is 'original' */}
              {activeTab === 'original' && items.map((item, index) => {
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

              {/* Show raw text if activeTab is 'raw_text' */}
              {activeTab === 'raw_text' && aiInfo?.raw_text && (
                <View style={{ padding: 20 }}>
                  <Text style={{ fontWeight: 'bold', fontSize:20, marginBottom: 10}}>Text Only</Text>
                  <Text selectable>{aiInfo.raw_text}</Text>
                </View>
              )}

              {/* Show summary if activeTab is 'summary' */}
              {activeTab === 'summary' && aiInfo?.summary && (
                <View style={{ padding: 20 }}>
                  <Text style={{ fontWeight: 'bold', fontSize:20, marginBottom: 10}}>AI Summary</Text>
                  <Text>{aiInfo.summary}</Text>
                </View>
              )}
            </View>

            {/* Spacing at the bottom */}
            <View style={{ height: 50 }} />
          </ScrollView>

          {/* Top Blur Overlay */}
          <BlurView
            intensity={8}
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
            intensity={8}
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

        <View style={[styles.interactionArea, { justifyContent: 'space-around' }]}>
          {/* If aiInfo.raw_text exists, show button to switch to 'raw_text' */}
          {aiInfo?.raw_text && (
            <TouchableOpacity
              onPress={() => setActiveTab('raw_text')}
              style={{}}
              hitSlop={ { top: 15, right: 15, bottom: 15, left: 15 } }
            >
              <FontAwesome5
                name="dice-d20"
                size={30}
                color={activeTab === 'raw_text' ? '#007AFF' : 'black'}
              />
            </TouchableOpacity>
          )}

          {/* Default tab: show original inputs */}
          <TouchableOpacity
            onPress={() => setActiveTab('original')}
            style={{}}
            hitSlop={ { top: 15, right: 15, bottom: 15, left: 15 } }
          >
            <FontAwesome
              name="user"
              size={30}
              color={activeTab === 'original' ? '#007AFF' : 'black'}
            />
          </TouchableOpacity>

          {/* If aiInfo.summary exists, show button to switch to 'summary' */}
          {aiInfo?.summary && (
            <TouchableOpacity
              onPress={() => setActiveTab('summary')}
              style={{}}
              hitSlop={ { top: 15, right: 15, bottom: 15, left: 15 } }
            >
              <AntDesign
                name="dingding"
                size={30}
                color={activeTab === 'summary' ? '#007AFF' : 'black'}
              />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
