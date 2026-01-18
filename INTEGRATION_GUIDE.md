# Wav2Lip Integration Guide

This guide explains how to use the Wav2Lip integration in your BuddyTalk app.

## Architecture

```
┌─────────────────┐         HTTP/REST          ┌──────────────────┐
│   React App     │  ◄────────────────────►    │  Python Backend  │
│  (Port 5173)    │                             │   (Port 8000)    │
│                 │  POST /api/generate-lipsync │                  │
│  - Upload video │  ─────────────────────►     │   - Wav2Lip      │
│  - Upload audio │                             │   - FastAPI      │
│  - Get result   │  ◄─────────────────────     │   - Video proc.  │
└─────────────────┘                             └──────────────────┘
```

## Setup Steps

### 1. Backend Setup

```bash
cd wav2lip-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Clone Wav2Lip
git clone https://github.com/Rudrabha/Wav2Lip.git
cd Wav2Lip && pip install -r requirements.txt && cd ..

# Download model (see wav2lip-backend/models/README.md)
# Place wav2lip_gan.pth in models/ directory

# Run backend
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

Update your `.env` file:

```bash
cd buddytalk-app
cp .env.example .env
# Add your API keys and Wav2Lip backend URL
```

Your `.env` should include:
```
VITE_WAV2LIP_API_URL=http://localhost:8000
```

## Using Wav2Lip in Your React App

### Basic Usage

```javascript
import { useWav2Lip } from './hooks/useWav2Lip';

function MyComponent() {
  const { generate, isGenerating, videoUrl, error, backendAvailable } = useWav2Lip();

  const handleGenerateLipSync = async () => {
    // Assuming you have a video file and audio file/blob
    const videoFile = ...; // File object
    const audioBlob = ...; // Blob from recording or File

    try {
      const result = await generate(videoFile, audioBlob);
      console.log('Generated video URL:', result.videoUrl);
      // Use result.videoUrl in a <video> element
    } catch (err) {
      console.error('Failed to generate lip-sync:', err);
    }
  };

  return (
    <div>
      {!backendAvailable && <p>Wav2Lip backend is not available</p>}

      <button onClick={handleGenerateLipSync} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Lip-Sync'}
      </button>

      {error && <p>Error: {error}</p>}

      {videoUrl && (
        <video src={videoUrl} controls autoPlay />
      )}
    </div>
  );
}
```

### Integration with Audio Recording

If you want to use the audio from your conversation:

```javascript
import { useWav2Lip } from './hooks/useWav2Lip';
import { useAudio } from './hooks/useAudio';

function ConversationWithLipSync() {
  const { generate, videoUrl } = useWav2Lip();
  const { audioBlob } = useAudio(); // Your existing audio hook

  const handleCreateLipSyncVideo = async () => {
    // Get a static video or avatar video
    const response = await fetch('/avatars/character.mp4');
    const videoBlob = await response.blob();
    const videoFile = new File([videoBlob], 'avatar.mp4', { type: 'video/mp4' });

    // Use the recorded audio
    await generate(videoFile, audioBlob);
  };

  return (
    <div>
      {/* Your conversation UI */}
      <button onClick={handleCreateLipSyncVideo}>
        Create Lip-Sync Video
      </button>

      {videoUrl && <video src={videoUrl} controls />}
    </div>
  );
}
```

## API Reference

### useWav2Lip Hook

```typescript
const {
  generate,        // (videoFile, audioFile) => Promise<{videoUrl, sessionId}>
  cleanup,         // () => void - Clean up current video
  isGenerating,    // boolean - Is generation in progress
  error,           // string | null - Error message
  videoUrl,        // string | null - Generated video URL
  backendAvailable // boolean - Is backend healthy
} = useWav2Lip();
```

### Service Functions

```javascript
import { generateLipSyncVideo, cleanupVideo, checkBackendHealth } from './services/wav2lipApi';

// Generate video
const { videoUrl, sessionId } = await generateLipSyncVideo(videoFile, audioFile);

// Cleanup after use
await cleanupVideo(sessionId);

// Check if backend is running
const isHealthy = await checkBackendHealth();
```

## Common Use Cases

### 1. Animate Static Avatar with Speech

```javascript
const animateAvatar = async (audioBlob) => {
  const avatarVideo = await fetch('/avatars/static-character.mp4')
    .then(r => r.blob())
    .then(b => new File([b], 'avatar.mp4', { type: 'video/mp4' }));

  const result = await generate(avatarVideo, audioBlob);
  return result.videoUrl;
};
```

### 2. Sync Video with Different Audio

```javascript
const resyncVideo = async (videoFile, newAudioFile) => {
  const result = await generate(videoFile, newAudioFile);
  return result.videoUrl;
};
```

### 3. Convert Recorded Audio to Video

```javascript
// After child speaks and you have audio
const createResponseVideo = async (characterVideo, responseAudio) => {
  const { videoUrl } = await generate(characterVideo, responseAudio);

  // Play the lip-synced video
  videoElement.src = videoUrl;
  videoElement.play();
};
```

## Performance Tips

1. **Video Size**: Use smaller resolution videos (480p) for faster processing
2. **Video Length**: Keep videos under 30 seconds for quick generation
3. **Preload**: Preload character videos for instant access
4. **Cleanup**: Always cleanup videos after use to save memory and disk space

## Troubleshooting

### Backend Not Available

Check that:
- Backend is running (`uvicorn app.main:app --reload`)
- Correct URL in `.env` (`VITE_WAV2LIP_API_URL=http://localhost:8000`)
- No CORS errors (check browser console)

### Slow Generation

- Use GPU-enabled machine for backend
- Reduce video resolution
- Use the non-GAN model (`wav2lip.pth`) for faster processing

### Poor Lip Sync Quality

- Ensure clear face in video (frontal view)
- Use higher quality input video
- Use the GAN model (`wav2lip_gan.pth`)
- Adjust `pads` parameter in `wav2lip_inference.py`

## Example Component

See [examples/Wav2LipDemo.jsx](../buddytalk-app/src/examples/Wav2LipDemo.jsx) for a complete working example.

## Next Steps

- Integrate with character selection
- Add progress indicators
- Cache generated videos
- Implement video preloading strategy
