# BuddyTalk - Quick Start Checklist

Get BuddyTalk running in 5 minutes!

## Prerequisites
- [ ] Node.js installed (run `node --version` to check)
- [ ] Chrome browser installed
- [ ] Claude API key ready ([Get one here](https://console.anthropic.com/))

## Setup Steps

### 1️⃣ Install Dependencies
```bash
npm install
```
**Expected:** Should complete without errors

---

### 2️⃣ Configure API Key
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your key
# VITE_CLAUDE_API_KEY=sk-ant-xxxxx
```

**How to get your API key:**
1. Go to https://console.anthropic.com/
2. Sign up/log in
3. Go to "API Keys"
4. Create new key
5. Copy to `.env`

---

### 3️⃣ Start the App
```bash
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

### 4️⃣ Open in Browser
1. Open Chrome
2. Go to http://localhost:5173/
3. **Allow microphone access** when prompted ⚠️

---

### 5️⃣ Test It!
1. Click on Ariel or Elsa
2. Character will say "Hi! I'm [Name]! What's your name?"
3. Speak your name
4. Character responds!

---

## Troubleshooting

### ❌ "Microphone permission denied"
- Click the 🔒 icon in Chrome's address bar
- Reset permissions
- Refresh and try again

### ❌ "VITE_CLAUDE_API_KEY not found"
- Check `.env` file exists
- Verify API key is correct
- Restart dev server (`Ctrl+C`, then `npm run dev`)

### ❌ "Speech recognition not supported"
- Use Chrome or Edge (Safari/Firefox limited)
- Update browser to latest version

### ❌ No audio output
- Check system volume
- Try different browser tab
- Check Chrome site settings for audio

---

## Next Steps

Once it's working:

### Replace Character Images
1. Add your images to `public/assets/`
2. Update `src/config/characters.js`

### Customize Behavior
- Edit `src/config/prompts.js` for conversation style
- Edit `src/config/characters.js` for character personalities
- Edit `src/styles/theme.js` for colors

### Learn More
- [README.md](./README.md) - Full documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup

---

## Development Tips

### Hot Reload
Changes to source files auto-refresh the browser!

### View Console
Press `F12` to see debug logs and errors

### Test Without API
Remove API key from `.env` to test voice I/O with fallback responses

---

## You're All Set! 🎉

The app is now running at http://localhost:5173/

Try having a conversation with Ariel or Elsa!
