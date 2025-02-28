import { StyleSheet } from 'react-native';

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
      height: '80%',
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

    userNameInputContainer: {
      flex: 1,
      justifyContent: 'center',
      width: '100%',
      alignItems: 'center',
      padding: 20,
    },
    blurContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    userNameInputBox: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 20,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userNameLabel: {
      fontSize: 20,
      marginBottom: 10,
      fontFamily: 'serif',
      color: '#ddd',
    },
    userNameInput: {
      height: 40,
      width: '100%',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      paddingLeft: 10,
      fontSize: 16,
      marginBottom: 10,
      placeholderTextColor: '#ddd',
    },
    saveButton: {
      backgroundColor: '#007bff', // Blue button
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 10,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    errorText: {
      color: 'red',
      marginTop: 10,
      fontSize: 14,
    },
  });
  

export default styles;
