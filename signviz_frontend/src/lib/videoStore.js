/**
 * videoStore.js
 * =============
 * In-memory store for local video files.
 * Survives React navigation (component unmount/remount) but not page reload.
 * 
 * Usage:
 *   import { storeVideo, getVideoUrl, revokeVideo } from './videoStore';
 * 
 *   // When saving:
 *   const id = storeVideo(file);          // returns a stable ID
 * 
 *   // When playing:
 *   const url = getVideoUrl(id);          // returns blob: URL or null
 * 
 *   // On cleanup:
 *   revokeVideo(id);
 */

const _store = new Map(); // id -> { file, blobUrl }

export function storeVideo(file) {
  // Use filename + size + lastModified as a stable key
  const id = `local_${file.name}_${file.size}_${file.lastModified}`;
  if (!_store.has(id)) {
    const blobUrl = URL.createObjectURL(file);
    _store.set(id, { file, blobUrl });
  }
  return id;
}

export function getVideoUrl(id) {
  if (!id) return null;
  const entry = _store.get(id);
  if (!entry) return null;
  // Recreate blob URL if it was revoked
  if (!entry.blobUrl) {
    entry.blobUrl = URL.createObjectURL(entry.file);
  }
  return entry.blobUrl;
}

export function revokeVideo(id) {
  const entry = _store.get(id);
  if (entry?.blobUrl) {
    URL.revokeObjectURL(entry.blobUrl);
    entry.blobUrl = null;
  }
}

export function hasVideo(id) {
  return _store.has(id);
}
