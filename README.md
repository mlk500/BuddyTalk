# BuddyTalk

BuddyTalk is a voice-first conversational app for young children (ages 3–8), designed to support natural spoken English practice through interaction with friendly characters.

Children can engage in free conversation without reading or typing, while the system provides natural, supportive responses with gentle grammar correction using "recasting."

---

## Project Structure

This repository contains three main components:

### 1. [buddytalk-app](./buddytalk-app/) - Main React Application ✨
The full BuddyTalk app with:
- Character selection interface
- Voice-based conversations using Web Speech API (STT)
- **OpenRouter API integration** with FREE models (no rate limits!)
- Supabase database for chat history and memory persistence
- Fish Audio TTS for high-quality character voices
- Wav2Lip integration for realistic lip-synced video avatars
- Grammar correction using recasting technique
- Memory system that remembers personal facts across conversations
- Automatic English level assessment and adaptation
- Kid-friendly, text-free UI

**[→ Go to App README](./buddytalk-app/README.md)** for setup instructions.

### 2. [wav2lip-backend](./wav2lip-backend/) - Lip-Sync Video Generation Backend
FastAPI backend that generates lip-synced videos:
- Wav2Lip-SD-GAN model for high-quality lip sync
- Character-based system with configurable avatars
- Fish Audio TTS proxy to avoid CORS issues
- Automatic greeting caching for cost optimization

**[→ Go to Backend README](./wav2lip-backend/README.md)** for setup instructions.

### 3. [web-voice](./web-voice/) - Voice Prototype
Early-stage voice interaction prototype demonstrating:
- Browser-based Speech-to-Text (STT)
- Browser-based Text-to-Speech (TTS)
- Basic voice interaction loop

---

## Quick Start

### 1. Start the Backend (Wav2Lip)
```bash
cd wav2lip-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend (React App)
```bash
cd buddytalk-app
npm install
cp .env.example .env
# Add your OpenRouter, Supabase, and Fish Audio API keys to .env
npm run dev
```

**Quick Setup Guide:** See [QUICK_SETUP.md](./QUICK_SETUP.md) for a 5-minute OpenRouter setup guide!

### 3. Access the App
Open your browser to `http://localhost:5173` and start talking with Elsa!

See the [buddytalk-app README](./buddytalk-app/README.md) and [wav2lip-backend README](./wav2lip-backend/README.md) for detailed setup instructions.

## Documentation

- **[Quick Setup Guide](./QUICK_SETUP.md)** - 5-minute OpenRouter API setup
- **[OpenRouter Setup Guide](./OPENROUTER_SETUP.md)** - Complete OpenRouter integration docs
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Full feature overview
- [Fish Audio Integration Guide](./docs/FISH_AUDIO_INTEGRATION.md)
- [Wav2Lip Integration Guide](./docs/WAV2LIP_INTEGRATION.md)

---
