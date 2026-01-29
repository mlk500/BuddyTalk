# BuddyTalk

**A voice-first conversational app for young children (ages 3-8) to practice spoken English through natural conversations with friendly characters.**

![BuddyTalk](buddytalk-app/public/assets/waving.png)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Usage Guide](#usage-guide)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Overview

BuddyTalk enables children to engage in natural, educational conversations without needing to read or type. The system provides supportive responses with gentle grammar correction using the "recasting" technique, while tracking progress and remembering personal details across sessions.

### Key Benefits

- **Voice-First Design**: No reading or typing required
- **Natural Conversations**: Open-ended dialogue with beloved characters
- **Grammar Support**: Gentle correction through recasting
- **Memory System**: Remembers facts about the child across conversations
- **Progress Tracking**: Automatic English level assessment and adaptation
- **Safe & Educational**: Kid-friendly content with no ads
- **Multi-Device Access**: Family code system for shared profiles

---

## Features

### Core Functionality

1. **Character Conversations**
   - Interactive voice chats with popular characters (Elsa, Ariel, and more)
   - Realistic lip-synced video avatars using Wav2Lip
   - High-quality character voices via Fish Audio TTS
   - Character-specific personalities and conversation styles

2. **Family & Profile Management**
   - Family code system for multi-device access
   - Multiple child profiles per family
   - Custom avatars with 12 emoji options
   - Age-based content adaptation (3-8 years)

3. **Conversation Persistence**
   - Complete chat history saved to database
   - Continue previous conversations
   - Auto-generated chat titles
   - Inline chat renaming

4. **Memory System**
   - AI-powered fact extraction from conversations
   - Persistent memory storage per child profile
   - Natural memory integration in future chats
   - Example: "How's your friend Mia? Did you play together today?"

5. **English Level Adaptation**
   - Automatic assessment after 5+ exchanges
   - Two levels: "needs_support" and "doing_well"
   - Age-appropriate evaluation
   - Dynamic difficulty adjustment:
     - **Needs Support**: Simple words, short sentences, yes/no questions
     - **Doing Well**: Open-ended questions, encouragement to elaborate

6. **Grammar Correction (Recasting)**
   - Natural correction technique: repeats child's idea with proper grammar
   - Child: "I goed to park"
   - Elsa: "Oh, you went to the park! That sounds fun!"
   - Non-intrusive learning through conversation

7. **Voice Interface**
   - Browser-based Speech-to-Text (Web Speech API)
   - Text-to-Speech throughout the app
   - Microphone pulse animation when listening
   - Text input fallback for accessibility

8. **Parent Dashboard**
   - View all family profiles
   - Manage child accounts
   - Access conversation history
   - Monitor progress and memories

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Web Speech API** - Browser STT/TTS
- **Supabase Client** - Database connectivity

### Backend
- **FastAPI** - Python web framework
- **Wav2Lip** - Lip-sync model for video generation
- **Fish Audio API** - High-quality TTS proxy

### AI & APIs
- **OpenRouter** - LLM routing with FREE models
  - Chat responses
  - Title generation
  - Memory extraction
  - Level assessment
- **Fish Audio** - Character voice synthesis
- **Supabase** - PostgreSQL database with real-time features

### Deployment
- **Frontend**: Vercel/Netlify compatible
- **Backend**: Docker-ready FastAPI server
- **Database**: Supabase cloud-hosted

---

## Project Structure

```
BuddyTalk/
├── buddytalk-app/                 # Main React application
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── CharacterSelect/  # Character selection UI
│   │   │   ├── Conversation/     # Main chat interface
│   │   │   ├── Dashboard/        # Parent dashboard
│   │   │   ├── Landing/          # Family code entry/creation
│   │   │   ├── UserSelect/       # Profile management
│   │   │   └── shared/           # Reusable components (Button, Loading)
│   │   ├── config/               # App configuration
│   │   │   ├── characters.js     # Character definitions
│   │   │   └── supabase.js       # Supabase client
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useConversationWithDB.js  # Conversation logic
│   │   ├── services/             # API integrations
│   │   │   ├── database.js       # Supabase CRUD operations
│   │   │   ├── openRouterApi.js  # LLM API calls
│   │   │   ├── fishAudioApi.js   # TTS API
│   │   │   ├── wav2lipApi.js     # Video generation API
│   │   │   └── userService.js    # User management
│   │   ├── styles/               # Styling
│   │   │   └── theme.js          # Design system
│   │   ├── utils/                # Utilities
│   │   │   └── voiceControl.js   # TTS helpers
│   │   ├── App.jsx               # Main app component
│   │   ├── index.css             # Global styles
│   │   └── main.jsx              # Entry point
│   ├── public/                   # Static assets
│   │   ├── assets/               # Images (characters, UI)
│   │   └── prerecorded/          # Cached audio/video
│   ├── .env.example              # Environment template
│   ├── package.json              # Dependencies
│   └── vite.config.js            # Build configuration
│
├── wav2lip-backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py               # FastAPI app
│   │   ├── wav2lip_inference.py  # Lip-sync generation
│   │   └── fish_audio_proxy.py   # TTS proxy
│   ├── characters/               # Character assets
│   │   ├── characters.json       # Character configuration
│   │   └── */                    # Character media folders
│   ├── Wav2Lip/                  # Wav2Lip model library
│   ├── models/                   # Downloaded model weights
│   ├── requirements.txt          # Python dependencies
│   └── README.md                 # Backend setup guide
│
└── docs/                         # Documentation
    ├── ARCHITECTURE.md           # System architecture
    ├── FISH_AUDIO_INTEGRATION.md # TTS integration guide
    ├── WAV2LIP_INTEGRATION.md    # Lip-sync guide
    └── WAV2LIP_DEPLOYMENT.md     # Deployment guide
```

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **Git**
- **FFmpeg** (for video processing)
- API Keys:
  - [OpenRouter](https://openrouter.ai/keys) (FREE tier available)
  - [Supabase](https://supabase.com) (FREE tier available)
  - [Fish Audio](https://fish.audio) (for TTS)

### 5-Minute Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mlk500/BuddyTalk.git
   cd BuddyTalk
   ```

2. **Start the Backend**
   ```bash
   cd wav2lip-backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. **Start the Frontend**
   ```bash
   cd buddytalk-app
   npm install
   cp .env.example .env
   # Edit .env and add your API keys (see Configuration section)
   npm run dev
   ```

4. **Access the App**
   - Open your browser to `http://localhost:5173`
   - Create a new family or enter an existing family code
   - Add a child profile
   - Select a character and start chatting!

---

## Detailed Setup

### 1. Backend Setup (wav2lip-backend)

#### Install Python Dependencies
```bash
cd wav2lip-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Install FFmpeg
- **macOS**: `brew install ffmpeg`
- **Ubuntu**: `sudo apt install ffmpeg`
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

#### Download Wav2Lip Model
The Wav2Lip-SD-GAN model is required for lip-sync video generation.

**Download from Google Drive:**
1. Go to: https://drive.google.com/drive/folders/153HLrqlBNxzZcHi17PEvP09kkAfzRshM
2. Download **`Wav2Lip-SD-GAN.pt`** (recommended - better visual quality)
   - Alternative: `Wav2Lip-SD-NOGAN.pt` (more accurate sync, lower quality)
3. Move to the models directory:
   ```bash
   cd models
   mv ~/Downloads/Wav2Lip-SD-GAN.pt .
   cd ..
   ```

**Note:** The model file is ~200MB and required for video generation.

#### Configure Characters
Edit `characters/characters.json` to add/modify characters:
```json
{
  "elsa": {
    "name": "Elsa",
    "greeting_audio": "characters/elsa/greeting.mp3",
    "greeting_video": "characters/elsa/greeting.mp4",
    "reference_video": "characters/elsa/reference.mp4",
    "fish_audio_voice_id": "your_voice_model_id"
  }
}
```

#### Start the Backend
```bash
uvicorn app.main:app --reload --port 8000
```

Server will be available at `http://localhost:8000`

API Endpoints:
- `GET /characters/{character_id}/greeting` - Get greeting video
- `POST /wav2lip/generate` - Generate lip-synced video
- `POST /fish-audio/tts` - Generate TTS audio (proxy)
- `GET /audio/{character_id}/{filename}` - Serve audio files

### 2. Frontend Setup (buddytalk-app)

#### Install Dependencies
```bash
cd buddytalk-app
npm install
```

#### Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
# Database (Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# LLM API (OpenRouter) - FREE tier available!
VITE_OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key
VITE_OPENROUTER_USE_PAID=false  # Set to true for paid models

# Voice & Video APIs
VITE_FISH_AUDIO_API_KEY=your_fish_audio_key
VITE_FISH_AUDIO_MODEL_ID=your_voice_model_id
VITE_WAV2LIP_API_URL=http://localhost:8000
```

#### Setup Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)

2. Run the following SQL in the SQL Editor:

```sql
-- Families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 1 AND age <= 18),
  avatar_url TEXT,
  english_level TEXT DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  fact TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_family ON profiles(family_id);
CREATE INDEX idx_chats_profile ON chats(profile_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_memories_profile ON memories(profile_id);
```

3. Copy your project URL and anon key to `.env`

#### Start Development Server
```bash
npm run dev
```

App will be available at `http://localhost:5173`

---

## Usage Guide

### For Children (Ages 3-8)

1. **Starting a Conversation**
   - Select your profile (or ask parent to create one)
   - Choose your favorite character
   - Click the microphone and start talking!
   - The character will respond with voice and video

2. **Continuing Previous Chats**
   - Previous conversations are automatically saved
   - Click on any saved chat to continue where you left off

3. **Tips for Best Experience**
   - Speak clearly into the microphone
   - Wait for the character to finish talking before responding
   - Have fun and be creative with your conversations!

### For Parents/Educators

1. **Setting Up Family Account**
   - Create a new family code or use an existing one
   - Share the family code with family members for multi-device access
   - Add profiles for each child

2. **Managing Profiles**
   - Edit child profiles (name, age, avatar)
   - Delete profiles when needed
   - View conversation history per child

3. **Accessing Dashboard**
   - Click "Parent Dashboard" from profile selection
   - View all saved memories and conversations
   - Monitor English progress and level

4. **Privacy & Safety**
   - All data is stored securely in Supabase
   - No ads or third-party tracking
   - Family codes provide secure multi-device access
   - Conversations are private to each family

---

## Configuration

### Character Configuration

To add new characters, edit `buddytalk-app/src/config/characters.js`:

```javascript
{
  id: 'new-character',           // Unique ID (lowercase, no spaces)
  name: 'Character Name',        // Display name
  emoji: '🎭',                   // Emoji for UI
  image: '/assets/char.png',     // Character image path
  available: true,               // Set to false for "Coming Soon"
  personality: 'Friendly and encouraging...', // AI personality prompt
  greeting: 'Hello! How are you today?',      // First message
  voiceConfig: {
    pitch: 1.0,     // TTS pitch (0.5-2.0)
    rate: 0.9,      // TTS speed (0.5-2.0)
    volume: 1.0     // TTS volume (0.0-1.0)
  }
}
```

### OpenRouter Configuration

BuddyTalk uses OpenRouter for all AI functionality. By default, it uses **FREE models** with no rate limits!

**Free Models Used (in order):**
1. `google/gemini-2.0-flash-exp:free` - Best quality, 1M context
2. `meta-llama/llama-3.3-70b-instruct:free` - Great for conversations
3. `qwen/qwen-2.5-7b-instruct:free` - Good balance
4. `mistralai/mistral-small-3.1-24b-instruct:free` - Reliable backup

**Optional: Upgrade to Paid Model**
For better quality (demos, presentations):
1. Add $5 credits at [openrouter.ai/credits](https://openrouter.ai/credits)
2. Set `VITE_OPENROUTER_USE_PAID=true` in `.env`
3. Cost: ~$0.01 per conversation, ~$0.30 for full demo

### Fish Audio Voice Configuration

1. Create account at [fish.audio](https://fish.audio)
2. Create or select a voice model
3. Copy the model ID to `VITE_FISH_AUDIO_MODEL_ID`
4. Add API key to `VITE_FISH_AUDIO_API_KEY`

### Database Configuration

Supabase connection is configured in `buddytalk-app/src/config/supabase.js`:
- URL and key come from `.env` file
- All tables use UUID primary keys
- CASCADE deletion ensures data integrity
- Real-time subscriptions available (optional)

---

## Deployment

BuddyTalk supports **two deployment modes**:

### Option 1: Vercel Deployment (Recommended - FREE)

**Audio-only mode** - No backend needed, uses Vercel serverless functions for TTS and chat.

**Cost**: FREE (Vercel hobby plan)

**Features**:
- ✅ Voice conversations with characters
- ✅ All AI chat features
- ✅ Database persistence
- ❌ No lip-sync video (shows static character image/GIF)

#### Quick Deploy to Vercel

1. **Connect your GitHub repo to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import your GitHub repository
   - Root Directory: `buddytalk-app`
   - Framework Preset: Vite

2. **Configure Environment Variables**

   Add these in Vercel project settings (Settings → Environment Variables):

   **Frontend Variables (VITE_*):**
   ```bash
   VITE_ENABLE_LIPSYNC=false
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   **Serverless Function Variables (SECRET - not exposed to browser):**
   ```bash
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   FISH_AUDIO_API_KEY=your_fish_audio_api_key_here
   ```

   **Optional:**
   ```bash
   VITE_OPENROUTER_USE_PAID=false
   OPENROUTER_USE_PAID=false
   VITE_CLAUDE_API_KEY=your_claude_api_key_here
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-project.vercel.app`

4. **Important Notes**
   - ✅ API keys are stored securely in Vercel (not exposed to browser)
   - ✅ Serverless functions handle Fish Audio TTS and OpenRouter chat
   - ✅ All character assets served from `/public/assets/`
   - ⚠️ DO NOT set `VITE_OPENROUTER_API_KEY` or `VITE_FISH_AUDIO_API_KEY` on Vercel (security risk)

#### Local Testing of Vercel Mode

Before deploying, test locally:

```bash
cd buddytalk-app

# Create .env with Vercel settings
cp .env.vercel.example .env

# Edit .env and set:
# VITE_ENABLE_LIPSYNC=false
# (other variables as needed)

# Install Vercel CLI
npm install -g vercel

# Run in Vercel dev mode (simulates serverless functions)
vercel dev
```

This starts the app with Vercel's serverless functions running locally.

---

### Option 2: Full Deployment (Local Backend + Vercel Frontend)

**Full features** - Lip-sync video generation enabled

**Cost**: ~$50-100/month (GPU server for Wav2Lip backend)

**Features**:
- ✅ Voice conversations with characters
- ✅ All AI chat features
- ✅ Database persistence
- ✅ Lip-sync video generation (full experience)

#### Backend Deployment (Docker)

1. **Create Dockerfile** in `wav2lip-backend/`:
   ```dockerfile
   FROM python:3.9-slim

   RUN apt-get update && apt-get install -y \
       ffmpeg \
       && rm -rf /var/lib/apt/lists/*

   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   # Download Wav2Lip model (not included in repo)
   # You'll need to add this manually or via volume mount

   EXPOSE 8000
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Deploy to cloud with GPU** (Railway, Render, RunPod, or AWS):
   - Requires GPU for reasonable Wav2Lip performance
   - Upload Wav2Lip model to `/models/` directory
   - Configure environment variables
   - Set up HTTPS and CORS

3. **Frontend Environment Variables**
   ```bash
   VITE_ENABLE_LIPSYNC=true
   VITE_WAV2LIP_API_URL=https://your-backend-url.com
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   VITE_FISH_AUDIO_API_KEY=your_fish_audio_key
   ```

---

### Deployment Checklist

**Before deploying to Vercel:**
- [ ] Create Supabase account and database
- [ ] Get OpenRouter API key (https://openrouter.ai/keys)
- [ ] Get Fish Audio API key (https://fish.audio)
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Verify `VITE_ENABLE_LIPSYNC=false` is set
- [ ] DO NOT set API keys as VITE_ variables (security risk!)
- [ ] Deploy and test

**For full deployment (with backend):**
- [ ] All checklist items above, plus:
- [ ] Deploy backend to GPU server
- [ ] Upload Wav2Lip model (~200MB)
- [ ] Set `VITE_ENABLE_LIPSYNC=true`
- [ ] Set `VITE_WAV2LIP_API_URL` to backend URL

---

## Troubleshooting

### Common Issues

#### "Using fallback response for testing"
- **Cause**: OpenRouter API key not set or invalid
- **Fix**: Check `.env` has correct `VITE_OPENROUTER_API_KEY`
- **Fix**: Restart dev server with `npm run dev`

#### "OpenRouter API error: 401"
- **Cause**: Invalid API key
- **Fix**: Get new key from [openrouter.ai/keys](https://openrouter.ai/keys)
- **Fix**: Ensure you copied the full key (starts with `sk-or-v1-`)

#### "OpenRouter API error: 402"
- **Cause**: Trying to use paid model without credits
- **Fix**: Set `VITE_OPENROUTER_USE_PAID=false` to use FREE models
- **Or**: Add credits at [openrouter.ai/credits](https://openrouter.ai/credits)

#### Microphone Not Working
- **Cause**: Browser permissions not granted
- **Fix**: Check browser settings and allow microphone access
- **Fix**: Use HTTPS (required for Web Speech API in production)

#### Character Video Not Loading
- **Cause**: Backend not running or misconfigured
- **Fix**: Ensure `uvicorn app.main:app --port 8000` is running
- **Fix**: Check `VITE_WAV2LIP_API_URL` in `.env`

#### Supabase Connection Error
- **Cause**: Invalid credentials or network issue
- **Fix**: Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Fix**: Check Supabase project status

#### Fish Audio TTS Failing
- **Cause**: Invalid API key or model ID
- **Fix**: Verify credentials at [fish.audio](https://fish.audio)
- **Fix**: Check model ID is correct

### Performance Tips

1. **Pre-generate greeting videos** to reduce API costs:
   ```bash
   node generate-goodbye.js
   ```

2. **Enable caching** in production:
   - Use CDN for static assets
   - Cache character images and videos
   - Enable Supabase query caching

3. **Optimize bundle size**:
   ```bash
   npm run build -- --mode production
   ```

4. **Monitor API usage**:
   - Check OpenRouter dashboard for usage
   - Monitor Fish Audio credit balance
   - Track Supabase database size

### Getting Help

- **Documentation**: See `/docs/` folder for detailed guides
- **Issues**: Check existing issues or create a new one
- **API Status**:
  - OpenRouter: [status.openrouter.ai](https://status.openrouter.ai)
  - Supabase: [status.supabase.com](https://status.supabase.com)

---

## License

This project is for educational purposes. Character likenesses and intellectual property belong to their respective owners.

---

## Acknowledgments

- **Wav2Lip** - Lip-sync model by [Rudrabha Mukhopadhyay](https://github.com/Rudrabha/Wav2Lip)
- **OpenRouter** - LLM routing service
- **Fish Audio** - High-quality TTS
- **Supabase** - Backend as a Service
- **React** - UI framework
- **FastAPI** - Python web framework

---

**Made with ❤️ for young language learners**
