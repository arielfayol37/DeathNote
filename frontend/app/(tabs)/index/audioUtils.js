import { Audio } from 'expo-av';

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
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    setItems((prevItems) => [...prevItems, { type: 'audio', uri }]);
  } catch (error) {
    console.error('Failed to stop recording', error);
  }
}

// Play recorded audio
export async function playAudio(uri) {
  if (!uri) return;

  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  } catch (error) {
    console.error('Failed to play audio', error);
  }
}
