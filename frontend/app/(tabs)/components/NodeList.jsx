// components/NotesList.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import { sendNoteWithFormData } from './sendNoteToServer';

// EXAMPLE: a function that fetches AI info from your server
async function fetchAiInfoFromServer(folderName) {
  // Replace with your real server endpoint & logic
  // e.g. POST the folderName or note content and get AI info
  const endpoint = 'https://arielfayol.com/api/notes/summarize/';
  // We assume data = { title, raw_text, summary, ... }
  return sendNoteWithFormData(folderName, endpoint);
}

export default function NotesList({ navigation }) {
  const [notes, setNotes] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadNotesFolders();
    }, [])
  );

  /**
   * For each folder:
   *  1) Ensure that ai_info.json exists. If not, fetch from server and save it.
   *  2) Read ai_info.json, parse it, return { title, summary, ... }
   */
  const loadAiInfoForFolder = async (folderName) => {
    try {
      const folderPath = FileSystem.documentDirectory + 'notes/' + folderName + '/';
      const aiInfoPath = folderPath + 'ai_info.json';

      // Check if ai_info.json exists
      const info = await FileSystem.getInfoAsync(aiInfoPath);
      if (!info.exists) {
        // 1) We have no ai_info.json -> fetch from server
        const aiData = await fetchAiInfoFromServer(folderName);

        // 2) Save to ai_info.json
        await FileSystem.writeAsStringAsync(aiInfoPath, JSON.stringify(aiData));
      }

      // Now read ai_info.json from disk
      const aiInfoString = await FileSystem.readAsStringAsync(aiInfoPath);
      const aiInfo = JSON.parse(aiInfoString);
      return aiInfo; // { title, summary, raw_text, ... }
    } catch (error) {
      // If something goes wrong, we can handle or rethrow
      console.warn(`Error in loadAiInfoForFolder(${folderName}):`, error);
      return null;
    }
  };

  // Reads all subfolders in /notes, sorts them by timestamp desc,
  // then ensures each folder has ai_info.json, and finally sets state
  const loadNotesFolders = async () => {
    try {
      const notesDir = FileSystem.documentDirectory + 'notes/';
      await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });

      // 1) Read the subfolders
      const folders = await FileSystem.readDirectoryAsync(notesDir);
      // Sort in descending order
      const sorted = folders.sort((a, b) => Number(b) - Number(a));

      // 2) For each folder, read or create ai_info.json
      //    Then build a note object with folderName, timestamp, and aiInfo
      const noteObjects = [];
      for (let folderName of sorted) {
        const timestamp = Number(folderName);
        let aiInfo = null;
        try {
          aiInfo = await loadAiInfoForFolder(folderName);
        } catch (err) {
          console.warn('Failed to load AI info for folder:', folderName, err);
        }

        noteObjects.push({
          folderName,
          timestamp,
          aiInfo, // may be null if an error occurred
        });
      }

      setNotes(noteObjects);
    } catch (error) {
      console.warn('Error reading notes directory:', error);
    }
  };

  /**
   * Renders each note row:
   *  - If we have aiInfo, show the aiInfo.title and a chunk of summary
   *  - Otherwise show the raw timestamp
   */
  const renderNoteItem = ({ item }) => {
    const { folderName, timestamp, aiInfo } = item;
    // Convert timestamp to date string
    const dateString = new Date(timestamp).toLocaleString();

    let displayTitle = `Note @ ${dateString}`;
    let displaySummary = '';

    if (aiInfo?.title) {
      displayTitle = aiInfo.title;
    }
    if (aiInfo?.summary) {
      // For example, just show first 50 chars
      displaySummary = aiInfo.summary.slice(0, 50) + '...';
    }

    return (
      <TouchableOpacity
        style={styles.noteItem}
        onPress={() => {
          // Navigate to NoteDetail screen, passing the folder name
          navigation.navigate('NoteDetail', { folderName });
        }}
      >
        <Text style={styles.noteTitle}>{displayTitle}</Text>
        {!!displaySummary && (
          <Text style={styles.noteSummary}>{displaySummary}</Text>
        )}
        {/* If no AI info, fallback to date only */}
        {!aiInfo && <Text style={styles.noteSummary}>{dateString}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={(noteObj) => noteObj.folderName}
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
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  noteSummary: {
    fontSize: 14,
    marginTop: 4,
    color: '#666'
  }
});
