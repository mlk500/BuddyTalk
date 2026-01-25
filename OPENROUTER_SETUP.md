# OpenRouter Integration - Complete Guide

## Overview

BuddyTalk now uses **OpenRouter API** with **FREE models by default** - no rate limits like Gemini!

### Benefits:
- ✅ **Completely FREE** - No credits needed for basic usage
- ✅ **No rate limits** - Unlike Gemini which blocks after a few requests
- ✅ **Multiple fallbacks** - 4 free models automatically try if one fails
- ✅ **Optional paid upgrade** - Better quality for demos (~$0.30 per session)
- ✅ **Cost tracking** - See exactly what you use in console

---

## Quick Start (2 Minutes)

### 1. Get API Key
1. Visit: https://openrouter.ai/keys
2. Sign up/login
3. Click "Create Key"
4. Copy your key (starts with `sk-or-v1-...`)

### 2. Add to .env
```bash
cd buddytalk-app
# Copy example if needed
cp .env.example .env
```

Edit `.env`:
```env
VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR-KEY-HERE
```

### 3. Start
```bash
npm run dev
```

**That's it!** No credits needed - uses FREE models automatically.

---

## Default Configuration (FREE Mode)

By default, BuddyTalk uses **only FREE models** with automatic fallbacks:

1. `google/gemini-2.0-flash-exp:free` - Best quality, 1M context
2. `meta-llama/llama-3.3-70b-instruct:free` - Great conversations
3. `qwen/qwen-2.5-7b-instruct:free` - Good balance
4. `mistralai/mistral-small-3.1-24b-instruct:free` - Reliable

**Cost**: $0 (completely free)
**Rate limits**: None
**Credits required**: $0

Console output:
```
🆓 Using FREE mode: 4 free models available
🤖 Trying 🆓 FREE model 1/4: google/gemini-2.0-flash-exp:free
💰 Token usage: { cost: "Free" }
```

---

## Optional: Paid Mode (For Final Demo)

If you want the **absolute best quality** for your demo recording:

### Enable Paid Mode

1. **Add credits** (one-time):
   - Go to: https://openrouter.ai/credits
   - Add $5 (way more than needed - ~$0.30 per demo)
   - Credits never expire

2. **Edit .env**:
   ```env
   VITE_OPENROUTER_USE_PAID=true
   ```

3. **Restart**:
   ```bash
   npm run dev
   ```

### Paid Model Configuration

**Primary**: `google/gemini-2.0-flash-001`
- Cost: $0.10 input, $0.40 output (per 1M tokens)
- Context: 1M tokens
- Quality: Excellent
- **Fallbacks**: Still has all 4 FREE models as backup

**Typical costs**:
- 1 conversation (10 exchanges): ~$0.01
- Demo video (full session): ~$0.30
- 100 conversations: ~$1.00

Console output:
```
💰 Using PAID mode: google/gemini-2.0-flash-001 with 4 free fallbacks
💰 Token usage: { cost: "$0.000034" }
```

### Switch Back to Free

Comment out or remove:
```env
# VITE_OPENROUTER_USE_PAID=false
```

---

## How to Use

### Recommended Workflow

**During Development** (default):
```env
# .env - nothing needed, FREE by default
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```
**Cost**: $0

**Recording Final Demo**:
```env
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_OPENROUTER_USE_PAID=true  # Enable for best quality
```
**Cost**: ~$0.30

**After Recording**:
```env
VITE_OPENROUTER_API_KEY=sk-or-v1-...
# VITE_OPENROUTER_USE_PAID=false  # Back to FREE
```
**Cost**: $0

---

## Monitoring Usage

### Browser Console

Every request shows detailed info:

```javascript
🆓 Using FREE mode: 4 free models available
🤖 Trying 🆓 FREE model 1/4: google/gemini-2.0-flash-exp:free
✅ OpenRouter API response: { model: "...", usage: {...} }
💰 Token usage: {
  prompt: 125,
  completion: 45,
  total: 170,
  cost: "Free"  // or "$0.000034" for paid
}
```

### OpenRouter Dashboard

Track all usage at: https://openrouter.ai/activity

---

## Fallback System

**Reliability through redundancy** - if one model fails, automatically tries the next:

```
Try Model 1: google/gemini-2.0-flash-exp:free
   ↓ (if fails)
Try Model 2: meta-llama/llama-3.3-70b-instruct:free
   ↓ (if fails)
Try Model 3: qwen/qwen-2.5-7b-instruct:free
   ↓ (if fails)
Try Model 4: mistralai/mistral-small-3.1-24b-instruct:free
   ↓ (if all fail)
Show friendly error message
```

**In paid mode**, the paid model is tried first, then all free models.

This means your app will **almost never fail** completely!

---

## Troubleshooting

### Error: "Using fallback response for testing"

**Cause**: OpenRouter API key not configured

**Solution**:
1. Check `.env` has: `VITE_OPENROUTER_API_KEY=sk-or-v1-...`
2. Restart dev server: `npm run dev`

### Error: "OpenRouter API error: 401"

**Cause**: Invalid API key

**Solution**:
1. Get new key: https://openrouter.ai/keys
2. Make sure you copied the full key
3. Update `.env`
4. Restart dev server

### Error: "OpenRouter API error: 402"

**Cause**: Trying to use paid model without credits

**Solution** (choose one):
- **Option A**: Add credits at https://openrouter.ai/credits
- **Option B**: Remove `VITE_OPENROUTER_USE_PAID=true` from `.env` (use FREE)

**Recommended**: Use FREE mode (no credits needed)

### All Models Failing

**Cause**: OpenRouter might be experiencing issues (rare)

**Solution**:
1. Check status: https://status.openrouter.ai
2. Wait a few minutes and try again
3. Check your internet connection

---

## Cost Comparison

### Your $5 Budget Breakdown

| Activity | FREE Mode | PAID Mode | Recommended |
|----------|-----------|-----------|-------------|
| Development (weeks) | $0 | ~$1-2 | FREE |
| Testing features | $0 | ~$0.10 | FREE |
| Demo recording | $0 | ~$0.30 | PAID (best quality) |
| Live presentation | $0 | ~$0.20 | PAID or FREE |
| Staff grading | $0 | ~$0.50 | PAID or FREE |
| **TOTAL** | **$0** | **~$1-2** | Mix of both |

### Budget-Conscious Strategy

**Minimum spend**: $0.30
- Use FREE for everything
- Switch to PAID only for final demo recording
- Switch back to FREE immediately after

**Balanced approach**: ~$1-2
- Use FREE for development
- Use PAID for demo + presentation + grading
- Plenty of buffer with $5 budget

---

## Advanced Configuration

### Changing Models

Edit `/src/services/openRouterApi.js`:

```javascript
const MODELS = {
  FREE: [
    'google/gemini-2.0-flash-exp:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    // Add more from: https://openrouter.ai/models?order=cheapest
  ],
  PAID: 'google/gemini-2.0-flash-001', // Change to any paid model
};
```

Browse models: https://openrouter.ai/models

### Popular Alternatives

**Other good FREE models**:
- `qwen/qwen3-coder:free` - Good for technical conversations
- `nvidia/nemotron-3-nano-30b-a3b:free` - Fast responses
- `mistralai/devstral-2512:free` - Coding-focused

**Other good PAID models**:
- `anthropic/claude-3.5-sonnet` - Best quality ($6/$30 per 1M tokens)
- `openai/gpt-4o-mini` - Cheap OpenAI ($0.15/$0.60 per 1M tokens)
- `google/gemini-2.5-flash` - Newer version ($0.30/$2.50 per 1M tokens)

---

## Why OpenRouter > Direct Gemini?

| Feature | OpenRouter | Direct Gemini |
|---------|-----------|---------------|
| **FREE models** | ✅ Yes (4+ options) | ❌ Limited |
| **Rate limits** | ✅ None on free | ❌ Very strict |
| **Automatic fallbacks** | ✅ Yes | ❌ No |
| **Cost tracking** | ✅ Built-in | ❌ Manual |
| **Multiple providers** | ✅ 600+ models | ❌ Gemini only |
| **Reliability** | ✅ High (fallbacks) | ❌ Single point of failure |

**TL;DR**: OpenRouter is more reliable and flexible than direct Gemini API.

---

## Environment Variables Reference

```env
# Required - Get from https://openrouter.ai/keys
VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Optional - Default: false (uses FREE models)
# Set to true to use paid model with free fallbacks
VITE_OPENROUTER_USE_PAID=false
```

---

## Testing Your Setup

### 1. Check Console on Startup

After `npm run dev`, open browser console and start a conversation.

**FREE mode** (default):
```
🆓 Using FREE mode: 4 free models available
🤖 Trying 🆓 FREE model 1/4: google/gemini-2.0-flash-exp:free
✅ OpenRouter API response: {...}
💰 Token usage: { cost: "Free" }
```

**PAID mode** (if enabled):
```
💰 Using PAID mode: google/gemini-2.0-flash-001 with 4 free fallbacks
🤖 Trying 💰 PAID model 1/5: google/gemini-2.0-flash-001
✅ OpenRouter API response: {...}
💰 Token usage: { cost: "$0.000034" }
```

### 2. Test Fallback

Temporarily break your API key to test fallbacks:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-INVALID-KEY
```

Should see:
```
❌ Model 1/4 failed: OpenRouter API error: 401
🔄 Trying next model...
```

Then restore your real key.

---

## Summary

### Quick Reference

**Setup**:
1. Get API key: https://openrouter.ai/keys
2. Add to `.env`: `VITE_OPENROUTER_API_KEY=...`
3. Run: `npm run dev`

**Cost**:
- FREE mode: $0 (default)
- PAID mode: ~$0.01 per conversation

**Switching**:
- FREE (default): Don't add `VITE_OPENROUTER_USE_PAID` to `.env`
- PAID: Add `VITE_OPENROUTER_USE_PAID=true` to `.env`

**Models**:
- FREE: 4 models with automatic fallbacks
- PAID: 1 paid model + 4 free fallbacks

---

## Support & Resources

- **OpenRouter Docs**: https://openrouter.ai/docs
- **Models List**: https://openrouter.ai/models
- **Usage Dashboard**: https://openrouter.ai/activity
- **Status Page**: https://status.openrouter.ai
- **Discord Support**: https://discord.gg/openrouter

---

**You're all set! Enjoy unlimited FREE conversations!** 🎉
