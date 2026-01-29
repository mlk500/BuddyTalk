# BuddyTalk

**A voice-first conversational app for young children (ages 3-8) to practice spoken English through natural conversations with friendly characters.**

![BuddyTalk](buddytalk-app/public/assets/waving.png)

## Live Demo

**Important Notes:**

- The deployed version uses **audio-only mode** (no lip-sync video)
- Uses **browser's Web Speech API** for speech-to-text and text-to-speech
  - Voice recognition may occasionally have accuracy issues
  - Requires microphone permissions
- For the **full experience with lip-sync video**, run locally (see setup instructions below)

🎉 **Try it now:** [buddy-talk-lilac.vercel.app](https://buddy-talk-lilac.vercel.app)

**Quick Test (No Setup Required):**

- Use demo family code: `HAPPY-UNICORN-63` (has sample data)
- Or create your own family code to start fresh

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

BuddyTalk enables children to engage in natural, educational conversations without needing to read or type. The system provides supportive responses with gentle grammar correction using the "recasting" technique, while tracking progress and remembering personal details across sessions.

---

## Features

1. **Character Conversations** - Interactive voice chats with popular characters
2. **Family & Profile Management** - Multi-device access via family codes
3. **Conversation Persistence** - Complete chat history saved
4. **Memory System** - AI-powered fact extraction and recall
5. **English Level Adaptation** - Automatic assessment and difficulty adjustment
6. **Grammar Correction (Recasting)** - Natural, non-intrusive learning
7. **Voice Interface** - Browser-based speech recognition and synthesis
8. **Parent Dashboard** - Monitor progress and conversations

---

## Tech Stack

- **Frontend**: React 18, Vite, Web Speech API
- **Backend**: FastAPI (for local lip-sync mode), Vercel serverless functions
- **AI**: OpenRouter (LLM), Fish Audio (TTS)
- **Database**: Supabase (PostgreSQL)
- **Lip-Sync**: Wav2Lip (local mode only)

---

## Quick Start

### Prerequisites

- Node.js 18+
- API Keys: [OpenRouter](https://openrouter.ai/keys), [Supabase](https://supabase.com), [Fish Audio](https://fish.audio)

### Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/mlk500/BuddyTalk.git
   cd BuddyTalk/buddytalk-app
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Setup Supabase database**

   - Create project at [supabase.com](https://supabase.com)
   - Run SQL schema (see `/docs/ARCHITECTURE.md`)
   - Add credentials to `.env`

4. **Start the app**

   ```bash
   npm run dev
   ```

5. **Access**: http://localhost:5173

For full lip-sync video support, see `/docs/WAV2LIP_INTEGRATION.md`

---

## Configuration

### Environment Variables

```env
# Deployment mode
VITE_ENABLE_LIPSYNC=true  # false for audio-only (Vercel)

# Database
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# LLM & Voice
VITE_OPENROUTER_API_KEY=your_key
VITE_FISH_AUDIO_API_KEY=your_key

# Backend (local mode only)
VITE_WAV2LIP_API_URL=http://localhost:8000
```

---

## Deployment

### Vercel (Audio-Only)

1. Connect GitHub repo to Vercel
2. Set Root Directory: `buddytalk-app`
3. Add environment variables:
   - `VITE_ENABLE_LIPSYNC=false`
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`, `FISH_AUDIO_API_KEY` (no VITE\_ prefix)
4. Deploy

See live demo: [buddy-talk-lilac.vercel.app](https://buddy-talk-lilac.vercel.app)

---

## Troubleshooting

**Voice not working?**

- Use Chrome/Edge browser
- Allow microphone permissions
- Note: Voice recognition accuracy varies by browser

**API errors?**

- Verify API keys are correct
- Check OpenRouter credits balance

**Database errors?**

- Verify Supabase credentials
- Check database schema is created

---

## License

Educational purposes only. Character likenesses belong to their respective owners.

---

**Made with ❤️ for young language learners**
