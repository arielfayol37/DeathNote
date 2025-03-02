import { StyleSheet } from 'react-native';

const settingsStyles = StyleSheet.create({
    userSettingsInputBox:{
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 50,
      },
      userSettingsLabel: {
        color: 'white',
        fontSize: 24,
        fontStyle: 'italic',
        fontWeight: 'bold',
      },
  
      settingsBlock:{
        width: '100%',
      },
      settingsOptionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginVertical: 8,
      },
      userNameInput:{
        borderColor: 'white',
        width: '80%',
        height: 50,
        borderWidth: 2,
        borderRadius: 8,
        color: 'white',
        fontSize: 20,
        paddingLeft: 10,
        
      },
      settingsButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 10,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#ccc',
      },
      settingsButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
      },
      fieldLabel:{
        color: 'white',
        fontSize: 16,
      },
      settingsButtonText: {
        fontSize: 25,
        color: '#333',
      },
      settingsButtonTextSelected: {
        color: 'white',
      },
  
      saveButton:{
        flexDirection: 'row',
        backgroundColor:'#007AFF',
        width: '95%',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 30,
      },
      saveButtonText:{
        color:'white',
        fontSize: 26,
      },
      errorText: {
        color: 'red',
        marginTop: 10,
        fontSize: 14,
      },
})
export default settingsStyles;