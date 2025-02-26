// sendNoteWithFormData.js

import * as FileSystem from 'expo-file-system';

/**
 * Sends a single note (with all items) to your backend using FormData.
 * 
 * For text items, we store them inside a "noteData" JSON field.
 * For media (image or audio), we append them as separate fields in FormData.
 * 
 * Your backend can parse the "noteData" field to understand item structure, 
 * and retrieve the uploaded files from the form fields.
 */
export async function sendNoteWithFormData(folderName, serverUrl) {
  try {
    // 1) Locate the note folder and read note.json
    const noteFolder = FileSystem.documentDirectory + `notes/${folderName}/`;
    const noteJsonPath = noteFolder + 'note.json';

    const noteJsonString = await FileSystem.readAsStringAsync(noteJsonPath);
    const items = JSON.parse(noteJsonString); // e.g. [{type:'text',text:'...'},{type:'image',uri:'...'}, ...]

    // We'll build two parts of our request:
    //  - A "noteData" object that has text items + placeholders for media
    //  - The actual media files appended to FormData

    // 2) Prepare a placeholder array for noteData
    //    We'll store text items fully, 
    //    but for media items, we'll store info except the actual file payload
    const noteData = {
      timestamp: folderName, // or parse as number
      items: [],
    };

    // 3) Create a FormData object
    const form = new FormData();

    // 4) Loop through items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type === 'text') {
        // No file needed; store in noteData as is
        noteData.items.push(item);
      } else if (item.type === 'image' || item.type === 'audio') {
        // We'll store a placeholder in noteData that references the file index
        // so the server can link them later
        const mediaPlaceholder = {
          type: item.type,
          // keep other props like duration:
          ...(item.duration ? { duration: item.duration } : {}),
          // We'll store "fieldName" to indicate which form field holds the file
          fieldName: `file_${i}`,
        };
        noteData.items.push(mediaPlaceholder);

        // Now append the actual file to FormData under that fieldName
        // React Native (via fetch) supports form-data file objects like:
        // { uri, type, name }
        let fileType = 'application/octet-stream';
        let fileName = `file_${i}`;

        if (item.type === 'image') {
          // you can parse extension from item.uri if you want
          fileType = 'image/jpeg'; 
          fileName += '.jpg'; 
        } else if (item.type === 'audio') {
          fileType = 'audio/m4a';
          fileName += '.m4a';
        }

        form.append(mediaPlaceholder.fieldName, {
          uri: item.uri,
          type: fileType,
          name: fileName,
        });
      }
    }

    // 5) Put the noteData (text + placeholders) as a JSON string in FormData
    form.append('noteData', JSON.stringify(noteData));

    // 6) POST the FormData to your backend
    const response = await fetch(serverUrl, {
      method: 'POST',
      // 'Content-Type' is automatically set to 'multipart/form-data'
      // including the correct boundary by whatwg-fetch in React Native
      headers: {
        // Typically, you do *not* manually set Content-Type 
        // when letting fetch handle FormData. 
      },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    const result = await response.json();
    // console.log('Note upload success:', result);
    return result;

  } catch (error) {
    console.warn('Error uploading note with FormData:', error);
    throw error;
  }
}

export default sendNoteWithFormData;