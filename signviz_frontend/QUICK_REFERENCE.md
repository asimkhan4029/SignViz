# Library System - Quick Reference

## Import & Setup

```javascript
// In any component
import { useLibrary } from '../context/LibraryContext';

function MyComponent() {
  const {
    library,           // { videos: [], playlists: [] }
    isLoading,         // boolean
    saveVideo,         // function
    deleteVideo,       // function
    createPlaylist,    // function
    deletePlaylist,    // function
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistVideos,
    getVideoById,
    getRecentVideos,
    updatePlaylist,
  } = useLibrary();
}
```

## Common Operations

### Save a Video
```javascript
const { saveVideo } = useLibrary();

const savedVideo = saveVideo({
  title: "My Video",
  videoUrl: "https://youtube.com/watch?v=...",
  source_type: "youtube",
  youtube_id: "dQw4w9WgXcQ",
  animationData: ["hello", "world"],
  thumbnail: null,
  duration: 300
});

console.log(savedVideo.id); // Use this ID to reference the video
```

### Create a Playlist
```javascript
const { createPlaylist } = useLibrary();

const playlist = createPlaylist("My Playlist", "Optional description");
console.log(playlist.id);
```

### Add Video to Playlist
```javascript
const { addVideoToPlaylist } = useLibrary();

addVideoToPlaylist(playlistId, videoId);
```

### Get Videos in Playlist
```javascript
const { getPlaylistVideos } = useLibrary();

const videos = getPlaylistVideos(playlistId);
// Returns: [{ id, title, videoUrl, animationData, ... }]
```

### Get Single Video
```javascript
const { getVideoById } = useLibrary();

const video = getVideoById(videoId);
// Use video.animationData to play saved animation
```

### Delete Video
```javascript
const { deleteVideo } = useLibrary();

deleteVideo(videoId);
// Automatically removed from all playlists
```

### Delete Playlist
```javascript
const { deletePlaylist } = useLibrary();

deletePlaylist(playlistId);
// Videos remain in library
```

### Remove Video from Playlist
```javascript
const { removeVideoFromPlaylist } = useLibrary();

removeVideoFromPlaylist(playlistId, videoId);
// Video remains in library
```

### Get Recent Videos
```javascript
const { getRecentVideos } = useLibrary();

const recent = getRecentVideos(10); // Last 10 videos
```

### Update Playlist
```javascript
const { updatePlaylist } = useLibrary();

updatePlaylist(playlistId, {
  name: "New Name",
  description: "New description"
});
```

## Data Structures

### Video Object
```javascript
{
  id: "video_1234567890_abc123",
  title: "Biology 101",
  videoUrl: "https://youtube.com/watch?v=...",
  source_type: "youtube",        // or "local"
  youtube_id: "dQw4w9WgXcQ",     // null if local
  animationData: ["hello", "world"],
  thumbnail: null,
  duration: 600,
  createdAt: "2024-04-29T10:30:00Z",
  saved_at: "4/29/2024"
}
```

### Playlist Object
```javascript
{
  id: "playlist_1234567890_abc123",
  name: "Biology Fundamentals",
  description: "Basic concepts",
  videoIds: ["video_1234567890_abc123"],
  createdAt: "2024-04-29T10:30:00Z"
}
```

### Library State
```javascript
{
  videos: [/* array of video objects */],
  playlists: [/* array of playlist objects */]
}
```

## localStorage

**Key**: `signviz_library`

**Access directly** (for debugging):
```javascript
// Read
const library = JSON.parse(localStorage.getItem('signviz_library'));

// Clear
localStorage.removeItem('signviz_library');

// Check size
const size = new Blob([localStorage.getItem('signviz_library')]).size;
console.log(`Library size: ${(size / 1024).toFixed(2)} KB`);
```

## Common Patterns

### Display All Videos
```javascript
const { library } = useLibrary();

return (
  <div>
    {library.videos.length === 0 ? (
      <p>No videos yet</p>
    ) : (
      library.videos.map(video => (
        <div key={video.id}>{video.title}</div>
      ))
    )}
  </div>
);
```

### Display Playlist Videos
```javascript
const { getPlaylistVideos } = useLibrary();

const videos = getPlaylistVideos(playlistId);

return (
  <div>
    {videos.map(video => (
      <div key={video.id}>{video.title}</div>
    ))}
  </div>
);
```

### Handle Drag-Drop
```javascript
const { addVideoToPlaylist } = useLibrary();
const dragItem = useRef(null);

const handleDragStart = (e, video) => {
  dragItem.current = video;
};

const handleDrop = (e, playlist) => {
  e.preventDefault();
  const video = dragItem.current;
  addVideoToPlaylist(playlist.id, video.id);
};
```

### Save with Error Handling
```javascript
const { saveVideo } = useLibrary();

try {
  const saved = saveVideo(videoData);
  showToast("Video saved!");
} catch (err) {
  if (err.message.includes('quota')) {
    showToast("Storage full. Delete some videos.", 'error');
  } else {
    showToast("Failed to save", 'error');
  }
}
```

## Debugging

### Check Library State
```javascript
const { library } = useLibrary();
console.log('Videos:', library.videos);
console.log('Playlists:', library.playlists);
```

### Check localStorage
```javascript
const stored = localStorage.getItem('signviz_library');
console.log(JSON.parse(stored));
```

### Clear All Data
```javascript
localStorage.removeItem('signviz_library');
window.location.reload();
```

### Check Video Animation Data
```javascript
const { getVideoById } = useLibrary();
const video = getVideoById(videoId);
console.log('Animation:', video.animationData);
```

## Performance Tips

1. **Avoid unnecessary renders**:
   ```javascript
   const { library } = useLibrary();
   // Only access what you need
   const videos = library.videos;
   ```

2. **Use callbacks for event handlers**:
   ```javascript
   const handleDelete = useCallback((id) => {
     deleteVideo(id);
   }, [deleteVideo]);
   ```

3. **Memoize components**:
   ```javascript
   const VideoCard = memo(({ video }) => (
     <div>{video.title}</div>
   ));
   ```

4. **Lazy load playlists**:
   ```javascript
   const [playlistVideos, setPlaylistVideos] = useState([]);
   
   const handleOpenPlaylist = (playlist) => {
     const videos = getPlaylistVideos(playlist.id);
     setPlaylistVideos(videos);
   };
   ```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Storage quota exceeded" | localStorage full | Delete old videos |
| "Video not found" | Invalid video ID | Check ID format |
| "Playlist not found" | Invalid playlist ID | Verify playlist exists |
| "useLibrary must be used within LibraryProvider" | Missing provider | Wrap app with LibraryProvider |

## File Locations

```
src/
├── context/
│   └── LibraryContext.jsx          ← State management
├── pages/
│   ├── Upload.jsx                  ← Save videos
│   ├── Library.jsx                 ← Manage library
│   └── Learning.jsx                ← Watch videos
└── App.jsx                         ← Provider wrapper
```

## Testing Checklist

- [ ] Save video with animation
- [ ] Refresh page → video persists
- [ ] Create playlist
- [ ] Add video to playlist
- [ ] Drag video to playlist
- [ ] Remove video from playlist
- [ ] Delete playlist
- [ ] Delete video
- [ ] Open saved video
- [ ] Animation plays without regeneration
- [ ] Empty library shows correct state
- [ ] Multiple videos work correctly
- [ ] Multiple playlists work correctly

## Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint

# Format code
npm run format
```

## Browser DevTools

**Check localStorage**:
1. Open DevTools (F12)
2. Go to Application → Storage → localStorage
3. Find `signviz_library` key
4. View/edit JSON data

**Monitor state changes**:
```javascript
// In console
setInterval(() => {
  const lib = JSON.parse(localStorage.getItem('signviz_library'));
  console.log('Current library:', lib);
}, 1000);
```

---

**Quick Links**:
- [Full Documentation](./LIBRARY_SYSTEM.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [GitHub Issues](https://github.com/signviz/signviz/issues)

**Last Updated**: April 29, 2024
