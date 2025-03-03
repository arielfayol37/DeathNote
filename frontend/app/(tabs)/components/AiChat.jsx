import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Animated
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av'; // Added import for audio functionality
import { useHeaderHeight } from '@react-navigation/elements';
import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { uploadImage } from '../index/imageUpload';
import styles from './aichatStyles';
import CustomLoader from '../components/customLoader';
import { RefreshContext } from '../RefreshContext';

// Format timestamp for working memory
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export default function AiChat() {
  // State Declarations
  const [workingMemory, setWorkingMemory] = useState('');
  const [messages, setMessages] = useState([]);
  const [updatedMessages, setUpdatedMessages] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [recording, setRecording] = useState(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState(null);
  const { settings } = useContext(RefreshContext);

  const endpoint = 'https://arielfayol.com/api/chat';
  const headerHeight = useHeaderHeight();
  // Refs
  const scrollViewRef = useRef(null);
  const soundRef = useRef(null);
  const progressAnims = useRef({});
  const loudnessAnims = useRef({});
  // Ref for the thinking dots interval
  const thinkingIntervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
      }
    };
  }, []);

  // Load workingMemory on Mount
  useEffect(() => {
    loadWorkingMemory();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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

  // Load Working Memory
  const loadWorkingMemory = async () => {
    try {
      const notesDir = FileSystem.documentDirectory + 'notes/';
      await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });
      const folders = await FileSystem.readDirectoryAsync(notesDir);
      const sortedFolders = folders.sort((a, b) => Number(b) - Number(a));
      const recentFolders = sortedFolders.slice(0, 50);

      let memoryString = '';
      for (let folderName of recentFolders) {
        const timestamp = Number(folderName);
        const folderPath = notesDir + folderName + '/';
        const aiInfoPath = folderPath + 'ai_info.json';

        const info = await FileSystem.getInfoAsync(aiInfoPath);
        if (!info.exists) continue;

        const aiInfoString = await FileSystem.readAsStringAsync(aiInfoPath);
        const aiInfo = JSON.parse(aiInfoString);

        if (aiInfo?.title && aiInfo?.summary) {
          const formattedDate = formatTimestamp(timestamp);
          memoryString += `${formattedDate}:\n<title>${aiInfo.title}</title><summary>${aiInfo.summary}</summary>\n\n`;
        }
      }

      setWorkingMemory(memoryString.trim());
    } catch (error) {
      console.warn('Error building working memory:', error);
    }
  };

  // **Audio Handling Functions**

  // Request microphone permissions
  const requestMicrophonePermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access microphone is required!');
      return false;
    }
    return true;
  };

  // Start recording audio
  const startRecording = async () => {
    if (!await requestMicrophonePermissions()) return null;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      return recording;
    } catch (error) {
      console.error('Failed to start recording', error);
      return null;
    }
  };

  // Stop recording audio
  const stopRecording = async (recording) => {
    if (!recording) return { uri: null, duration: 0 };

    try {
      const status = await recording.getStatusAsync();
      const durationMillis = status.durationMillis || 0;
      const durationSeconds = Math.floor(durationMillis / 1000);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      return { uri, duration: durationSeconds };
    } catch (error) {
      console.error('Failed to stop recording', error);
      return { uri: null, duration: 0 };
    }
  };

  // Play audio
  const playAudio = async (uri, onPlaybackStatusUpdate, onFinish) => {
    if (!uri) return null;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.setVolumeAsync(1.0);
      await sound.setProgressUpdateIntervalAsync(50);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isPlaying) {
          onPlaybackStatusUpdate({
            position: status.positionMillis,
            duration: status.durationMillis,
          });
        }
        if (status.didJustFinish) {
          sound.unloadAsync();
          onFinish();
        }
      });

      await sound.playAsync();
      return sound;
    } catch (error) {
      console.error('Failed to play audio', error);
      return null;
    }
  };

  // Helper function to add a thinking placeholder message
  const addThinkingPlaceholder = () => {
    const loadingMessageId = Date.now().toString() + '-loading';
    const loadingMessage = {
      id: loadingMessageId,
      sender: 'server',
      type: 'text',
      content: '.'
    };
    setMessages((prev) => [...prev, loadingMessage]);

    let dotIndex = 0;
    const dots = [".", "..", "..."];
    thinkingIntervalRef.current = setInterval(() => {
      dotIndex = (dotIndex + 1) % dots.length;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessageId ? { ...m, content: dots[dotIndex] } : m
        )
      );
    }, 500);

    return loadingMessageId;
  };

  // Send Text Message
  const sendTextMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'text',
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentText('');

    const loadingMessageId = addThinkingPlaceholder();

    const formData = new FormData();
    formData.append('working_memory', workingMemory);
    formData.append('updated_messages', JSON.stringify(updatedMessages));
    formData.append('message_type', 'text');
    formData.append('message_content', text);
    formData.append('settings', JSON.stringify(settings));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      setUpdatedMessages(data.updated_messages);
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      // Update the placeholder with the server reply
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessageId
            ? { ...m, content: data.text_reply }
            : m
        )
      );
    } catch (error) {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      console.error('Error sending text message:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessageId
            ? { ...m, content: 'Error fetching response' }
            : m
        )
      );
    }
  };

  // Send Audio Message
  const sendAudioMessage = async (audioUri, duration) => {
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'audio',
      content: audioUri,
      duration,
    };
    setMessages((prev) => [...prev, userMessage]);

    const loadingMessageId = addThinkingPlaceholder();

    const formData = new FormData();
    formData.append('working_memory', workingMemory);
    formData.append('updated_messages', JSON.stringify(updatedMessages));
    formData.append('message_type', 'audio');
    formData.append('message_content', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'audio.m4a',
    });
    formData.append('duration', duration);
    formData.append('settings', JSON.stringify(settings));
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setUpdatedMessages(data.updated_messages);
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessageId
            ? { ...m, content: data.text_reply }
            : m
        )
      );
    } catch (error) {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      console.error('Error sending audio message:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessageId
            ? { ...m, content: 'Error fetching response' }
            : m
        )
      );
    }
  };

  // Send Image Message
  const sendImageMessage = async (imageUri) => {
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      type: 'image',
      content: imageUri,
    };
    setMessages((prev) => [...prev, userMessage]);

    const loadingMessageId = addThinkingPlaceholder();

    const formData = new FormData();
    formData.append('working_memory', workingMemory);
    formData.append('updated_messages', JSON.stringify(updatedMessages));
    formData.append('message_type', 'image');
    formData.append('message_content', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
    });
    formData.append('settings', JSON.stringify(settings));

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      setUpdatedMessages(data.updated_messages);
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessageId
            ? { ...m, content: data.text_reply }
            : m
        )
      );
    } catch (error) {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      console.error('Error sending image message:', error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMessageId
            ? { ...m, content: 'Error fetching response' }
            : m
        )
      );
    }
  };

  // Handle Recording
  const handleRecordingPress = async () => {
    if (recording) {
      const { uri, duration } = await stopRecording(recording);
      setRecording(null);
      if (uri) await sendAudioMessage(uri, duration);
    } else {
      const recorder = await startRecording();
      setRecording(recorder);
    }
  };

  // Handle Image Upload
  const handleImageUpload = async () => {
    const uri = await uploadImage();
    if (uri) await sendImageMessage(uri);
  };

  // Handle Audio Playback
  const handlePlayAudio = async (uri, index) => {
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
        // Simulate loudness
        const simulatedLoudness = Math.abs(Math.sin(Date.now() / 100)) * 50 + 25;
        Animated.timing(getLoudnessAnim(index), {
          toValue: simulatedLoudness,
          duration: 100,
          useNativeDriver: false,
        }).start();
      },
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

  // Render
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message, index) => {
          const isUser = message.sender === 'user';
          const progressValue =
            message.type === 'audio' ? getProgressAnim(index) : null;
          const loudnessValue =
            message.type === 'audio' ? getLoudnessAnim(index) : null;
          const progressBarWidth = progressValue?.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          });
          const loudnessBarHeight = loudnessValue?.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          });
          return (
            <View
              key={message.id}
              style={{
                flexDirection: 'row',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                marginVertical: 5,
                paddingHorizontal: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: isUser ? 'white' : '#007AFF',
                  padding: 10,
                  borderRadius: 10,
                  maxWidth: '80%',
                  width: message.type === 'audio' ? '80%' : 'auto',
                  elevation: isUser ? 2 : 0,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                }}
              >
                {message.type === 'text' && (
                  <Text
                    style={{
                      color: isUser ? 'black' : 'white',
                      fontSize: 16.5,
                      fontStyle: message.id.endsWith('-loading')
                        ? 'italic'
                        : 'normal',
                    }}
                  >
                    {message.content}
                  </Text>
                )}
                {message.type === 'audio' && (
                  <View style={styles.audioItem}>
                    <TouchableOpacity
                      onPress={() => handlePlayAudio(message.content, index)}
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
                    <Text style={styles.audioDuration}>{message.duration}s</Text>
                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                      <Animated.View
                        style={[
                          styles.progressBar,
                          { width: progressBarWidth },
                        ]}
                      />
                    </View>
                    {/* Loudness Indicator */}
                    <View style={styles.loudnessIndicator}>
                      <Animated.View
                        style={[styles.loudnessBar, { height: loudnessBarHeight }]}
                      />
                    </View>
                  </View>
                )}
                {message.type === 'image' && (
                  <Image
                    source={{ uri: message.content }}
                    style={styles.image}
                  />
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Interaction Area */}
      <View style={styles.interactionArea}>
        <TouchableOpacity onPress={handleImageUpload}>
          <AntDesign name="camerao" size={24} />
        </TouchableOpacity>
        {recording ? (
          <CustomLoader size={60} />
        ) : (
          <TextInput
            style={styles.input}
            value={currentText}
            onChangeText={setCurrentText}
            placeholder="Type your message"
            multiline={true}
          />
        )}
        <TouchableOpacity onPress={handleRecordingPress}>
          {recording ? (
            <SimpleLineIcons name="control-pause" size={24} color="red" />
          ) : (
            <SimpleLineIcons name="microphone" size={24} />
          )}
        </TouchableOpacity>
        {!recording ? (
          <TouchableOpacity onPress={() => sendTextMessage(currentText)}>
            <Ionicons name="send" size={24} />
          </TouchableOpacity>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
