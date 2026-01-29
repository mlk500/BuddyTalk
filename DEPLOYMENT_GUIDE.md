# BuddyTalk Deployment Guide

## Quick Overview

BuddyTalk now supports **two deployment modes**:

### Mode 1: Vercel (Audio-Only) - FREE ✅ RECOMMENDED
- No backend needed
- Shows character GIF + plays audio
- All features except lip-sync video
- **Cost: $0/month** (Vercel hobby plan)

### Mode 2: Full Stack (with Lip-Sync) - EXPENSIVE
- Requires GPU backend for Wav2Lip
- Full lip-sync video generation
- **Cost: ~$50-100/month**

---

## Vercel Deployment (Recommended)

### 1. Prerequisites

Get these accounts/keys first:
- [ ] GitHub account (connect your repo)
- [ ] Vercel account (https://vercel.com)
- [ ] Supabase account (https://supabase.com) - FREE tier
- [ ] OpenRouter API key (https://openrouter.ai/keys) - FREE tier available
- [ ] Fish Audio API key (https://fish.audio)

### 2. Deploy to Vercel

**A. Import Project**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub: `mlk500/BuddyTalk`
4. **Root Directory**: Set to `buddytalk-app`
5. **Framework Preset**: Vite (should auto-detect)

**B. Environment Variables**

Add these in Vercel dashboard (Settings → Environment Variables):

```bash
# ===== FRONTEND VARIABLES (VITE_*) =====
VITE_ENABLE_LIPSYNC=false
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ===== SERVERLESS FUNCTION VARIABLES (SECRET) =====
# These are NOT exposed to the browser
OPENROUTER_API_KEY=sk-or-v1-xxxxx
FISH_AUDIO_API_KEY=your_fish_audio_key

# ===== OPTIONAL =====
VITE_OPENROUTER_USE_PAID=false
OPENROUTER_USE_PAID=false
```

**C. Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Your app is live! 🎉

### 3. Set Up Supabase Database

Run this SQL in Supabase SQL Editor:

```sql
-- See README.md for full schema
-- Create tables: families, profiles, chats, messages, memories, etc.
```

(Full schema available in [README.md](README.md#database-setup-supabase))

---

## Key Changes Made

### New Files Created

1. **`buddytalk-app/api/tts.js`** - Vercel serverless function for Fish Audio TTS
2. **`buddytalk-app/api/chat.js`** - Vercel serverless function for OpenRouter chat
3. **`buddytalk-app/.env.vercel.example`** - Example env vars for Vercel deployment
4. **`buddytalk-app/public/assets/elsa-idle.gif`** - Character idle animation (served directly)
5. **`buddytalk-app/public/assets/elsa-lipsync.png`** - Character lip-sync source image

### Modified Files

1. **`buddytalk-app/src/services/fishAudioApi.js`**
   - Detects deployment mode via `VITE_ENABLE_LIPSYNC`
   - Calls `/api/tts` (Vercel) when deployed
   - Calls `/api/fish-audio/tts` (backend) when local

2. **`buddytalk-app/src/services/openRouterApi.js`**
   - Detects deployment mode
   - Calls `/api/chat` (Vercel) when deployed
   - Calls OpenRouter directly when local

3. **`buddytalk-app/src/components/Conversation/Conversation.jsx`**
   - New `speakAudioOnly()` function for deployed mode
   - Conditionally uses lip-sync or audio-only based on `VITE_ENABLE_LIPSYNC`
   - Shows character GIF during speech (no video generation)

4. **`buddytalk-app/src/config/characters.js`**
   - Serves idle GIF from `/assets/` when deployed
   - Serves from backend `/api/characters/{id}/idle` when local

5. **`buddytalk-app/.env.example`**
   - Added `VITE_ENABLE_LIPSYNC` variable
   - Added notes about deployment mode

6. **`README.md`**
   - Complete rewrite of Deployment section
   - Added two deployment options with cost breakdown
   - Step-by-step Vercel deployment instructions

---

## How It Works

### Deployed Mode (Vercel)

```
Browser → Vercel Frontend → Vercel Serverless Functions → External APIs
                                     ↓
                              /api/tts → Fish Audio
                              /api/chat → OpenRouter
```

**Security**:
- API keys stored in Vercel environment (server-side)
- NOT exposed to browser
- Frontend calls `/api/tts` and `/api/chat` (same domain, no CORS)

### Local Mode (Development)

```
Browser → Vite Dev Server → Local Backend (FastAPI) → External APIs
                                  ↓
                            /api/fish-audio/tts → Fish Audio
                            /api/generate-lipsync → Wav2Lip
```

---

## Testing Locally Before Deploy

Test Vercel mode locally:

```bash
cd buddytalk-app

# Set deployment mode in .env
echo "VITE_ENABLE_LIPSYNC=false" >> .env

# Install Vercel CLI
npm install -g vercel

# Run in Vercel dev mode
vercel dev
```

This simulates Vercel's serverless functions on your machine.

---

## Troubleshooting

### "Fish Audio API key not configured"
- Check Vercel environment variables
- Ensure `FISH_AUDIO_API_KEY` is set (without VITE_ prefix)
- Redeploy after adding env vars

### "OpenRouter API error: 401"
- Check `OPENROUTER_API_KEY` in Vercel
- Ensure key starts with `sk-or-v1-`
- Don't set `VITE_OPENROUTER_API_KEY` on Vercel (security risk)

### Character image not loading
- Check files exist in `buddytalk-app/public/assets/`
- Current files: `elsa-image.png`, `elsa-idle.gif`, `elsa-lipsync.png`
- Ensure Vercel build includes `/public` folder

### Serverless function timeout
- Fish Audio TTS can take 5-10 seconds
- Vercel hobby plan: 10s timeout (should be OK)
- If timeout issues, upgrade to Pro plan (60s timeout)

---

## Next Steps

After deploying:
1. Share the Vercel URL with users
2. Test conversation flow end-to-end
3. Monitor Vercel logs for errors
4. Check OpenRouter usage/costs at https://openrouter.ai/activity
5. Monitor Fish Audio credits

---

## Cost Breakdown

### Vercel Deployment (Audio-Only)

| Service | Free Tier | Paid Tier | What You Need |
|---------|-----------|-----------|---------------|
| Vercel | 100GB bandwidth/month | $20/month Pro | Free tier is fine |
| Supabase | 500MB database, 1GB storage | $25/month Pro | Free tier is fine |
| OpenRouter | FREE models available | Pay per token | Use FREE models |
| Fish Audio | Credits-based | ~$0.01 per 200 chars | Buy credits as needed |

**Total monthly cost**: **$0-10** (mostly Fish Audio credits)

### Full Stack (With Lip-Sync)

Same as above, plus:
- GPU server: $50-100/month (RunPod, Railway, AWS)
- **Total**: **$50-110/month**

---

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Review this guide
4. Check README.md troubleshooting section
