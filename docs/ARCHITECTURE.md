# BuddyTalk Architecture

Technical architecture and design decisions behind BuddyTalk.

## System Overview

BuddyTalk is a React application that orchestrates:

1. **Web Speech API** for voice input/output
2. **OpenRouter** for conversational AI (LLM)
3. **Fish Audio** for character voice synthesis
4. **Wav2Lip** for lip-sync video generation (local mode)
5. **Supabase** for data persistence

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React App)                     │
│                                                               │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Character  │→│ Conversation │→│   Dashboard   │        │
│  │   Select   │  │    Screen    │  │              │        │
│  └────────────┘  └──────────────┘  └──────────────┘        │
│                           │                                   │
│         ┌─────────────────┴─────────────────┐               │
│         ↓                                     ↓               │
│  ┌──────────────┐                   ┌──────────────┐        │
│  │   useAudio   │                   │ OpenRouter   │        │
│  │     Hook     │                   │   API        │        │
│  └──────────────┘                   └──────────────┘        │
│         │                                     │               │
│  ┌──────────────┐                   ┌──────────────┐        │
│  │  Web Speech  │                   │   Supabase   │        │
│  │     API      │                   │   Database   │        │
│  └──────────────┘                   └──────────────┘        │
│                                                               │
└───────────────────────────────────────────────────────────────┘
                    ↓                          ↓
          ┌──────────────────┐       ┌──────────────────┐
          │   Fish Audio     │       │   Wav2Lip API    │
          │   TTS Service    │       │   (Local Mode)   │
          └──────────────────┘       └──────────────────┘
```

## Core Components

### App (`src/App.jsx`)

Root application orchestrator managing navigation between screens.

### CharacterSelect (`src/components/CharacterSelect/`)

- Display available characters
- Handle character selection
- Visual feedback on hover/click

### Conversation (`src/components/Conversation/`)

Components:

- `Conversation.jsx` - Main conversation orchestrator
- `Avatar.jsx` - Animated character display
- `Controls.jsx` - UI controls (mic, mute, exit)

Responsibilities:

- Manage conversation flow and state
- Coordinate audio input/output with API calls
- Handle conversation lifecycle

### Dashboard (`src/components/Dashboard/`)

Parent dashboard for viewing:

- Family profiles
- Conversation history
- Memories and progress

## Custom Hooks

### useAudio (`src/hooks/useAudio.js`)

Encapsulates Web Speech API interactions.

Returns:

```javascript
{
  isListening: boolean,
  isSpeaking: boolean,
  transcript: string,
  startListening: () => Promise<void>,
  speak: (text, onComplete?) => void,
  stopSpeaking: () => void
}
```

### useConversationWithDB (`src/hooks/useConversationWithDB.js`)

Manages conversation state with database persistence.

State Machine:

```
idle → listening → processing → speaking → idle
```

## Services

### openRouterApi (`src/services/openRouterApi.js`)

Interface with OpenRouter for:

- Chat responses
- Title generation
- Memory extraction
- English level assessment

### fishAudioApi (`src/services/fishAudioApi.js`)

Fish Audio TTS integration for character voices.

### database (`src/services/database.js`)

Supabase CRUD operations for:

- Families
- Profiles
- Chats
- Messages
- Memories

### wav2lipApi (`src/services/wav2lipApi.js`)

Lip-sync video generation (local mode only).

## Configuration Files

### characters.js (`src/config/characters.js`)

Character definitions:

```javascript
{
  id: string,
  name: string,
  personality: string,
  greeting: string,
  fishAudio: { modelId: string },
  assets: { idleAnimation: string, lipSyncSource: string }
}
```

### prompts.js (`src/config/prompts.js`)

System prompts for OpenRouter API:

- Character personality integration
- Recasting instructions
- Age-appropriate language guidelines
- Conversation flow guidance

## Data Flow

### Conversation Turn

```
Status: idle
  → Auto-start listening
  → Status: listening
  → Child speaks
  → Speech recognition processes
  → Status: processing
  → OpenRouter API generates response
  → Status: speaking
  → Fish Audio TTS plays
  → Status: idle
```

### Database Persistence

```
Message sent
  → Save to Supabase (messages table)
  → Extract memories (if applicable)
  → Update English level (after 5+ turns)
  → Save to profile
```

## Key Design Decisions

### Voice-First Interface

- No reading or typing required
- Large tap targets
- Icon-only buttons for children
- Visual feedback for all actions

### Automatic Conversation Flow

- Auto-start listening when idle
- No manual mic button needed
- Reduces cognitive load for children

### Recasting via Prompt Engineering

- Grammar correction in system prompt
- Leverages LLM's language understanding
- Natural, contextually appropriate corrections

### Deployment Modes

**Audio-Only (Vercel)**:

- Static GIF avatars
- No backend required
- Serverless functions for APIs

**Full Mode (Local)**:

- Lip-sync video generation
- Requires GPU backend
- Enhanced visual experience

## Database Schema

### Families

```sql
id UUID PRIMARY KEY
family_code TEXT UNIQUE
created_at TIMESTAMP
```

### Profiles

```sql
id UUID PRIMARY KEY
family_id UUID REFERENCES families
name TEXT
age INTEGER
english_level TEXT
```

### Chats

```sql
id UUID PRIMARY KEY
profile_id UUID REFERENCES profiles
character_id TEXT
title TEXT
```

### Messages

```sql
id UUID PRIMARY KEY
chat_id UUID REFERENCES chats
role TEXT ('user' | 'assistant')
content TEXT
```

### Memories

```sql
id UUID PRIMARY KEY
profile_id UUID REFERENCES profiles
fact TEXT
```

## Performance Considerations

- Speech Recognition runs locally (no API latency)
- TTS uses Fish Audio (high quality, low latency)
- Database queries optimized with indexes
- Assets cached in browser
- Serverless functions scale automatically

## Browser Compatibility

**Required Features:**

- Web Speech API (SpeechRecognition & SpeechSynthesis)
- ES6+ JavaScript
- Fetch API

**Tested Browsers:**

- Chrome/Safari: Full support ✅
- Safari: Partial (limited voice selection)
- Firefox: Limited (STT may not work)
