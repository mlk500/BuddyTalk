# BuddyTalk Setup Guide

This guide will help you get BuddyTalk up and running.

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js v16 or higher installed (`node --version`)
- [ ] Chrome browser (for best Web Speech API support)
- [ ] A Claude API key from [Anthropic Console](https://console.anthropic.com/)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including React and Vite.

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Open the `.env` file and add your Claude API key:

```
VITE_CLAUDE_API_KEY=sk-ant-xxxxx
```

**Where to get your API key:**
1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy it to your `.env` file

### 3. Add Character Images (Optional)

The app currently uses placeholder SVG images. To use custom character images:

1. Add your images to `public/assets/`:
   - `ariel.png` (or `.jpg`, `.svg`)
   - `elsa.png` (or `.jpg`, `.svg`)

2. Update `src/config/characters.js` with the correct file extensions if needed.

**Recommended image specifications:**
- Format: PNG with transparent background
- Size: 400x400px minimum
- Square aspect ratio

### 4. Start Development Server

```bash
npm run dev
```

You should see output like:
```
VITE v7.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 5. Open in Browser

1. Open Chrome at [http://localhost:5173/](http://localhost:5173/)
2. When prompted, **allow microphone access** (this is required for voice input)

## Testing the App

### Character Selection
1. You should see two character cards (Ariel and Elsa)
2. Click on one to start a conversation

### Conversation Flow
1. The character will greet you and ask a question
2. The mic will automatically start listening (you'll see a red indicator)
3. Speak clearly into your microphone
4. The character will respond with voice and text
5. The conversation continues automatically

### Troubleshooting

**No microphone access?**
- Check browser permissions (click the lock icon in the address bar)
- Make sure you're using Chrome or Edge
- Try refreshing the page and allowing access again

**No audio output?**
- Check your system volume
- Try different voices in the browser settings
- The app uses Web Speech API, which depends on system TTS voices

**API errors?**
- Verify your Claude API key is correct in `.env`
- Check your API key has credits at [console.anthropic.com](https://console.anthropic.com/)
- Restart the dev server after changing `.env` (`Ctrl+C`, then `npm run dev`)

**Character not responding?**
- Open browser console (F12) to see error messages
- Check network tab for API call failures
- Verify speech recognition is working (transcript should appear)

## Testing Without Claude API

The app includes fallback responses if no API key is configured. To test the voice interaction without Claude:

1. Don't add an API key to `.env`
2. The character will respond with placeholder messages
3. This lets you test the voice input/output pipeline

## Next Steps

Once the app is working:

- Customize characters in `src/config/characters.js`
- Adjust conversation prompts in `src/config/prompts.js`
- Modify colors in `src/styles/theme.js`
- Add more characters by following the character config format

## Production Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` folder, ready for deployment.

To preview the production build locally:

```bash
npm run preview
```

## Need Help?

- Check the [main README](./README.md) for architecture details
- Review browser console for error messages
- Ensure Chrome DevTools shows no blocking errors
