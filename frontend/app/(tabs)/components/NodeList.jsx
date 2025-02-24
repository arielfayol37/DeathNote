// components/NotesList.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
export default function NotesList({ navigation }) {
  const [notes, setNotes] = useState([]);

  // OR 2) Using useFocusEffect:
  useFocusEffect(
     React.useCallback(() => {
       loadNotesFolders();
    }, [])
  );
  // Reads all subfolders in /notes, sorts them by timestamp desc
  const loadNotesFolders = async () => {
    try {
      const notesDir = FileSystem.documentDirectory + 'notes/';
      // Make sure the directory exists. If it doesn't, create it
      // (or you can skip creation if your save code already handles it).
      await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });

      // Read the subfolders
      const folders = await FileSystem.readDirectoryAsync(notesDir);
      // folders might be something like ["1677158025412", "1677158169954", ...]

      // Sort them in descending order (newest first)
      const sorted = folders.sort((a, b) => Number(b) - Number(a));

      setNotes(sorted); 
    } catch (error) {
      console.warn('Error reading notes directory:', error);
    }
  };

  const renderNoteItem = ({ item }) => {
    // 'item' is the folder name, typically a timestamp
    const timestamp = Number(item);
    const dateString = new Date(timestamp).toLocaleString(); 
    // or use any formatting you want

    return (
          <TouchableOpacity
            style={styles.noteItem}
            onPress={() => {
              // Navigate to NoteDetail screen, passing the folder name
              navigation.navigate('NoteDetail', { folderName: item });
            }}
          >
            <Text style={styles.noteText}>{dateString}</Text>
          </TouchableOpacity>


    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(folderName) => folderName}
        renderItem={renderNoteItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  noteItem: {
    padding: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1
  },
  noteText: {
    fontSize: 16
  }
});
