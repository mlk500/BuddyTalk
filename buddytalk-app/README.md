# BuddyTalk

A voice conversation app for young children (ages 3-8) built with React, Claude API, and Web Speech API.

## Features

- Character selection screen with animated characters
- Voice-based conversations using Web Speech API (STT/TTS)
- Natural language processing with Claude API
- Grammar correction using "recasting" technique
- Kid-friendly, text-free interface

## Prerequisites

- Node.js (v16 or higher)
- Chrome browser (recommended for best Web Speech API support)
- Claude API key from [Anthropic Console](https://console.anthropic.com/)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Add your Claude API key to `.env`:
   ```
   VITE_CLAUDE_API_KEY=your_api_key_here
   ```

4. Add character images to `public/assets/`:
   - `ariel.png`
   - `ariel-neutral.png`
   - `ariel-talking.png`
   - `ariel-happy.png`
   - `elsa.png`
   - `elsa-neutral.png`
   - `elsa-talking.png`
   - `elsa-happy.png`

## Development

Run the development server:
```bash
npm run dev
```

Open your browser to the URL shown (usually http://localhost:5173).

**Important:** Make sure to allow microphone permissions when prompted!

## Project Structure

```
src/
├── components/
│   ├── CharacterSelect/     # Character selection screen
│   ├── Conversation/         # Main conversation interface
│   └── common/               # Reusable components
├── hooks/
│   ├── useAudio.js          # STT + TTS logic
│   └── useConversation.js   # Conversation state management
├── services/
│   └── claudeApi.js         # Claude API integration
├── config/
│   ├── characters.js        # Character definitions
│   └── prompts.js           # LLM prompts
└── styles/
    └── theme.js             # Color constants
```

## Usage

1. Select a character by clicking on them
2. The character will greet the child and ask a question
3. The app automatically listens for the child's response
4. The character responds naturally, using recasting to correct grammar
5. Say "bye" or click the X button to exit

## Customization

### Adding New Characters

Edit `src/config/characters.js` to add new characters:

```javascript
{
  id: 'new-character',
  name: 'Character Name',
  image: '/assets/character.png',
  expressions: {
    neutral: '/assets/character-neutral.png',
    talking: '/assets/character-talking.png',
    happy: '/assets/character-happy.png',
  },
  voiceConfig: {
    pitch: 1.0,
    rate: 1.0,
  },
  personality: 'description of character personality',
}
```

### Customizing Colors

Edit `src/styles/theme.js` to change the color scheme.

### Adjusting Character Behavior

Modify `src/config/prompts.js` to change how characters interact with children.

## Browser Compatibility

- **Chrome/Edge:** Full support (recommended)
- **Safari:** Partial support (Web Speech API limitations)
- **Firefox:** Limited support

## License

MIT
