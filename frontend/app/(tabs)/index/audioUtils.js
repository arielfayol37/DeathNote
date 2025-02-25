// @app/(tabs)/index/audioUtils.js
import { Audio } from 'expo-av';
// Convert milliseconds to "minute:second" format
 function formatDuration(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`; // Pad seconds with leading zero if needed
}
// Request microphone permissions
export async function requestMicrophonePermissions() {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access microphone is required!');
    return false;
  }
  return true;
}

// Start recording audio
export async function startRecording(setRecording) {
  if (!await requestMicrophonePermissions()) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
    setRecording(recording);
  } catch (error) {
    console.error('Failed to start recording', error);
  }
}

// Stop recording audio
export async function stopRecording(recording, setRecording, setItems) {
    if (!recording) return;
  
    try {
      // Get duration before stopping
      const status = await recording.getStatusAsync();
      const durationMillis = status.durationMillis || recording._finalDurationMillis || 0;
      const durationFormatted = formatDuration(durationMillis);
  
      // Stop and unload the recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
  
      setRecording(null);
      setItems((prevItems) => [
        ...prevItems,
        { type: 'audio', uri, duration: durationFormatted },
      ]);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }
// Play recorded audio
export async function playAudio(uri, onPlaybackStatusUpdate, onFinish) {
    if (!uri) return;
  
    try {
      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
  
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.setVolumeAsync(1.0); // Max volume
      await sound.setProgressUpdateIntervalAsync(50);

      // Set up real-time playback status updates
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isPlaying) {
          onPlaybackStatusUpdate({
            position: status.positionMillis,
            duration: status.durationMillis,
            volume: 1.0, // Static for now; Expo AV doesn’t give amplitude
          });
        }
        if (status.didJustFinish) {
          sound.unloadAsync(); // Clean up when finished
          onFinish();
        }
      });
  
      await sound.playAsync();
      return sound; // Return sound object for potential manual control
    } catch (error) {
      console.error('Failed to play audio', error);
    }
  }