import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LibraryContext = createContext();

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
};

const STORAGE_KEY = 'signviz_library';

const defaultState = {
  videos: [],
  playlists: [],
};

export const LibraryProvider = ({ children }) => {
  const [library, setLibrary] = useState(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const loadLibrary = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setLibrary(parsed);
        }
      } catch (err) {
        console.error('Failed to load library from storage:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLibrary();
  }, []);

  // Save to localStorage whenever library changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
      } catch (err) {
        console.error('Failed to save library to storage:', err);
      }
    }
  }, [library, isLoading]);

  // Save video to library
  const saveVideo = useCallback((videoData) => {
    const newVideo = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: videoData.title || 'Untitled Video',
      videoUrl: videoData.videoUrl,
      source_type: videoData.source_type || 'local',
      youtube_id: videoData.youtube_id || null,
      animationData: videoData.animationData || [], // original spoken words (for display)
      wordPairs: videoData.wordPairs || [],          // {original, animation}[] for playback
      thumbnail: videoData.thumbnail || null,
      duration: videoData.duration || 0,
      createdAt: new Date().toISOString(),
      saved_at: new Date().toLocaleDateString(),
    };

    setLibrary((prev) => ({
      ...prev,
      videos: [newVideo, ...prev.videos],
    }));

    return newVideo;
  }, []);

  // Delete video from library
  const deleteVideo = useCallback((videoId) => {
    setLibrary((prev) => ({
      ...prev,
      videos: prev.videos.filter((v) => v.id !== videoId),
      // Also remove from all playlists
      playlists: prev.playlists.map((p) => ({
        ...p,
        videoIds: p.videoIds.filter((id) => id !== videoId),
      })),
    }));
  }, []);

  // Create playlist
  const createPlaylist = useCallback((name, description = '') => {
    const newPlaylist = {
      id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      videoIds: [],
      createdAt: new Date().toISOString(),
    };

    setLibrary((prev) => ({
      ...prev,
      playlists: [newPlaylist, ...prev.playlists],
    }));

    return newPlaylist;
  }, []);

  // Delete playlist
  const deletePlaylist = useCallback((playlistId) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.filter((p) => p.id !== playlistId),
    }));
  }, []);

  // Add video to playlist
  const addVideoToPlaylist = useCallback((playlistId, videoId) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id === playlistId) {
          // Avoid duplicates
          if (!p.videoIds.includes(videoId)) {
            return {
              ...p,
              videoIds: [...p.videoIds, videoId],
            };
          }
        }
        return p;
      }),
    }));
  }, []);

  // Remove video from playlist
  const removeVideoFromPlaylist = useCallback((playlistId, videoId) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id === playlistId) {
          return {
            ...p,
            videoIds: p.videoIds.filter((id) => id !== videoId),
          };
        }
        return p;
      }),
    }));
  }, []);

  // Get videos in playlist
  const getPlaylistVideos = useCallback(
    (playlistId) => {
      const playlist = library.playlists.find((p) => p.id === playlistId);
      if (!playlist) return [];

      return playlist.videoIds
        .map((videoId) => library.videos.find((v) => v.id === videoId))
        .filter(Boolean);
    },
    [library]
  );

  // Get video by ID
  const getVideoById = useCallback(
    (videoId) => {
      return library.videos.find((v) => v.id === videoId);
    },
    [library]
  );

  // Get recent videos
  const getRecentVideos = useCallback(
    (limit = 10) => {
      return library.videos.slice(0, limit);
    },
    [library]
  );

  // Update playlist
  const updatePlaylist = useCallback((playlistId, updates) => {
    setLibrary((prev) => ({
      ...prev,
      playlists: prev.playlists.map((p) => {
        if (p.id === playlistId) {
          return { ...p, ...updates };
        }
        return p;
      }),
    }));
  }, []);

  const value = {
    library,
    isLoading,
    saveVideo,
    deleteVideo,
    createPlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistVideos,
    getVideoById,
    getRecentVideos,
    updatePlaylist,
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
};

export default LibraryContext;
