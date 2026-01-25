# BuddyTalk - Quick Setup Guide

## OpenRouter API Setup (5 Minutes)

### Why OpenRouter?
- ✅ **FREE models** - No rate limits like Gemini
- ✅ **Multiple fallbacks** - If one fails, tries another automatically
- ✅ **Optional paid upgrade** - Better quality for demos (~$0.30 per demo)
- ✅ **Simple setup** - Just API key, no complex config

---

## Step 1: Get OpenRouter API Key (2 minutes)

1. Go to **https://openrouter.ai**
2. Click "Sign Up" or "Log In"
3. Go to **Keys** section: https://openrouter.ai/keys
4. Click "Create Key"
5. Copy your API key (starts with `sk-or-v1-...`)

**Note**: You can use the app with $0 credits using FREE models!

---

## Step 2: Configure .env File (2 minutes)

**If you don't have .env yet:**
```bash
cd /Users/malakyehia/projects/BuddyTalk/buddytalk-app
cp .env.example .env
```

**Edit your .env file:**

Open `.env` and add your OpenRouter API key:

```env
# Paste your API key here
VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR-ACTUAL-KEY-HERE

# Keep this commented (or set to false) for FREE models
# VITE_OPENROUTER_USE_PAID=false
```

**That's it!** No credits needed, uses free models by default.

---

## Step 3: Start the App (1 minute)

```bash
cd /Users/malakyehia/projects/BuddyTalk/buddytalk-app
npm run dev
```

Look for this in the browser console after starting a conversation:

```
🆓 Using FREE mode: 4 free models available
🤖 Trying 🆓 FREE model 1/4: google/gemini-2.0-flash-exp:free
✅ OpenRouter API response: {...}
💰 Token usage: { cost: "Free" }
```

---

## Optional: Upgrade to Paid Model (For Demo/Presentation)

If you want **better quality** for your demo video or presentation:

### 1. Add Credits (One-time)
1. Go to https://openrouter.ai/credits
2. Add **$5** (way more than you need - ~$0.30 per demo)
3. Credits never expire

### 2. Enable Paid Model
Edit `.env`:
```env
VITE_OPENROUTER_USE_PAID=true
```

Restart server:
```bash
npm run dev
```

Console will show:
```
💰 Using PAID mode: google/gemini-2.0-flash-001 with 4 free fallbacks
```

**Cost**: ~$0.01 per conversation, ~$0.30 for full demo

### 3. Switch Back to Free
Just comment it out or set to false:
```env
# VITE_OPENROUTER_USE_PAID=false
```

---

## Free Models Used (No Cost, No Limits!)

The app tries these in order until one works:

1. **google/gemini-2.0-flash-exp:free** - Best quality free, 1M context
2. **meta-llama/llama-3.3-70b-instruct:free** - Great for conversations
3. **qwen/qwen-2.5-7b-instruct:free** - Good balance
4. **mistralai/mistral-small-3.1-24b-instruct:free** - Reliable backup

All completely FREE, no rate limits! 🎉

---

## Troubleshooting

### "Using fallback response for testing"
- **Issue**: API key not set or invalid
- **Fix**: Check `.env` has correct `VITE_OPENROUTER_API_KEY`
- **Fix**: Restart dev server: `npm run dev`

### "OpenRouter API error: 401"
- **Issue**: Invalid API key
- **Fix**: Get new key from https://openrouter.ai/keys
- **Fix**: Make sure you copied the full key (starts with `sk-or-v1-`)

### "OpenRouter API error: 402"
- **Issue**: Trying to use paid model without credits
- **Fix**: Either add credits OR set `VITE_OPENROUTER_USE_PAID=false`
- **Recommended**: Just use FREE models (default)

### All models showing errors
- **Issue**: OpenRouter might be down (rare)
- **Fix**: Check https://status.openrouter.ai
- **Note**: Try again in a few minutes

---

## Cost Comparison

| Scenario | Free Mode | Paid Mode |
|----------|-----------|-----------|
| Testing (100 convos) | $0 | ~$1.00 |
| Demo video (1 session) | $0 | ~$0.30 |
| Live presentation | $0 | ~$0.20 |
| Staff grading | $0 | ~$0.50 |
| **Total** | **$0** | **~$2.00** |

**Recommendation**: Use FREE for everything, only upgrade to paid for final demo recording if you want absolute best quality.

---

## Summary

✅ **Step 1**: Get API key from https://openrouter.ai/keys
✅ **Step 2**: Add to `.env` as `VITE_OPENROUTER_API_KEY=...`
✅ **Step 3**: Run `npm run dev`

**No credits needed, no rate limits, just works!** 🚀

For more details, see [OPENROUTER_SETUP.md](OPENROUTER_SETUP.md)
