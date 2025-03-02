// @app/(tabs)/RefreshContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';

const SETTINGS_FILE = 'settings.json'; // The file where we store user settings

export const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [shouldRefreshNotes, setShouldRefreshNotes] = useState(false);

  // We store an entire settings object instead of just userName
  const [settings, setSettings] = useState({
    name: '',
    sex: 'female',      // default
    language: 'english',// default
    shinigami: 'Rÿuk',  // default
  });

  // This indicates whether we’re done checking/loading from file
  const [hasSettings, setHasSettings] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check if settings.json exists and load it if so
    loadSettings();
  }, []);


  const loadSettings = async () => {
    try {
      const filePath = FileSystem.documentDirectory + SETTINGS_FILE;
      const fileContents = await FileSystem.readAsStringAsync(filePath);
      const parsedSettings = JSON.parse(fileContents);

      // If settings file is found, update local state
      setSettings(parsedSettings);
      setHasSettings(true);
    } catch (error) {
      // If file doesn't exist or reading/parsing failed,
      // we do NOT have settings. We'll show the form to create them.
      setHasSettings(false);
    }
  };

  // Save user settings to settings.json
  const saveSettings = async () => {
    // Validate user name
    if (!settings.name.trim()) {
      if (settings.language === 'english'){
        setErrorMessage('Please enter a valid name.');
      }else{
        setErrorMessage('Veuillez entrer un nom valide.');
      }
      
      return;
    }

    try {
      const filePath = FileSystem.documentDirectory + SETTINGS_FILE;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(settings, null, 2));
      setErrorMessage('');
      setHasSettings(true); // Now we've successfully stored the settings
    } catch (err) {
      console.warn('Error saving settings:', err);
    }
  };

  return (
      <RefreshContext.Provider value={{
        shouldRefreshNotes,
        setShouldRefreshNotes,
        settings,
        setSettings,
        hasSettings,
        errorMessage,
        setErrorMessage,
        saveSettings,
      }}>
        {children}
      </RefreshContext.Provider>
  );
};
