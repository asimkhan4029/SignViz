import React, { useState } from 'react';
import VideoUpload from './components/VideoUpload';
import VideoPlayer from './components/VideoPlayer';

function App() {
  const [words, setWords] = useState([]);
  const [rawText, setRawText] = useState('');
  const [originalVideoSrc, setOriginalVideoSrc] = useState(null);
  const [originalVideoType, setOriginalVideoType] = useState('file'); // 'file' | 'youtube'

  const handleKeywordsExtracted = (extractedWords, originalText, videoSrc, videoType) => {
    setWords(extractedWords);
    setRawText(originalText);
    setOriginalVideoSrc(videoSrc || null);
    setOriginalVideoType(videoType || 'file');
  };

  return (
    <div className="container">
      <header>
        <h1>SignViz</h1>
        <p>Speech to Sign Language Animation Converter</p>
      </header>

      <div className="app-grid">
        <div>
          <VideoUpload onKeywordsExtracted={handleKeywordsExtracted} />

          {rawText && (
            <div className="glass-panel" style={{marginTop: '2rem'}}>
              <h3 style={{marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Original Text:</h3>
              <div className="text-preview" style={{maxHeight:'200px'}}>
                {rawText}
              </div>
            </div>
          )}
        </div>

        <div>
          <VideoPlayer
            words={words}
            rawText={rawText}
            originalVideoSrc={originalVideoSrc}
            originalVideoType={originalVideoType}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
