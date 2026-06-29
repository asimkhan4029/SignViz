# SignViz Library Management System

## Overview

The library management system enables users to save interpreted videos with their generated ASL animations, organize them into playlists, and reuse animations without regeneration.

## Architecture

### 1. LibraryContext (`src/context/LibraryContext.jsx`)

Global state management using React Context API with localStorage persistence.

**Key Features:**
- Automatic localStorage sync
- No default/mock data (empty on first load)
- Unique ID generation for videos and playlists
- Efficient data structure with video IDs in playlists (no duplication)

**Data Structure:**
```javascript
{
  videos: [
    {
      id: "video_1234567890_abc123",
      title: "Biology 101",
      videoUrl: "https://youtube.com/watch?v=...",
      source_type: "youtube", // or "local"
      youtube_id: "dQw4w9WgXcQ",
      animationData: ["hello", "world", "how", "are", "you"],
      thumbnail: null,
      duration: 600,
      createdAt: "2024-04-29T10:30:00Z",
      saved_at: "4/29/2024"
    }
  ],
  playlists: [
    {
      id: "playlist_1234567890_abc123",
      name: "Biology Fundamentals",
      description: "Basic biology concepts",
      videoIds: ["video_1234567890_abc123"],
      createdAt: "2024-04-29T10:30:00Z"
    }
  ]
}
```

### 2. Upload.jsx Integration

**Save Flow:**
1. User uploads video and generates interpretation
2. Clicks "Save to Library"
3. `handleSaveToLibrary()` calls `saveVideo()` from LibraryContext
4. Video data (including animationData) is stored in localStorage
5. Optional backend sync for persistence
6. UI shows success feedback

**Key Changes:**
- Added `useLibrary()` hook
- Separated local save from backend sync
- Animation data stored as array of sign words
- Loading state during save operation

### 3. Library.jsx Redesign

**Features:**
- Empty state when no videos/playlists exist
- Drag-and-drop videos into playlists
- Create/delete playlists dynamically
- Remove videos from library or playlists
- Real-time UI updates

**Sections:**
- **My Playlists**: Create and manage playlists
- **Recently Saved**: All saved videos with metadata

### 4. Learning.jsx (Watch Page)

**Functionality:**
- Load saved video by ID from LibraryContext
- Display original video (YouTube or local)
- Play saved ASL animation without regeneration
- Show all signs in the interpretation
- Sync play/pause between video and avatar

## Data Persistence

### localStorage Strategy

**Key:** `signviz_library`

**Advantages:**
- No backend required for MVP
- Instant persistence
- Works offline
- ~5-10MB storage per domain

**Limitations:**
- Per-browser storage (not synced across devices)
- Can be cleared by user
- Size limits on large libraries

**Future Enhancement:**
- Sync with backend API
- Cloud storage for animations
- Cross-device sync

## API Integration (Optional)

If backend is available, the system can sync:

```javascript
// POST /api/save-video/
{
  video_id: "...",
  title: "...",
  video_url: "...",
  source_type: "youtube|local",
  youtube_id: "...",
  avatar_data: ["word1", "word2"],
  category: "YouTube|Upload"
}

// GET /api/recents/
// Returns: { recents: [...] }

// POST /api/create-playlist/
{
  name: "...",
  description: "..."
}

// POST /api/add-to-playlist/
{
  playlist_id: "...",
  item_id: "..."
}
```

## Usage Examples

### Save a Video

```javascript
import { useLibrary } from '../context/LibraryContext';

function MyComponent() {
  const { saveVideo } = useLibrary();

  const handleSave = () => {
    const videoData = {
      title: "My Video",
      videoUrl: "https://youtube.com/watch?v=...",
      source_type: "youtube",
      youtube_id: "dQw4w9WgXcQ",
      animationData: ["hello", "world"],
      thumbnail: null,
      duration: 300
    };
    
    const savedVideo = saveVideo(videoData);
    console.log("Saved:", savedVideo.id);
  };

  return <button onClick={handleSave}>Save</button>;
}
```

### Create a Playlist

```javascript
const { createPlaylist } = useLibrary();

const newPlaylist = createPlaylist("My Playlist", "Description");
console.log("Created:", newPlaylist.id);
```

### Add Video to Playlist

```javascript
const { addVideoToPlaylist } = useLibrary();

addVideoToPlaylist(playlistId, videoId);
```

### Get Playlist Videos

```javascript
const { getPlaylistVideos } = useLibrary();

const videos = getPlaylistVideos(playlistId);
```

### Load Saved Video

```javascript
const { getVideoById } = useLibrary();

const video = getVideoById(videoId);
// video.animationData contains saved signs
```

## State Management Flow

```
Upload Page
    ↓
User clicks "Save"
    ↓
saveVideo() → LibraryContext
    ↓
localStorage updated
    ↓
Library Page
    ↓
useLibrary() reads from localStorage
    ↓
Display videos & playlists
    ↓
Drag-drop → addVideoToPlaylist()
    ↓
localStorage updated
    ↓
Learning Page
    ↓
getVideoById() → Load animation
    ↓
Play saved animation (no regeneration)
```

## Performance Optimizations

1. **Lazy Loading**: Videos loaded only when needed
2. **Memoization**: useCallback for event handlers
3. **Efficient Updates**: Only affected state updated
4. **No Re-renders**: Proper dependency arrays
5. **Animation Caching**: Stored as array of words (minimal size)

## Error Handling

- localStorage quota exceeded → Show error toast
- Missing animation data → Show empty state
- Invalid video ID → Redirect to library
- Network errors → Graceful fallback to local data

## Testing Checklist

- [ ] Save video with animation data
- [ ] Verify localStorage contains video
- [ ] Refresh page → Video still appears
- [ ] Create playlist
- [ ] Drag video into playlist
- [ ] Remove video from playlist
- [ ] Delete playlist
- [ ] Open saved video → Animation plays
- [ ] Animation doesn't regenerate
- [ ] Empty library shows correct state
- [ ] Multiple videos in library
- [ ] Multiple playlists with videos

## Future Enhancements

1. **Backend Sync**: Save to database
2. **Cloud Storage**: Store animations in cloud
3. **Sharing**: Share playlists with others
4. **Collaboration**: Multiple users editing playlists
5. **Search**: Find videos by title/tags
6. **Filtering**: Filter by date, source, duration
7. **Export**: Download videos with animations
8. **Analytics**: Track most-watched videos

## Troubleshooting

**Videos not saving:**
- Check localStorage quota
- Verify animationData is array
- Check browser console for errors

**Animations not playing:**
- Verify animationData exists
- Check /static/ folder has sign videos
- Verify video ID format

**Playlists not persisting:**
- Check localStorage key: `signviz_library`
- Verify browser allows localStorage
- Check for quota exceeded errors

**Drag-drop not working:**
- Verify draggable={true} on VideoCard
- Check onDrop handler
- Verify playlist accepts drops

## File Structure

```
src/
├── context/
│   └── LibraryContext.jsx          # Global state management
├── pages/
│   ├── Upload.jsx                  # Save videos
│   ├── Library.jsx                 # Manage library & playlists
│   └── Learning.jsx                # Watch saved videos
└── App.jsx                         # LibraryProvider wrapper
```

## Dependencies

- React 18+
- React Router v6+
- Lucide React (icons)
- Tailwind CSS

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- localStorage: Required

---

**Last Updated:** April 29, 2024
**Version:** 1.0.0
