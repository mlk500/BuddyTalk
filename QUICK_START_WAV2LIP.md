# Quick Start - Wav2Lip Integration

## ✅ What's Done

Your Wav2Lip from `test-lip-sync` is now fully integrated! The backend:
- ✅ Uses your existing Wav2Lip installation
- ✅ Uses your existing model checkpoints
- ✅ Uses Elsa's image from your test project
- ✅ Character-based system (just send character ID + audio)
- ✅ Auto-cleanup (no file bloat)

## 🚀 Start Using It Now

### 1. Install Backend Dependencies (First Time Only)

```bash
cd /Users/malakyehia/projects/BuddyTalk/wav2lip-backend
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Start the Backend

```bash
cd /Users/malakyehia/projects/BuddyTalk/wav2lip-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 3. Test It

**Check if running:**
```bash
curl http://localhost:8000/health
```

**See available characters:**
```bash
curl http://localhost:8000/api/characters
```

You should see:
```json
{
  "characters": {
    "elsa": {
      "name": "Elsa",
      "media_type": "image",
      "media_file": "elsa2.png",
      "description": "Frozen's Elsa character"
    }
  }
}
```

**Test lip-sync generation** (using one of your test audio files):
```bash
curl -X POST "http://localhost:8000/api/generate-lipsync" \
  -F "character_id=elsa" \
  -F "audio=@/Users/malakyehia/projects/test-lip-sync/Wav2Lip/media/elsa-voice.wav" \
  --output test_result.mp4

# Play the result
open test_result.mp4
```

### 4. Use in React

Update your conversation component to use Wav2Lip:

```javascript
import { useWav2Lip } from './hooks/useWav2Lip';

function Conversation() {
  const { generate, videoUrl, isGenerating, error } = useWav2Lip();

  const handleResponse = async (audioBlob) => {
    try {
      // Generate lip-sync video with Elsa
      await generate('elsa', audioBlob);
      // videoUrl now has the lip-synced video
    } catch (err) {
      console.error('Lip-sync failed:', err);
    }
  };

  return (
    <div>
      {isGenerating && <p>Generating video...</p>}
      {error && <p>Error: {error}</p>}

      {videoUrl ? (
        <video src={videoUrl} autoPlay controls />
      ) : (
        <div>😊</div> // Your current smiley face
      )}
    </div>
  );
}
```

## 📝 How the Flow Works

```
React Component
  ↓ User talks
  ↓ Get audio response (TTS or recording)
  ↓ generate('elsa', audioBlob)
  ↓
Backend receives:
  - character_id: 'elsa'
  - audio: blob
  ↓
Backend looks up Elsa's image (elsa2.png)
  ↓
Calls your test-lip-sync/Wav2Lip
  - Input: elsa2.png + audio
  - Process: Face detection → Lip-sync
  - Output: video
  ↓
Streams video back to React
  ↓
React displays in <video> element
```

## 🎯 Next: Integrate with Your App

1. **Find where audio responses are generated** in your current app
2. **Pass that audio to `generate('elsa', audioBlob)`**
3. **Replace smiley face with `<video src={videoUrl} />`**

## 🔍 Important Paths

**Your existing Wav2Lip:**
```
/Users/malakyehia/projects/test-lip-sync/Wav2Lip/
```

**Backend uses:**
- Script: `test-lip-sync/Wav2Lip/inference.py`
- Model: `test-lip-sync/Wav2Lip/checkpoints/wav2lip_gan.pth`
- Elsa image: Copied to `wav2lip-backend/characters/elsa2.png`

**React app:**
- API client: `buddytalk-app/src/services/wav2lipApi.js`
- Hook: `buddytalk-app/src/hooks/useWav2Lip.js`

## ❓ Troubleshooting

**Backend won't start?**
- Make sure venv is activated: `source venv/bin/activate`
- Check port 8000 is free: `lsof -i :8000`

**"Wav2Lip inference.py not found"?**
- Verify path exists: `ls /Users/malakyehia/projects/test-lip-sync/Wav2Lip/inference.py`

**"No model checkpoint found"?**
- Check: `ls /Users/malakyehia/projects/test-lip-sync/Wav2Lip/checkpoints/*.pth`
- Should see `wav2lip_gan.pth` or similar

**Generation takes forever?**
- This is normal! Wav2Lip needs 10-30 seconds per video
- Show loading state while `isGenerating === true`

**Video quality poor?**
- You can adjust model in characters.json
- Or copy higher quality image to characters directory

## 📚 Full Documentation

See [WAV2LIP_INTEGRATION.md](./WAV2LIP_INTEGRATION.md) for complete details on:
- Adding more characters
- Using video instead of images
- Fish Audio integration
- Production deployment
