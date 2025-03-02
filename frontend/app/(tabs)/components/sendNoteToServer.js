// sendNoteWithFormData.js

import * as FileSystem from 'expo-file-system';

/**
 * Sends a single note (with all items) to your backend using FormData.
 * 
 * For text items, we store them inside a "noteData" JSON field.
 * For media (image or audio), we append them as separate fields in FormData.
 * 
 * @param {string} folderName - The name of the folder (usually the timestamp).
 * @param {string} serverUrl - The endpoint to which we're sending the note data.
 * @param {object} settings - Any extra settings/context needed for the request.
 * @param {Array} previousSummaries - Up to 100 older summaries (oldest→newest), 
 *    each with shape: { summary: string, formattedTimestamp: string }
 */
export async function sendNoteWithFormData(
  folderName,
  serverUrl,
  settings,
  previousSummaries = []
) {
  try {
    // 1) Locate the note folder and read note.json
    const noteFolder = FileSystem.documentDirectory + `notes/${folderName}/`;
    const noteJsonPath = noteFolder + 'note.json';

    const noteJsonString = await FileSystem.readAsStringAsync(noteJsonPath);
    const items = JSON.parse(noteJsonString); 
    // Example structure: 
    //  [{ type:'text', text:'...' }, { type:'image', uri:'...' }, ...]

    // 2) Prepare a placeholder for noteData with text items + placeholders for media
    const noteData = {
      timestamp: folderName, // or parseInt(folderName) if preferred
      items: [],
    };

    // 3) Create a FormData object
    const form = new FormData();

    // 4) Loop through items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.type === 'text') {
        // No file needed; store as-is
        noteData.items.push(item);

      } else if (item.type === 'image' || item.type === 'audio') {
        // Store a placeholder in noteData (the actual file is appended below)
        const mediaPlaceholder = {
          type: item.type,
          // keep other props like duration:
          ...(item.duration ? { duration: item.duration } : {}),
          // We'll store "fieldName" to indicate which form field holds the file
          fieldName: `file_${i}`,
        };
        noteData.items.push(mediaPlaceholder);

        // Append the actual file in FormData
        let fileType = 'application/octet-stream';
        let fileName = `file_${i}`;

        if (item.type === 'image') {
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

    // 5) Add noteData, settings, and previousSummaries to FormData
    form.append('noteData', JSON.stringify(noteData));
    form.append('settings', JSON.stringify(settings));
    form.append('previousSummaries', JSON.stringify(previousSummaries));

    // 6) POST the FormData to your backend
    const response = await fetch(serverUrl, {
      method: 'POST',
      // 'Content-Type' is automatically set to 'multipart/form-data'
      // including the correct boundary by whatwg-fetch in React Native
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.warn('Error uploading note with FormData:', error);
    throw error;
  }
}
