# BuddyTalk Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/malakyehia/projects/BuddyTalk/buddytalk-app
npm install
```

The following package has already been installed:
- ✅ `@supabase/supabase-js` - Supabase client library

### 2. Environment Variables

Create or update `/buddytalk-app/.env` with your API keys:

```env
# Supabase Configuration (Already configured)
VITE_SUPABASE_URL=https://qxsnycmufxgqqgirfmdm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_TpXM_pfajD_M6I3ZSZRRjw_n6dVqiMb

# Gemini API (for conversation responses)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Fish Audio API (for voice cloning - optional)
VITE_FISH_AUDIO_KEY=your_fish_audio_key_here

# Claude API (optional - for better AI features)
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```

**Where to get API keys:**
- **Gemini API**: https://makersuite.google.com/app/apikey
- **Fish Audio**: https://fish.audio (if using voice cloning)
- **Claude API**: https://console.anthropic.com (optional enhancement)

### 3. Database Setup

Your Supabase database is already configured with these tables:
- ✅ `families`
- ✅ `profiles`
- ✅ `chats`
- ✅ `messages`
- ✅ `memories`

No additional database setup needed!

### 4. Start the App

```bash
npm run dev
```

The app will start at: http://localhost:5173

### 5. Start the Wav2Lip Backend (Optional)

If using Wav2Lip for lip-sync videos:

```bash
cd /Users/malakyehia/projects/BuddyTalk/wav2lip-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

---

## First-Time Usage

### Test Flow:

1. **Visit http://localhost:5173**
   - You'll see the landing page

2. **Create New Family**
   - Click "Create New Family"
   - Write down your family code (e.g., "HAPPY-DOLPHIN-42")
   - Click "Let's Go!"

3. **Add Your First Profile**
   - Click the "Add Kid" card
   - Say or type your name
   - Say or type your age
   - Pick an avatar
   - Click "Done"

4. **Select a Character**
   - Click on Elsa or Ariel
   - You'll see the chat history screen

5. **Start a Conversation**
   - Click "Start New Chat"
   - Talk to the character!
   - Say "bye" to exit

6. **Return Later**
   - Your chat will be saved
   - Enter your family code to return
   - Continue where you left off

---

## File Structure Overview

```
buddytalk-app/
├── src/
│   ├── components/
│   │   ├── Landing/
│   │   │   └── Landing.jsx          ✨ NEW - Family code system
│   │   ├── UserSelect/
│   │   │   ├── UserSelect.jsx       ✅ Updated - Uses Supabase
│   │   │   ├── AddUser.jsx          ✅ Updated - 3-step process
│   │   │   ├── EditUser.jsx         ✅ Updated - Supabase saves
│   │   │   └── UserCard.jsx         ✅ Updated - avatar_url
│   │   ├── CharacterSelect/
│   │   │   ├── CharacterSelect.jsx
│   │   │   ├── CharacterCard.jsx
│   │   │   └── ChatHistory.jsx      ✨ NEW - Chat management
│   │   └── Conversation/
│   │       ├── Conversation.jsx      ⚠️ Needs integration
│   │       ├── Avatar.jsx
│   │       └── Controls.jsx
│   │
│   ├── hooks/
│   │   ├── useAudio.js
│   │   ├── useConversation.js
│   │   ├── useAvatar.js
│   │   └── useConversationWithDB.js  ✨ NEW - Enhanced hook
│   │
│   ├── services/
│   │   ├── database.js               ✨ NEW - Supabase operations
│   │   ├── claudeApi.js              ✅ Updated - Utility functions
│   │   ├── geminiApi.js              ✅ Updated - System override
│   │   ├── fishAudioApi.js
│   │   ├── wav2lipApi.js
│   │   └── audioService.js
│   │
│   ├── config/
│   │   ├── supabase.js               ✨ NEW - Client config
│   │   ├── characters.js             ✅ Updated - Added emojis
│   │   └── prompts.js
│   │
│   └── App.jsx                        ✅ Updated - Full flow
│
└── .env                               ⚠️ Configure your keys
```

---

## Configuration Checklist

Before running:

- [ ] `npm install` completed
- [ ] `.env` file created with API keys
- [ ] Gemini API key added to `.env`
- [ ] Fish Audio key added (if using voice cloning)
- [ ] Supabase credentials verified
- [ ] Backend running (if using Wav2Lip)

---

## Testing Checklist

After starting:

- [ ] Landing page loads
- [ ] Can create new family code
- [ ] Family code is displayed and copied
- [ ] Can enter existing family code
- [ ] Profile selection shows
- [ ] Can add new profile with voice/text
- [ ] Avatar picker works
- [ ] Can edit existing profile
- [ ] Character selection shows Elsa and Ariel
- [ ] Chat history screen appears
- [ ] Can start new chat
- [ ] Conversation works (voice or text)
- [ ] Messages are saved (check by exiting and returning)
- [ ] Can continue previous chat
- [ ] Can rename chat
- [ ] Memory system works (have a conversation, exit, return, mention same topic)

---

## Troubleshooting

### "Speech recognition not supported"
- Use Chrome or Edge browser (Safari doesn't support Web Speech API well)

### "Supabase error"
- Check your `.env` file has correct Supabase credentials
- Verify Supabase tables are created

### "No character response"
- Check Gemini API key in `.env`
- Check console for API errors
- Verify you have internet connection

### "Wav2Lip not working"
- Ensure backend is running on port 8000
- Check backend logs for errors
- Voice cloning requires Fish Audio API key

### "Family code not working"
- Codes are case-insensitive
- Format: WORD-WORD-NUMBER (e.g., HAPPY-DOLPHIN-42)
- Check if family was created in Supabase

### "Profile not showing"
- Check browser console for errors
- Verify profile was created in Supabase
- Try refreshing the page

---

## Important Notes

### Data Storage:
- All data is stored in **Supabase** (cloud database)
- Only the family code is stored in **localStorage** (browser)
- Clearing browser data will only remove the family code
- Your actual data (profiles, chats, messages) is safe in Supabase

### Family Codes:
- Generated format: `ADJECTIVE-ANIMAL-NUMBER`
- Examples: `HAPPY-DOLPHIN-42`, `BRAVE-TIGER-7`, `MAGIC-PANDA-99`
- Case-insensitive when entering
- Use same code on different devices to access the same family

### Voice Features:
- Speech-to-Text (STT): Uses browser's Web Speech API (free, works offline)
- Text-to-Speech (TTS): Browser's built-in TTS or Fish Audio (premium)
- Voice cloning: Requires Fish Audio API key

### AI Features:
- Conversations: Powered by Gemini API or Claude API
- Memory extraction: Automatic using Claude/Gemini
- Level assessment: Automatic after 5+ exchanges
- Chat titles: Auto-generated after 3-4 exchanges

---

## Next Steps

1. **Run the app** and test the full flow
2. **Add more characters** (see CHARACTER_GUIDE.md)
3. **Customize voices** in character configs
4. **Update character images** in `/public/assets/`
5. **Integrate Conversation component** with new DB hook (see IMPLEMENTATION_SUMMARY.md)

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify `.env` configuration
3. Check Supabase database has all tables
4. Review IMPLEMENTATION_SUMMARY.md for details

---

## Development vs Production

### Development (Current):
- Local server: `npm run dev`
- Hot reload enabled
- Console logs visible
- API keys in `.env` file

### Production (When Ready):
- Build: `npm run build`
- Deploy to Vercel/Netlify
- Set environment variables in hosting platform
- Enable CORS for Supabase if needed

---

**Ready to start!** Run `npm run dev` and visit http://localhost:5173
