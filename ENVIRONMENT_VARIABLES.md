# Environment Variables Reference

## Quick Guide

### VITE_ prefix variables
- ✅ Exposed to the browser (client-side)
- ⚠️ DO NOT put sensitive API keys here in production
- Use for: feature flags, public config, Supabase public keys

### Non-VITE variables
- 🔒 Only available to serverless functions (server-side)
- ✅ SAFE for API keys and secrets
- Use for: OpenRouter key, Fish Audio key

---

## Required Variables by Mode

### Local Development Mode

**File**: `buddytalk-app/.env`

```bash
# Deployment mode
VITE_ENABLE_LIPSYNC=true

# Database (required)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# API Keys (in browser - OK for local dev)
VITE_OPENROUTER_API_KEY=sk-or-v1-xxx
VITE_FISH_AUDIO_API_KEY=xxx

# Backend URL
VITE_WAV2LIP_API_URL=http://localhost:8000
```

### Vercel Deployment Mode

**Location**: Vercel Dashboard → Settings → Environment Variables

```bash
# ===== FRONTEND VARIABLES =====
VITE_ENABLE_LIPSYNC=false
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# ===== SERVERLESS FUNCTION VARIABLES =====
# These are SECRET - not exposed to browser
OPENROUTER_API_KEY=sk-or-v1-xxx
FISH_AUDIO_API_KEY=xxx
```

**IMPORTANT**:
- ❌ DO NOT set `VITE_OPENROUTER_API_KEY` on Vercel
- ❌ DO NOT set `VITE_FISH_AUDIO_API_KEY` on Vercel
- ✅ Use `OPENROUTER_API_KEY` and `FISH_AUDIO_API_KEY` instead (without VITE_ prefix)

---

## All Variables Explained

### Core Configuration

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `VITE_ENABLE_LIPSYNC` | Yes | Frontend | `true` = local mode with lip-sync<br>`false` = deployed mode (audio-only) |

### Database (Supabase)

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `VITE_SUPABASE_URL` | Yes | Frontend | Your Supabase project URL<br>Example: `https://abcdefg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Frontend | Public anon key (safe to expose)<br>Protected by Row Level Security |

### AI Chat (OpenRouter)

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `VITE_OPENROUTER_API_KEY` | Local only | Frontend | API key for local development<br>⚠️ DO NOT USE ON VERCEL |
| `OPENROUTER_API_KEY` | Vercel only | Serverless | API key for production<br>✅ Secret, not exposed to browser |
| `VITE_OPENROUTER_USE_PAID` | No | Frontend | `true` = use paid models<br>`false` = use free models (default) |
| `OPENROUTER_USE_PAID` | No | Serverless | Same as above, for serverless functions |

### Voice TTS (Fish Audio)

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `VITE_FISH_AUDIO_API_KEY` | Local only | Frontend | API key for local development<br>⚠️ DO NOT USE ON VERCEL |
| `FISH_AUDIO_API_KEY` | Vercel only | Serverless | API key for production<br>✅ Secret, not exposed to browser |

### Backend (Local Mode Only)

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `VITE_WAV2LIP_API_URL` | Local only | Frontend | Backend URL<br>Default: `http://localhost:8000` |

### Optional Features

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `VITE_CLAUDE_API_KEY` | No | Frontend | Claude API for memory extraction<br>Optional feature |

---

## Security Best Practices

### ✅ DO

- Use `VITE_` prefix for public configuration
- Use non-`VITE_` prefix for secrets on Vercel
- Keep Supabase anon key as `VITE_` (protected by RLS)
- Store real API keys in Vercel environment variables
- Use `.env.example` files for templates

### ❌ DON'T

- Put API keys in `VITE_` variables on Vercel
- Commit `.env` or `.env.vercel` files to git
- Share API keys in public repos
- Hardcode secrets in source code

---

## Common Mistakes

### Mistake 1: API Key in Browser on Vercel

```bash
# ❌ WRONG - Exposes key to browser
VITE_OPENROUTER_API_KEY=sk-or-v1-secret123

# ✅ CORRECT - Serverless function only
OPENROUTER_API_KEY=sk-or-v1-secret123
```

### Mistake 2: Forgetting to Set Deployment Mode

```bash
# ❌ WRONG - Will try to use backend on Vercel (doesn't exist)
VITE_ENABLE_LIPSYNC=true

# ✅ CORRECT - Audio-only mode for Vercel
VITE_ENABLE_LIPSYNC=false
```

### Mistake 3: Missing Supabase Vars

```bash
# ❌ WRONG - App won't work without database
# (missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)

# ✅ CORRECT - Always include Supabase vars
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

---

## Checking Your Setup

### Local Development

```bash
cd buddytalk-app
npm run dev
```

Check console - should see:
- ✅ "🆓 Using FREE mode: 4 free models available"
- ✅ "🎤 Generating speech with Fish Audio..."
- ✅ Supabase connection working

### Vercel Deployment

Check Vercel logs - should see:
- ✅ Build successful
- ✅ Serverless functions deployed (`/api/tts`, `/api/chat`)
- ✅ No API key warnings in browser console

Check browser console:
- ❌ Should NOT see API keys printed
- ✅ Should see "mode: Vercel (deployed)"

---

## Getting API Keys

### OpenRouter
1. Go to https://openrouter.ai/keys
2. Sign in with Google
3. Click "Create Key"
4. Copy key (starts with `sk-or-v1-`)
5. Paste into Vercel env vars as `OPENROUTER_API_KEY`

### Fish Audio
1. Go to https://fish.audio
2. Create account
3. Go to API settings
4. Copy API key
5. Paste into Vercel env vars as `FISH_AUDIO_API_KEY`

### Supabase
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → API
4. Copy Project URL → `VITE_SUPABASE_URL`
5. Copy anon/public key → `VITE_SUPABASE_ANON_KEY`

---

## Troubleshooting

### "API key not configured"
- Check variable name (VITE_ vs non-VITE_)
- Check Vercel env vars are saved
- Redeploy after changing env vars

### "Cannot read environment variable"
- Restart dev server (`npm run dev`)
- Check `.env` file exists in `buddytalk-app/`
- Check variable starts with `VITE_`

### API calls failing on Vercel
- Check serverless function logs in Vercel dashboard
- Verify `FISH_AUDIO_API_KEY` is set (no VITE_ prefix)
- Verify `OPENROUTER_API_KEY` is set (no VITE_ prefix)
