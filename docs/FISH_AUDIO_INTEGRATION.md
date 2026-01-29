# Fish Audio Integration Guide

Fish Audio provides high-quality text-to-speech for character voices.

## Overview

Features:
- High-quality voice synthesis
- Emotion control support
- Multiple voice models
- Streaming audio output

## Configuration

### API Setup

1. Create account at [fish.audio](https://fish.audio)
2. Get API key from dashboard
3. Create or select voice models
4. Add credentials to `.env`

```env
VITE_FISH_AUDIO_API_KEY=your_api_key_here
```

### Character Voice Configuration

Edit `src/config/characters.js`:

```javascript
{
  id: 'elsa',
  name: 'Elsa',
  fishAudio: {
    modelId: 'your_voice_model_id'
  }
}
```

## API Integration

### Service: fishAudioApi.js

Located at `src/services/fishAudioApi.js`

Key function:
```javascript
generateSpeech(text, options)
  → Returns: Audio blob (MP3)
```

### Options

```javascript
{
  modelId: string,      // Voice model ID
  format: 'mp3',        // Audio format
  mp3_bitrate: 128,     // Quality (64-320 kbps)
  latency: 'balanced',  // 'low' | 'balanced' | 'normal'
  temperature: 0.7,     // Variation (0.0-1.0)
  chunk_length: 200     // Streaming chunk size
}
```

## Emotion Control

Add emotion tags to text:

```javascript
"(happy) Hello there!"
"(excited) That's amazing!"
"(curious) What did you do today?"
```

Supported emotions:
- happy, excited, surprised, curious, delighted
- sad, empathetic, calm, confident
- See Fish Audio docs for full list

**Best Practices:**
- Use sparingly (one per sentence max)
- Lowercase tags only
- Place at sentence start
- Don't overuse in short text

## Deployment Modes

### Local Mode
- API key in browser
- Direct API calls from frontend
- Set `VITE_FISH_AUDIO_API_KEY` in `.env`

### Vercel Mode
- API key on server (secure)
- Proxied through `/api/tts` endpoint
- Set `FISH_AUDIO_API_KEY` in Vercel (no VITE_ prefix)

## Cost Optimization

Settings for cost-effectiveness:
- **Format**: MP3 (smaller than WAV)
- **Bitrate**: 128 kbps (good quality)
- **Latency**: balanced (not "low")
- **Chunk length**: 200 (faster response)

## Troubleshooting

### Audio not generating
- Verify API key is valid
- Check model ID exists
- Review console for errors

### Poor audio quality
- Increase mp3_bitrate (192 or 256)
- Try different voice model
- Check input text quality

### Slow generation
- Use "low" latency mode
- Reduce chunk_length
- Check network connection

## Integration Flow

```
User input → OpenRouter LLM → Response text
                                    ↓
                              Fish Audio API
                                    ↓
                              Audio blob (MP3)
                                    ↓
                              Browser plays audio
```

With Wav2Lip (local mode):
```
Audio blob → Wav2Lip backend → Lip-sync video
```
