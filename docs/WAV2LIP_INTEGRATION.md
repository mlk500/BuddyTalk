# Wav2Lip Integration Guide

Wav2Lip enables realistic lip-sync video generation for character avatars.

## Overview

The system uses:
- **Backend**: FastAPI server running Wav2Lip model
- **Frontend**: React components that request lip-sync videos
- **Model**: Wav2Lip-SD-GAN for high-quality results

## Architecture

```
Text → Fish Audio TTS → Audio file
                           ↓
Audio + Character Image → Wav2Lip → Lip-sync Video
                           ↓
                    React Avatar Component
```

## Backend Setup

### Prerequisites

- Python 3.8+
- FFmpeg
- Wav2Lip model weights (~200MB)
- GPU recommended (CPU will be slow)

### Installation

```bash
cd wav2lip-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download Wav2Lip model
# Place Wav2Lip-SD-GAN.pt in models/ directory
```

### Character Configuration

Edit `characters/characters.json`:

```json
{
  "elsa": {
    "name": "Elsa",
    "reference_video": "characters/elsa/reference.mp4",
    "fish_audio_voice_id": "your_voice_model_id"
  }
}
```

### Start Server

```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### GET /api/characters
List all available characters.

### POST /api/generate-lipsync
Generate lip-sync video.

**Request:**
- `character_id`: Character identifier
- `audio`: Audio file (WAV/MP3)

**Response:**
- Video file (MP4)

### GET /api/characters/{id}/idle
Serve character idle animation (GIF).

## Frontend Integration

### Configuration

Set in `.env`:
```env
VITE_ENABLE_LIPSYNC=true
VITE_WAV2LIP_API_URL=http://localhost:8000
```

### Usage

The system automatically:
1. Generates audio with Fish Audio
2. Sends audio to Wav2Lip backend
3. Displays lip-sync video in Avatar component
4. Returns to idle animation when done

### Avatar Component

Shows:
- **Idle**: Looping GIF animation
- **Speaking**: Lip-sync video
- Automatic transition between states

## Performance

### Optimization Tips

1. **Use GPU**: Dramatically faster generation
2. **Pre-generate greetings**: Cache common phrases
3. **Compress videos**: Balance quality and size
4. **Use CDN**: For serving character assets

### Expected Times

- **CPU**: 10-30 seconds per video
- **GPU**: 2-5 seconds per video

## Troubleshooting

### Video generation fails
- Check FFmpeg is installed
- Verify model file exists in `models/`
- Check backend logs for errors

### Poor video quality
- Try Wav2Lip-SD-GAN model (better quality)
- Ensure reference video is high quality
- Check audio quality

### Slow generation
- Use GPU if available
- Reduce video resolution
- Pre-generate common phrases

## Deployment Notes

### Local Mode
- Full features with lip-sync
- Requires backend running
- Best for development

### Production Mode
- Consider GPU server costs
- Alternative: Use audio-only mode (no backend)
- See main README for deployment options
