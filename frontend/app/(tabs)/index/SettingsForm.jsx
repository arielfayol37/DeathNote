// @app/(tabs)/index/SettingsForm.jsx
import React from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';

import settingsStyles from './settingsStyles'

export default function SettingsForm({ settings, setSettings, errorMessage, setErrorMessage, saveSettings }){
    return (
      <View style={settingsStyles.userSettingsInputBox}>

        {settings.language === 'english'?
        <Text style={settingsStyles.userSettingsLabel}>Hello {settings.name===''? 'Human':settings.name}!</Text>:
        <Text style={settingsStyles.userSettingsLabel}> Salut {settings.name===''? 'Humain':settings.name}! </Text>
        }

      

      {/* Name */}
      <View style={settingsStyles.settingsBlock}>
        {settings.language === 'english'?
        <Text style={settingsStyles.fieldLabel}>What can I call you?</Text>:  
        <Text style={settingsStyles.fieldLabel}>Comment puis-je t'appeler?</Text>
        }

        <TextInput
          placeholder={settings.language === "english"? "Enter your name": "Ecris ton nom ici"}
          placeholderTextColor="#999999"
          style={settingsStyles.userNameInput}
          value={settings.name}
          onChangeText={(text) => {
            setSettings({ ...settings, name: text });
            if (errorMessage) setErrorMessage('');
          }}
        />
      </View>

      {/* Sex (female [default] or male) */}
      <View style={settingsStyles.settingsBlock}>
    
        <Text style={settingsStyles.fieldLabel}>{settings.language ==='english'? 'You are a':'Tu es'}</Text>
      
        <View style={settingsStyles.settingsOptionContainer}>
          <TouchableOpacity
            style={[
              settingsStyles.settingsButton,
              settings.sex === 'female' && settingsStyles.settingsButtonSelected,
            ]}
            onPress={() => setSettings(prev => ({ ...prev, sex: 'female' }))}
          >
          
            <Text
            style={[
              settingsStyles.settingsButtonText,
              settings.sex === 'female' && settingsStyles.settingsButtonTextSelected,
            ]}
            >
            {settings.language === 'english'? 'Woman': 'Femme'}
            </Text>


          </TouchableOpacity>
          <TouchableOpacity
            style={[
              settingsStyles.settingsButton,
              settings.sex === 'male' && settingsStyles.settingsButtonSelected,
            ]}
            onPress={() => setSettings(prev => ({ ...prev, sex: 'male' }))}
          >
            <Text
              style={[
                settingsStyles.settingsButtonText,
                settings.sex === 'male' && settingsStyles.settingsButtonTextSelected,
              ]}
            >
              {settings.language === 'english'? 'Man': 'Homme'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Preferred Language (english or french) */}
      <View style={settingsStyles.settingsBlock}>
          
          <Text style={settingsStyles.fieldLabel}>{settings.language === 'english'? 'You prefer': 'Tu préfères'}</Text>
          <View style={settingsStyles.settingsOptionContainer}>
            <TouchableOpacity
              style={[
                settingsStyles.settingsButton,
                settings.language === 'english' && settingsStyles.settingsButtonSelected,
              ]}
              onPress={() => setSettings(prev => ({ ...prev, language: 'english' }))}
            >
              <Text
                style={[
                  settingsStyles.settingsButtonText,
                  settings.language === 'english' && settingsStyles.settingsButtonTextSelected,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                settingsStyles.settingsButton,
                settings.language === 'french' && settingsStyles.settingsButtonSelected,
              ]}
              onPress={() => setSettings(prev => ({ ...prev, language: 'french' }))}
            >
              <Text
                style={[
                  settingsStyles.settingsButtonText,
                  settings.language === 'french' && settingsStyles.settingsButtonTextSelected,
                ]}
              >
                Français
              </Text>
            </TouchableOpacity>
          </View>
      </View>

      {/* Preferred Shinigami (default Rÿuk) */}
      <View style={settingsStyles.settingsBlock}>
        
        <Text style={settingsStyles.fieldLabel}>{settings.language === 'english'? 'Pick a Shinigami': 'Choisis un Shinigami'}</Text>
        <View style={settingsStyles.settingsOptionContainer}>
          <TouchableOpacity
            style={[
              settingsStyles.settingsButton,
              settings.shinigami === 'Rÿuk' && settingsStyles.settingsButtonSelected,
            ]}
            onPress={() => setSettings(prev => ({ ...prev, shinigami: 'Rÿuk' }))}
          >
            <Text
              style={[
                settingsStyles.settingsButtonText,
                settings.shinigami === 'Rÿuk' && settingsStyles.settingsButtonTextSelected,
              ]}
            >
              Rÿuk
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              settingsStyles.settingsButton,
              settings.shinigami === 'Rem' && settingsStyles.settingsButtonSelected,
            ]}
            onPress={() => setSettings(prev => ({ ...prev, shinigami: 'Rem' }))}
          >
            <Text
              style={[
                settingsStyles.settingsButtonText,
                settings.shinigami === 'Rem' && settingsStyles.settingsButtonTextSelected,
              ]}
            >
              Rem
            </Text>
          </TouchableOpacity>
        </View>

      </View>
      
      {/* Validation error message */}
      {errorMessage ? <Text style={settingsStyles.errorText}>{errorMessage}</Text> : null}

      {/* Button to confirm and save */}
      <TouchableOpacity onPress={saveSettings} style={settingsStyles.saveButton}>
        <Text style={settingsStyles.saveButtonText}>{settings.language === 'english'? 'Save': 'Enregistrer'}</Text>
      </TouchableOpacity>
    </View>
      );
};

