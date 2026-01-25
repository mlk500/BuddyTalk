# BuddyTalk Architecture

This document explains the technical architecture and design decisions behind BuddyTalk.

## Overview

BuddyTalk is a client-side React application that orchestrates three main technologies:
1. **Web Speech API** for voice input/output
2. **Claude API** for conversational intelligence
3. **React** for UI state management

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Application                       │   │
│  │                                                       │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  Character   │  │ Conversation │                │   │
│  │  │   Select     │→│    Screen    │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  │                           │                          │   │
│  │                           ↓                          │   │
│  │         ┌─────────────────────────────┐             │   │
│  │         │   useConversation Hook      │             │   │
│  │         │  (State Management)         │             │   │
│  │         └─────────────────────────────┘             │   │
│  │                  ↓              ↓                    │   │
│  │      ┌──────────────┐  ┌──────────────┐            │   │
│  │      │  useAudio    │  │  claudeApi   │            │   │
│  │      │    Hook      │  │   Service    │            │   │
│  │      └──────────────┘  └──────────────┘            │   │
│  │            │                    │                    │   │
│  └────────────│────────────────────│────────────────────┘   │
│               ↓                    ↓                         │
│    ┌──────────────────┐   ┌──────────────────┐             │
│    │  Web Speech API  │   │   Fetch API       │             │
│    │  (STT/TTS)       │   │   (HTTP Client)   │             │
│    └──────────────────┘   └──────────────────┘             │
│               │                    │                         │
└───────────────│────────────────────│─────────────────────────┘
                ↓                    ↓
         ┌─────────────┐    ┌──────────────────┐
         │  Browser    │    │   Claude API      │
         │  Audio I/O  │    │  (Anthropic)      │
         └─────────────┘    └──────────────────┘
```

## Core Components

### 1. App Component (`src/App.jsx`)
**Role:** Root application orchestrator

**Responsibilities:**
- Manage global app state (which screen to show)
- Handle character selection
- Navigate between CharacterSelect and Conversation screens

**State:**
```javascript
selectedCharacter: Character | null
```

### 2. CharacterSelect (`src/components/CharacterSelect/`)

**Components:**
- `CharacterSelect.jsx` - Main screen container
- `CharacterCard.jsx` - Individual character card

**Responsibilities:**
- Display available characters
- Handle character selection
- Provide visual feedback on hover/click

**Props:**
```javascript
onCharacterSelect: (character: Character) => void
```

### 3. Conversation (`src/components/Conversation/`)

**Components:**
- `Conversation.jsx` - Main conversation orchestrator
- `Avatar.jsx` - Animated character display
- `Controls.jsx` - Exit button and mic indicator

**Responsibilities:**
- Manage conversation flow and state
- Coordinate between audio input/output and API calls
- Handle conversation lifecycle (greeting → conversation → goodbye)

**Props:**
```javascript
character: Character
onExit: () => void
```

## Custom Hooks

### useAudio (`src/hooks/useAudio.js`)

**Purpose:** Encapsulate all Web Speech API interactions

**Returns:**
```javascript
{
  isListening: boolean,
  isSpeaking: boolean,
  transcript: string,
  error: string | null,
  startListening: () => Promise<void>,
  stopListening: () => void,
  onSpeechResult: (callback) => void,
  speak: (text, onComplete?) => void,
  stopSpeaking: () => void
}
```

**Key Implementation Details:**
- Uses `SpeechRecognition` for STT
- Uses `SpeechSynthesis` for TTS
- Manages microphone permissions
- Handles voice selection and configuration
- Provides callback mechanism for final transcripts

### useConversation (`src/hooks/useConversation.js`)

**Purpose:** Manage conversation state and history

**Returns:**
```javascript
{
  status: 'idle' | 'listening' | 'processing' | 'speaking',
  messages: Message[],
  character: Character,
  setStatus: (status) => void,
  addMessage: (role, content) => void,
  reset: () => void
}
```

**State Machine:**
```
idle → listening → processing → speaking → idle
  ↑                                           ↓
  └───────────────────────────────────────────┘
```

## Services

### claudeApi (`src/services/claudeApi.js`)

**Purpose:** Interface with Claude API for conversational responses

**Key Function:**
```javascript
getCharacterResponse(character, conversationHistory) → Promise<string>
```

**Implementation:**
- Uses Fetch API to call Claude Messages API
- Includes system prompt based on character
- Sends full conversation history for context
- Implements fallback responses if API unavailable
- Max tokens: 150 (keeps responses short for children)

## Configuration

### characters.js (`src/config/characters.js`)

**Structure:**
```javascript
{
  id: string,
  name: string,
  image: string,
  expressions: {
    neutral: string,
    talking: string,
    happy: string
  },
  voiceConfig: {
    pitch: number,  // 0.0 - 2.0
    rate: number    // 0.1 - 10.0
  },
  personality: string
}
```

### prompts.js (`src/config/prompts.js`)

**Purpose:** Generate system prompts for Claude API

**Key Features:**
- Character personality integration
- Recasting instructions
- Age-appropriate language guidelines
- Conversation flow guidance

### theme.js (`src/styles/theme.js`)

**Purpose:** Centralized color palette and design tokens

## Data Flow

### 1. Conversation Initialization
```
User clicks character
  → App sets selectedCharacter
  → Conversation screen renders
  → useConversation initializes
  → Greeting is spoken via useAudio
  → Status set to 'idle'
```

### 2. Conversation Turn
```
Status: idle
  → Auto-start listening (1s delay)
  → Status: listening
  → useAudio.startListening()
  → Child speaks
  → Speech Recognition processes
  → Final transcript callback fires
  → Status: processing
  → claudeApi.getCharacterResponse()
  → Response received
  → Status: speaking
  → useAudio.speak(response)
  → TTS completes
  → Status: idle
  → Loop continues
```

### 3. Exit Flow
```
Child says "bye" OR clicks X button
  → Character speaks goodbye
  → After TTS completes, call onExit
  → App sets selectedCharacter = null
  → Return to CharacterSelect
```

## Key Design Decisions

### 1. No Text UI for Children
**Decision:** All child-facing UI is visual/audio only

**Rationale:** Target age (3-8) has limited reading ability

**Implementation:**
- Large tap targets
- Icon-only buttons
- Character animations for feedback
- Status indicators are for debugging only

### 2. Automatic Conversation Flow
**Decision:** Auto-start listening when idle, no manual mic button

**Rationale:** Reduces cognitive load for young children

**Implementation:**
- 1-second delay before auto-listening
- Visual indicator shows when listening
- Smooth state transitions

### 3. Client-Side Only
**Decision:** No backend server, all processing in browser

**Rationale:**
- Simpler deployment
- Lower latency for voice I/O
- Reduced infrastructure costs

**Trade-offs:**
- API key exposed (acceptable for prototype)
- No conversation persistence
- Browser compatibility requirements

### 4. Recasting via Prompt Engineering
**Decision:** Implement grammar correction in system prompt, not post-processing

**Rationale:**
- Leverages Claude's language understanding
- More natural corrections
- Contextually appropriate

**Implementation:**
- System prompt includes recasting examples
- Claude naturally incorporates corrections in responses
- No separate grammar analysis needed

### 5. Inline Styling
**Decision:** Use inline styles instead of CSS modules

**Rationale:**
- Component encapsulation
- Dynamic theme-based styles
- Simpler for small project

**Trade-offs:**
- Less CSS caching
- Some duplication
- Harder to optimize bundle size

## Performance Considerations

### Voice Processing
- Speech Recognition runs locally (no API latency)
- TTS uses browser's native engine (fast)
- Microphone permission requested only once

### API Calls
- Conversation history sent each time (context)
- Max 150 tokens keeps responses fast
- Fallback responses if API fails

### Asset Loading
- SVG images load quickly
- No video/heavy assets
- Minimal bundle size

## Browser Compatibility

### Required Features
- Web Speech API (SpeechRecognition)
- Web Speech API (SpeechSynthesis)
- ES6+ JavaScript
- Fetch API
- CSS Flexbox/Grid

### Tested Browsers
- Chrome/Edge: Full support ✅
- Safari: Partial (limited voice selection)
- Firefox: Limited (STT may not work)

## Security Considerations

### API Key Exposure
**Risk:** Claude API key in client-side code

**Mitigation:**
- Environment variable (not committed)
- Rate limiting on API key
- Low-risk use case (prototype)

**Production Solution:**
- Implement backend proxy
- Server-side API key storage
- Request authentication

### Microphone Access
**Risk:** Microphone permission required

**Mitigation:**
- Browser permission prompts
- Clear user indication when listening
- No recording/storage of audio

## Future Enhancements

### Short Term
- [ ] Add talking avatar integration (SadTalker/D-ID)
- [ ] Implement conversation analytics
- [ ] Add parent dashboard
- [ ] Support for multiple languages

### Medium Term
- [ ] Backend API for conversation storage
- [ ] Progress tracking and learning metrics
- [ ] More characters and customization
- [ ] Mobile app (React Native port)

### Long Term
- [ ] Adaptive difficulty based on child's level
- [ ] Multiplayer conversations
- [ ] Gamification and rewards
- [ ] Teacher/educator portal
