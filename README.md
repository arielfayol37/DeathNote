# DeathNote

DeathNote is a multimodal LLM-powered React Native mobile app for taking notes using text, images, and audio. The app summarizes your entries with witty commentary from your chosen Shinigami, and supports searching, organizing, and reviewing your notes.

---

## Features

- **Text, Image, and Audio Notes:** Add rich content to your notes.
- **AI Summaries:** Get amusing summaries from your Shinigami.
- **Multimodal Uploads:** Notes are sent to a backend that processes text, images, and audio.
- **Search & Organize:** Quickly find notes using semantic search.
- **Customizable Settings:** Choose your language and Shinigami.
- **Chat with Shinigami:** Interact for fun or advice.

---

## Frontend

The frontend is built with **React Native** and **Expo**. It provides a seamless mobile experience for note-taking and interacting with the AI.

### Main Components

- **Note Creation:** [`index.jsx`](frontend/app/(tabs)/index/index.jsx)  
  Users can create notes with text, images (camera/gallery), and audio recordings. Each note is stored locally and can be uploaded to the backend for AI processing.
- **Note List & Detail:** [`NodeList.jsx`](frontend/app/(tabs)/components/NodeList.jsx), [`NoteDetail.jsx`](frontend/app/(tabs)/components/NoteDetail.jsx)  
  Displays all notes, their summaries, and details. Summaries are fetched from the backend and stored locally.
- **Settings:** [`SettingsForm.jsx`](frontend/app/(tabs)/index/SettingsForm.jsx)  
  Lets users set their name, gender, preferred language, and Shinigami persona.
- **Chat:** [`AiChat.jsx`](frontend/app/(tabs)/components/AiChat.jsx)  
  Enables users to chat with their Shinigami, sending text, images, and audio messages.
- **Note Upload:** [`sendNoteToServer.js`](frontend/app/(tabs)/components/sendNoteToServer.js)  
  Handles sending notes and media to the backend using FormData.

### Data Flow

1. Notes are created and stored locally.
2. When a note is ready, it is uploaded to the backend with user settings and previous summaries.
3. The backend returns a summary and title, which are saved locally and displayed in the app.
4. Semantic search and chat features interact with backend endpoints for advanced AI functionality.

---

## Backend

The backend is built with **Django** and **Django REST Framework**. It powers all AI features, note management, and multimodal processing.

### Main Responsibilities

- **Note Storage & Processing:**  
  Receives notes (text, images, audio) via API, processes media (transcribes audio, describes images), and stores them.
- **AI Summarization:**  
  Uses a multimodal LLM (via OpenAI or Ollama) to generate summaries and witty commentary in the style of Ryük, referencing previous entries for context. See [`utils.py`](server/DeathNote/notes/utils.py) for prompt engineering and LLM calls.
- **Chat with Shinigami:**  
  Provides a conversational endpoint where the AI responds as Ryük, drawing from past summaries and user settings.
- **User Settings:**  
  Applies user preferences (name, gender, language, Shinigami persona) to personalize AI responses.

### Key Files

- [`views.py`](server/DeathNote/notes/views.py):  
  Main API endpoints for note upload, summarization, search, and chat.
- [`utils.py`](server/DeathNote/notes/utils.py):  
  Handles LLM prompts, media processing (audio/image), and chat logic.
- [`models.py`](server/DeathNote/notes/models.py):  
  Database models for notes and user data.
- [`serializers.py`](server/DeathNote/notes/serializers.py):  
  Serializes notes and responses for API communication.
- [`urls.py`](server/DeathNote/notes/urls.py):  
  API routing.

### API Endpoints

- `POST /api/notes/summarize/` — Upload a note and receive a summary.
- `POST /api/chat/` — Chat with your Shinigami.

#### Summarization Flow

1. The frontend sends note data, user settings, and previous summaries.
2. The backend processes media (transcribes audio, describes images).
3. All content is sent to the LLM with a custom prompt (see [`utils.py`](server/DeathNote/notes/utils.py)).
4. The LLM returns a title and summary, which are sent back to the frontend.

#### Chat Flow

1. The frontend sends chat messages, working memory (recent summaries), and user settings.
2. The backend uses a specialized prompt to generate Ryük-style responses, referencing past entries and maintaining persona.
---

## Getting Started

### Prerequisites

- Node.js
- Expo CLI
- Python 3 (for backend)
- Django & Django REST Framework
- LM Studio and/or Ollama to download and run the models.

### Setup

1. **Install frontend dependencies:**
   ```sh
   cd frontend
   npm install
   ```

2. **Start the frontend app:**
   ```sh
   npx expo start
   ```

3. **Install backend dependencies:**
   ```sh
   cd server/DeathNote
   pip install -r requirements.txt
   ```

4. **Run Django server:**
   ```sh
   python manage.py runserver
   ```

---

## Project Structure

```
frontend/
  app/
    (tabs)/
      index/
      components/
      constants/
      hooks/
      assets/
server/
  DeathNote/
    notes/
      views.py
      utils.py
      urls.py
```
