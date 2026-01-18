import { useState } from 'react';
import { useWav2Lip } from '../../hooks/useWav2Lip';

/**
 * Demo component to test Wav2Lip integration
 * This shows how it will work when Fish Audio is integrated
 */
export default function Wav2LipDemo({ character }) {
  const { generate, videoUrl, isGenerating, error, backendAvailable } = useWav2Lip();
  const [audioFile, setAudioFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!audioFile) {
      alert('Please select an audio file first');
      return;
    }

    try {
      await generate(character.id, audioFile);
    } catch (err) {
      console.error('Failed to generate:', err);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '10px', marginTop: '20px' }}>
      <h3>🎬 Wav2Lip Demo</h3>

      {!backendAvailable && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          ⚠️ Backend not available. Make sure it's running on port 8000.
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <label>
          Upload audio file (wav, mp3):
          <input type="file" accept="audio/*" onChange={handleFileSelect} />
        </label>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !audioFile || !backendAvailable}
        style={{
          padding: '10px 20px',
          backgroundColor: isGenerating ? '#ccc' : '#7C4DFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate Lip-Sync Video'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {error}
        </div>
      )}

      {videoUrl && (
        <div style={{ marginTop: '20px' }}>
          <h4>✅ Generated Video:</h4>
          <video
            src={videoUrl}
            controls
            autoPlay
            style={{
              width: '100%',
              maxWidth: '400px',
              borderRadius: '10px',
            }}
          />
        </div>
      )}
    </div>
  );
}
