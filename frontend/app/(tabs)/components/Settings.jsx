// @app/(tabs)/components/Settings.jsx

import React, { useContext } from 'react';
import { View, Alert } from 'react-native';
import { RefreshContext } from '../RefreshContext';
import SettingsForm from '../index/SettingsForm';

export default function Settings() {
  const { settings, setSettings, errorMessage, setErrorMessage, saveSettings,} = useContext(RefreshContext);

  const save = ()=>{
    saveSettings();
    if(settings.name != ''){
        if(settings.language === 'english'){
            Alert.alert('Success', 'settings saved!')
        }else{
            Alert.alert('Succès', 'Enregistré!')
        }
    }
  }

  return (
    <View style={{flex: 1}}>
        <SettingsForm
        settings={settings}
        setSettings={setSettings}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        saveSettings={save}
        />
    </View>
  )

}