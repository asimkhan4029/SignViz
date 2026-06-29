import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Video, Link as LinkIcon, PlayCircle } from 'lucide-react';
import axios from 'axios';

const VideoUpload = ({ onKeywordsExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    
    // Check if it's a video file
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please upload a valid video file (e.g. .mp4, .webm)');
      return;
    }

    setFile(selectedFile);
    setError('');
    setLoading(true);

    // Create a local object URL so the original video can be previewed
    const objectUrl = URL.createObjectURL(selectedFile);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      
      // Call Django API to process the video
      const response = await axios.post('/api/process_video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.words) {
        onKeywordsExtracted(response.data.words, response.data.text, objectUrl, 'file');
      } else {
        setError('Failed to extract keywords');
        URL.revokeObjectURL(objectUrl);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error communicating with the processing server.');
      URL.revokeObjectURL(objectUrl);
    } finally {
      setLoading(false);
    }
  };

  const processYoutubeUrl = async () => {
    if (!youtubeUrl) return;
    
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/process_youtube', {
        url: youtubeUrl
      });

      if (response.data && response.data.words) {
        onKeywordsExtracted(response.data.words, response.data.text, youtubeUrl, 'youtube');
      } else {
        setError('Failed to extract keywords');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error processing YouTube URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="glass-panel">
      <h2>Provide Video</h2>
      <p className="upload-subtext" style={{marginBottom: '1.5rem'}}>
        Upload a video or provide a YouTube link. The audio will be transcribed, simplified, and translated to sign language animations.
      </p>

      <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem'}}>
        <button 
          onClick={() => setActiveTab('upload')} 
          style={{
            flex: 1, 
            padding: '0.75rem', 
            background: activeTab === 'upload' ? 'var(--primary)' : 'transparent',
            border: activeTab === 'upload' ? 'none' : '1px solid var(--border)',
            color: activeTab === 'upload' ? 'white' : 'var(--text)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
          <UploadCloud size={18} /> File Upload
        </button>
        <button 
          onClick={() => setActiveTab('youtube')}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: activeTab === 'youtube' ? '#ef4444' : 'transparent',
            border: activeTab === 'youtube' ? 'none' : '1px solid var(--border)',
            color: activeTab === 'youtube' ? 'white' : 'var(--text)',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
          <PlayCircle size={18} /> YouTube Link
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div 
          className={`upload-area ${isDragging ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="video/*" 
          onChange={handleChange} 
          style={{display: 'none'}}
        />

        {loading ? (
          <div>
            <div className="loader"></div>
            <p style={{marginTop: '1rem'}}>Extracting audio and processing...</p>
          </div>
        ) : file && !error ? (
          <div>
            <CheckCircle className="upload-icon" size={48} color="#10b981" />
            <div className="upload-text">{file.name}</div>
            <p className="upload-subtext">Click or drag to replace file</p>
          </div>
        ) : (
          <div>
            <Video className="upload-icon" size={48} />
            <div className="upload-text">Drag & Drop your video file</div>
            <p className="upload-subtext">or click to browse from your computer</p>
          </div>
        )}
      </div>
      ) : (
        <div className="youtube-input-area" style={{padding: '2rem', background: 'var(--panel-bg-hover)', borderRadius: '1rem', border: '1px dashed var(--border)', textAlign: 'center'}}>
          {loading ? (
            <div>
              <div className="loader"></div>
              <p style={{marginTop: '1rem'}}>Downloading and processing YouTube video...</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
              <LinkIcon size={48} color="var(--primary)" />
              <input
                type="text"
                placeholder="Paste YouTube Link Here"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-dark)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              <button 
                onClick={processYoutubeUrl}
                disabled={!youtubeUrl}
                style={{
                  padding: '0.75rem 2rem',
                  background: youtubeUrl ? 'var(--primary)' : 'var(--border)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: youtubeUrl ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}>
                Process Link
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{color: '#ef4444', marginTop: '1rem', textAlign: 'center'}}>
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
