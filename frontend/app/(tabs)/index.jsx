import React, { useState, useEffect } from 'react'; 
import { View, TextInput, Button, Text, FlatList, StyleSheet, Alert, SafeAreaView } from 'react-native';
import * as Notifications from 'expo-notifications';
// import * as Permissions from 'expo-permissions';

const API_URL = 'http://192.168.4.25:8000/api/notes/'; // Adjust if needed

export default function App() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
    scheduleDailyReminder();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSave = async () => {
    if (note.trim() === '') return Alert.alert('Error', 'Note content cannot be empty');

    try {
      const response = await fetch(`${API_URL}create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note }),
      });

      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
        setNote('');
      } else {
        Alert.alert('Error', 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

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

  const scheduleDailyReminder = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Reminder',
        body: 'Don’t forget to write your note for today!',
      },
      trigger: {
        hour: 13,
        minute: 0,
        repeats: true,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Death Note</Text>

      <TextInput
        style={styles.input}
        placeholder="Write your note here..."
        value={note}
        onChangeText={setNote}
      />

      <Button title="Save" onPress={handleSave} />

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteContent}>{item.title}</Text>
            <Text>{item.content}</Text>
            <Text style={styles.noteTimestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  noteItem: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noteContent: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteTimestamp: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
});
