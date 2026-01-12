# BuddyTalk

BuddyTalk is a voice-first conversational app for young children (ages 3–8), designed to support natural spoken English practice through interaction with friendly characters.

Children can engage in free conversation without reading or typing, while the system provides natural, supportive responses with gentle grammar correction using "recasting."

---

## Project Structure

This repository contains two components:

### 1. [buddytalk-app](./buddytalk-app/) - Main React Application ✨
The full BuddyTalk app with:
- Character selection interface
- Voice-based conversations using Web Speech API
- Claude API integration for intelligent responses
- Grammar correction using recasting technique
- Kid-friendly, text-free UI

**[→ Go to App README](./buddytalk-app/README.md)** for setup instructions.

### 2. [web-voice](./web-voice/) - Voice Prototype
Early-stage voice interaction prototype demonstrating:
- Browser-based Speech-to-Text (STT)
- Browser-based Text-to-Speech (TTS)
- Basic voice interaction loop

---

## Quick Start

To get started with the main application:

```bash
cd buddytalk-app
npm install
cp .env.example .env
# Add your Claude/Gemini/ChatGPT API key to .env
npm run dev
```

See the [buddytalk-app README](./buddytalk-app/README.md) for detailed setup instructions.

---
