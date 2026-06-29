# SignViz Project Documentation

SignViz is a comprehensive web-based platform designed to bridge the communication gap for the deaf and hard-of-hearing community. It leverages Natural Language Processing (NLP) and Computer Vision to convert spoken or written language into Sign Language animations (Avatar animations).

---

## 1. Frontend Overview

The frontend is built using **React** (initialized with Vite) and provides a modern, responsive user interface for interacting with the SignViz services.

### Key Features

- **Dashboard**: A centralized hub for user activity, recent conversions, and quick actions.
- **Upload & Process**: Interface for users to submit text, upload local videos, or provide YouTube links for sign language translation.
- **Library**: A personal repository where users can save their processed videos, categorized by courses or topics.
- **Playlists**: Allows users to organize their saved sign language translations into custom playlists for sequential learning.
- **Learning Module**: A dedicated space for educational content and sign language practice.
- **User Profile & Settings**: Management of user credentials, profile pictures, and application preferences.

### Technology Stack

- **Framework**: React.js
- **State Management**: React Context API (for Authentication and User state)
- **Styling**: Vanilla CSS (Modern design patterns, glassmorphism, responsive layouts)
- **Routing**: React Router DOM
- **API Communication**: Axios (for interacting with the Django backend)

---

## 2. Backend Flow (Detailed)

The backend is the core engine of SignViz, built with the **Django** framework. It handles complex tasks such as NLP processing, speech-to-text conversion, and background removal from videos.

### A. Authentication & User Management

SignViz uses a custom user model `DeafUser` extending Django's `AbstractUser`. It supports standard signup, login, and logout flows, with additional fields for profile information and avatars. Authentication is session-based, with CSRF protection for API security.

### B. NLP & Text-to-Sign Pipeline

This is the "Brain" of the system. When text is submitted (either directly or via speech-to-text), it goes through the following pipeline in `views.py`:

1. **Tokenization**: The input sentence is broken down into individual words using `nltk.word_tokenize`.
2. **POS Tagging**: Each word is assigned a Part-of-Speech tag (e.g., Noun, Verb, Modal) using `nltk.pos_tag`.
3. **Tense Detection**: The system identifies if the sentence is in the Past, Present, or Future based on the POS tags (e.g., `MD` for future, `VBD` for past).
4. **Lemmatization & Filtering**:
   - Stop words (common words like 'is', 'the', 'are') are removed.
   - Remaining words are lemmatized (converted to base form) using `WordNetLemmatizer`.
   - Specific mappings are applied (e.g., "I" is converted to "ME" to match sign language conventions).
5. **Tense Mapping**: Since Sign Language often uses temporal markers instead of verb conjugations, the system adds specific prefix words:
   - **Past**: Adds "Before" at the start.
   - **Future**: Adds "Will" at the start.
   - **Present Continuous**: Adds "Now" at the start.
6. **Video Resolution**:
   - The system searches for a pre-recorded `.mp4` file for each word in the static assets.
   - **Fallback**: If a full word video is not found, the word is split into individual letters, and the system retrieves the corresponding sign for each letter (Finger-spelling).

### C. Speech-to-Sign Flow

When a user uploads a video or provides a YouTube link:

1. **Audio Extraction**: Uses `moviepy` to extract the audio track and save it as a `.wav` file.
2. **Speech Recognition**: Uses the `speech_recognition` library (interfacing with Google Speech API) to convert the audio into text.
3. **Text Conversion**: The extracted text is then passed through the **NLP Pipeline** described above to generate the sign language sequence.

### D. Background Removal Engine

To provide a clean, focused view of the signer, SignViz includes a background removal feature:

- **Engine**: Powered by `rembg` (using the `u2net_human_seg` model).
- **Process**: The system processes the ASL video frame-by-frame, removing the background and compositing the signer onto a dark, consistent background (`#17110d`).
- **Optimization**: Processed videos are cached in a temporary directory to avoid redundant heavy computation.

### E. Data Persistence & Models

- **Video**: Stores metadata about uploaded/linked videos (Title, Source, URL, Owner).
- **Conversion**: Tracks the status of processing (Processing, Completed, Failed) and stores the resulting ASL word sequence.
- **Library & LibraryItem**: Manages the user's saved content, including custom categories and "avatar data" (the sequence of sign videos).
- **Playlist & PlaylistVideo**: Allows grouping of library items into sequences.

---

## 3. API Endpoints Summary

### Processing

- `POST /api/process_text`: Converts raw text into a list of sign video names.
- `POST /api/process_video`: Handles local video uploads, extracts speech, and returns signs.
- `POST /api/process_youtube`: Downloads YouTube audio, converts to speech, and returns signs.
- `GET /api/remove_bg?word=...`: Returns a video stream with the background removed for a specific sign word.

### Authentication

- `POST /api/signup`: User registration.
- `POST /api/login`: User authentication.
- `GET /api/user`: Retrieves current user details.

### Library & Playlists

- `GET /api/library`: Lists all items in the user's library.
- `POST /api/save-video/`: Saves a conversion result to the library.
- `GET /api/playlists/`: Retrieves user's playlists.
- `POST /api/create-playlist/`: Creates a new playlist container.

---

## 4. System Requirements & Dependencies

- **Backend**: Python 3.x, Django 4.x
- **Core Libraries**:
  - `nltk`: NLP processing (Tokenization, POS tagging).
  - `moviepy`: Video/Audio manipulation.
  - `speech_recognition`: Audio to text conversion.
  - `rembg`: AI-based background removal.
  - `pytubefix`: YouTube video handling.
  - `opencv-python`: Frame manipulation for background removal.
- **Database**: SQLite (default/development) or PostgreSQL (production).
- **Frontend**: Node.js, Vite, React.
