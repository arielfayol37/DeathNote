// @app/(tabs)/index/imageUpload.jsx
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export async function uploadImage() {
  return new Promise((resolve) => {
    Alert.alert(
      'Upload Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission required', 'Camera permissions are needed to take a photo.');
              resolve(null);
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: false,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled) {
              resolve(result.assets[0].uri);
            } else {
              resolve(null);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            // Request media library permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission required', 'Gallery permissions are needed to select a photo.');
              resolve(null);
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: false,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled) {
              resolve(result.assets[0].uri);
            } else {
              resolve(null);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true }
    );
  });
}

export default uploadImage;