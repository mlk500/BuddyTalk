# Wav2Lip Integration - Complete Guide

## ✅ What's Been Integrated

I've successfully integrated your existing Wav2Lip setup from `test-lip-sync` into the BuddyTalk project. Here's what's working:

### Backend (Python FastAPI)
- Uses your existing Wav2Lip from `/Users/malakyehia/projects/test-lip-sync/Wav2Lip`
- Character-based system (no need to upload video/image each time)
- Automatically finds and uses your model checkpoints
- Streams video back to React and auto-deletes files

### Frontend (React)
- Simple API: `generate('elsa', audioBlob)`
- Hook-based: `useWav2Lip()`
- Auto-cleanup of video URLs

---

## 🚀 How to Use

### 1. Start the Backend

```bash
cd /Users/malakyehia/projects/BuddyTalk/wav2lip-backend

# Activate venv
source venv/bin/activate

# Run server
uvicorn app.main:app --reload --port 8000
```

### 2. Test the API

Visit http://localhost:8000/docs for interactive API documentation

**Get available characters:**
```bash
curl http://localhost:8000/api/characters
```

**Generate lip-sync video:**
```bash
curl -X POST "http://localhost:8000/api/generate-lipsync" \
  -F "character_id=elsa" \
  -F "audio=@/path/to/audio.wav" \
  --output result.mp4
```

### 3. Use in React

```javascript
import { useWav2Lip } from './hooks/useWav2Lip';

function MyComponent() {
  const { generate, videoUrl, isGenerating, backendAvailable } = useWav2Lip();

  const handleGenerateLipSync = async () => {
    // audioBlob comes from your TTS or recording
    const audioBlob = /* your audio */;

    try {
      await generate('elsa', audioBlob);
      // videoUrl now contains the lip-synced video
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return (
    <div>
      {!backendAvailable && <p>⚠️ Backend not running</p>}

      <button onClick={handleGenerateLipSync} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Video'}
      </button>

      {videoUrl && (
        <video src={videoUrl} controls autoPlay />
      )}
    </div>
  );
}
```

---

## 📁 File Structure

```
BuddyTalk/
├── wav2lip-backend/
│   ├── app/
│   │   ├── main.py              # ✅ FastAPI routes
│   │   └── wav2lip_inference.py # ✅ Calls your test-lip-sync Wav2Lip
│   ├── characters/
│   │   ├── characters.json      # ✅ Character config
│   │   └── elsa2.png           # ✅ Copied from test-lip-sync
│   ├── uploads/                 # Temp audio files (auto-deleted)
│   ├── outputs/                 # Temp videos (auto-deleted after streaming)
│   └── requirements.txt         # ✅ Modern dependencies
│
├── buddytalk-app/
│   └── src/
│       ├── services/
│       │   └── wav2lipApi.js   # ✅ API client (character-based)
│       └── hooks/
│           └── useWav2Lip.js   # ✅ React hook
│
└── test-lip-sync/
    └── Wav2Lip/                 # ✅ Your existing setup (reused!)
        ├── inference.py
        ├── checkpoints/
        │   └── wav2lip_gan.pth
        └── media/
            └── elsa2.png
```

---

## 🎯 How It Works

### Flow:

```
1. React App
   ↓ (calls generate('elsa', audioBlob))

2. wav2lipApi.js
   ↓ POST /api/generate-lipsync with character_id + audio

3. FastAPI Backend
   ↓ Looks up 'elsa' in characters.json
   ↓ Finds elsa2.png
   ↓ Saves audioBlob to temp file

4. wav2lip_inference.py
   ↓ Calls your test-lip-sync/Wav2Lip/inference.py
   ↓ Passes: elsa2.png + audio.wav

5. Wav2Lip (your existing setup)
   ↓ Generates lip-synced video
   ↓ Saves to outputs/

6. FastAPI
   ↓ Streams video back to React
   ↓ Deletes temp files immediately

7. React
   ↓ Creates blob URL
   ↓ Displays in <video> element
```

---

## 🎨 Adding More Characters

### Option 1: Add Image Character

1. Copy image to backend:
```bash
cp /path/to/mickey.png wav2lip-backend/characters/
```

2. Update `characters.json`:
```json
{
  "elsa": {
    "name": "Elsa",
    "media_type": "image",
    "media_file": "elsa2.png",
    "description": "Frozen's Elsa character"
  },
  "mickey": {
    "name": "Mickey Mouse",
    "media_type": "image",
    "media_file": "mickey.png",
    "description": "Mickey Mouse"
  }
}
```

3. Use in React:
```javascript
await generate('mickey', audioBlob);
```

### Option 2: Add Video Character

Same process, but use `"media_type": "video"` and provide a `.mp4` file.

---

## 🔧 Troubleshooting

### Backend says "Wav2Lip inference.py not found"
- Make sure `/Users/malakyehia/projects/test-lip-sync/Wav2Lip/inference.py` exists
- Update the path in `wav2lip_inference.py` if you moved it

### "No model checkpoint found"
- Wav2Lip looks in two places:
  1. `wav2lip-backend/models/wav2lip_gan.pth`
  2. `test-lip-sync/Wav2Lip/checkpoints/wav2lip_gan.pth`
- Copy model to backend if needed:
  ```bash
  cp /Users/malakyehia/projects/test-lip-sync/Wav2Lip/checkpoints/*.pth \
     /Users/malakyehia/projects/BuddyTalk/wav2lip-backend/models/
  ```

### Slow generation
- This is normal! Wav2Lip takes 10-30 seconds for a short video
- Consider showing a loading animation in React while `isGenerating === true`

### "Face not detected"
- Make sure the character image has a clear, frontal face
- Check `test-lip-sync/Wav2Lip/temp/faulty_frame.jpg` to see what failed

---

## 🎯 Integration with Fish Audio (Future)

When you integrate Fish Audio for TTS:

```javascript
// 1. Get text from conversation
const text = "Hello, I'm Elsa!";

// 2. Generate audio with Fish Audio
const audioBlob = await fishAudio.generateVoice(text, {
  voice: 'elsa_voice'
});

// 3. Generate lip-sync video
const { videoUrl } = await generate('elsa', audioBlob);

// 4. Play video
videoElement.src = videoUrl;
```

---

## 📊 Current Status

✅ Backend running and integrated with your test-lip-sync Wav2Lip
✅ Character system set up (elsa ready to use)
✅ React API service and hook updated
✅ Auto-cleanup of temp files
⏳ Ready for Fish Audio TTS integration
⏳ Ready to replace smiley face with lip-sync video in your app

---

## 🚦 Next Steps

1. **Test it out:**
   - Start backend: `uvicorn app.main:app --reload --port 8000`
   - Test with curl or from React app

2. **Integrate with your conversation flow:**
   - When character responds, generate audio
   - Pass to `generate('elsa', audioBlob)`
   - Display video instead of smiley face

3. **Add Fish Audio TTS:**
   - Generate character voice
   - Send directly to Wav2Lip backend

4. **Polish:**
   - Add loading states
   - Handle errors gracefully
   - Preload character images

---

## 📝 Notes

- Current setup uses **Elsa's image** from your test-lip-sync
- The backend **reuses your existing Wav2Lip** (no duplication!)
- Videos are **streamed and auto-deleted** (no storage bloat)
- Works with **images or videos** (configurable per character)
