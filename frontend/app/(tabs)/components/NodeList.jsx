// components/NotesList.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, ImageBackground } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';

import { sendNoteWithFormData } from './sendNoteToServer';
import { RefreshContext } from '../RefreshContext';
import CustomLoader from './customLoader';

const LOADING_GIF = require('../../../assets/images/earth_rotate.gif');

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
    hour12: true
  }).format(date);
};

// EXAMPLE: a function that fetches AI info from your server
async function fetchAiInfoFromServer(folderName) {
  // Adjust the URL to match your backend endpoint
  const endpoint = 'https://arielfayol.com/api/notes/summarize/';
  return sendNoteWithFormData(folderName, endpoint);
}

export default function NotesList({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { shouldRefreshNotes, setShouldRefreshNotes } = useContext(RefreshContext);

  useEffect(() => {
    // Load notes once on mount
    loadNotesFolders();
  }, []);

  // Re-check on focus. If shouldRefreshNotes is true, reload.
  useFocusEffect(
    useCallback(() => {
      if (shouldRefreshNotes) {
        loadNotesFolders();
        // reset the global state so it doesn't keep triggering
        setShouldRefreshNotes(false);
      }
    }, [shouldRefreshNotes])
  );

  /**
   * Load local notes first, then do background fetches for any missing AI info.
   */
  const loadNotesFolders = async () => {
    try {
      setIsLoading(true); // Show loader when starting
      const notesDir = FileSystem.documentDirectory + 'notes/';

      // Ensure notes directory exists
      await FileSystem.makeDirectoryAsync(notesDir, { intermediates: true });
      
      // Read subfolders (each subfolder is a "note")
      const folders = await FileSystem.readDirectoryAsync(notesDir);
      // Sort so newest (largest timestamp) first
      const sorted = folders.sort((a, b) => Number(b) - Number(a));

      // Build local note objects
      const noteObjects = [];
      for (let folderName of sorted) {
        const timestamp = Number(folderName);
        const folderPath = notesDir + folderName + '/';
        const aiInfoPath = folderPath + 'ai_info.json';

        let aiInfo = null;
        try {
          // Check if ai_info.json already exists
          const info = await FileSystem.getInfoAsync(aiInfoPath);
          if (info.exists) {
            // Load from disk
            const aiInfoString = await FileSystem.readAsStringAsync(aiInfoPath);
            aiInfo = JSON.parse(aiInfoString);
          }
        } catch (err) {
          console.warn('Error loading local AI info:', err);
        }

        noteObjects.push({
          folderName,
          timestamp,
          aiInfo,
          isFetching: !aiInfo, // If no AI info, we'll fetch in background
        });
      }

      // Set notes in state so the list renders immediately
      setNotes(noteObjects);

      // Kick off background fetch for missing AI info
      noteObjects.forEach((noteObj) => {
        if (!noteObj.aiInfo) {
          fetchAiInfoInBackground(noteObj.folderName);
        }
      });

    } catch (error) {
      console.warn('Error reading notes directory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * For a given folderName, fetch AI info from the server (if needed),
   * and write it to disk + update state once complete.
   */
  const fetchAiInfoInBackground = async (folderName) => {
    try {
      const aiData = await fetchAiInfoFromServer(folderName);
      const folderPath = FileSystem.documentDirectory + 'notes/' + folderName + '/';
      const aiInfoPath = folderPath + 'ai_info.json';

      // Write the new data to disk
      await FileSystem.writeAsStringAsync(aiInfoPath, JSON.stringify(aiData));

      // Update the corresponding note in state
      setNotes((prevNotes) =>
        prevNotes.map((n) => {
          if (n.folderName === folderName) {
            return {
              ...n,
              aiInfo: aiData,
              isFetching: false,
            };
          }
          return n;
        })
      );
    } catch (error) {
      console.warn(`Error fetching AI info for folder ${folderName}`, error);
      // Optionally set a flag to indicate an error
      setNotes((prevNotes) =>
        prevNotes.map((n) => {
          if (n.folderName === folderName) {
            return {
              ...n,
              isFetching: false,
              fetchError: true,
            };
          }
          return n;
        })
      );
    }
  };

  /**
   * Renders each note item in the FlatList.
   */
  const renderNoteItem = ({ item }) => {
    const { folderName, timestamp, aiInfo, isFetching } = item;
    const dateString = formatTimestamp(timestamp);
  
    // Default text values
    let displayTitle = `Note @ ${dateString}`;
    let displaySummary = '';
  
    if (aiInfo?.title) {
      displayTitle = aiInfo.title;
    }
    if (aiInfo?.summary) {
      displaySummary =
        aiInfo.summary.length > 200
          ? aiInfo.summary.slice(0, 200) + '...'
          : aiInfo.summary;
    }
  
    return (
      <TouchableOpacity
        style={styles.noteItem}
        onPress={() => {
          navigation.navigate('NoteDetail', { folderName });
        }}
      >
        <View style={styles.contentContainer}>
          {isFetching ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CustomLoader size={40} loading_gif={LOADING_GIF} />
              <Text style={styles.noteSummary}>Loading AI Summary...Touch to proceed without summary</Text>
            </View>
          ) : (
            <Text style={styles.noteTitle}>{displayTitle}</Text>
          )}
          {!!displaySummary && (
            <Text style={styles.noteSummary}>{displaySummary}</Text>
          )}
          <Text style={[styles.noteDate, { alignSelf: 'flex-end' }]}>{dateString}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ImageBackground
            source={require('../../../assets/images/white_rotate.gif')}
            style={styles.loaderImage}
          />
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(noteObj) => noteObj.folderName}
          renderItem={renderNoteItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderImage: {
    width: 150,
    height: 150,
    resizeMode: 'cover',
  },
  noteItem: {
    padding: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  contentContainer: {},
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteSummary: {
    fontSize: 14,
    marginTop: 4,
    color: '#666',
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});
