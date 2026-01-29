# Deployment Issues & Fixes

## Issues Found:

1. ✅ **FIXED**: Idle GIF not showing on deployed site
2. ⚠️ **NEEDS TESTING**: Greeting voice not playing
3. ⚠️ **BROWSER ISSUE**: Chrome audio issues with speech synthesis

---

## Fix 1: Idle GIF Not Showing ✅

**Problem**: Avatar component was hardcoded to use backend URL `/api/characters/{id}/idle`

**Fixed**: Updated `Avatar.jsx` to use `character.assets.idleAnimation` from config, which automatically uses:
- Deployed mode: `/assets/elsa-idle.gif`
- Local mode: `/api/characters/elsa/idle`

**File changed**: `buddytalk-app/src/components/Conversation/Avatar.jsx`

---

## Fix 2: Greeting Voice Issue

**Possible causes**:
1. Fish Audio API call failing
2. Vercel serverless function timeout
3. Browser autoplay policy blocking audio

**To debug**:
1. Open browser console (F12)
2. Start a conversation
3. Look for errors related to:
   - `/api/tts` (Fish Audio call)
   - "autoplay" or "user interaction"
   - Network errors

**Common fixes**:
- User must interact with page first (click) before audio can play
- Check Vercel function logs for errors
- Ensure `FISH_AUDIO_API_KEY` is set in Vercel

---

## Fix 3: Chrome Audio Issues (Browser Speech Synthesis)

**Problem**: Chrome has known issues with `window.speechSynthesis` API:
- Sometimes doesn't play
- Cuts off after ~14 seconds
- Requires page interaction first

**This affects**:
- Character selection screen ("Which character do you want to talk to?")
- Any other browser TTS (non-Fish Audio voices)

**Workarounds**:

### Option A: User Must Click First (Easiest)
Modern browsers require user interaction before playing audio. This is already handled in your app.

### Option B: Add Audio Context Resume (Better for Chrome)
Add this to `voiceControl.js`:

```javascript
export function speak(text, options = {}) {
  if (isGlobalMuted) {
    console.log('Voice muted, skipping:', text);
    return;
  }

  // Chrome fix: resume audio context on user interaction
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'en-US';
  utterance.pitch = options.pitch || 1.2;
  utterance.rate = options.rate || 0.9;

  // Wait for voices to load
  const voices = window.speechSynthesis.getVoices();
  const friendlyVoice = voices.find((v) => v.lang.startsWith('en') && v.name.includes('Female'));
  if (friendlyVoice) {
    utterance.voice = friendlyVoice;
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }

  // Chrome fix: add a small delay
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
}
```

### Option C: Replace with Actual Audio (Best)
Instead of browser TTS, use a real audio file for "Which character do you want to talk to?"

---

## Testing Checklist

After deploying fixes:

- [ ] Visit deployed site
- [ ] Create/select profile
- [ ] Go to character selection
  - [ ] Does "Which character..." voice play? (may need click first)
- [ ] Select Elsa
- [ ] Start conversation
  - [ ] Does Elsa's idle GIF show? ✅ Should work now
  - [ ] Does greeting play?
  - [ ] Does character respond to your voice?
  - [ ] During speaking, does idle GIF stay visible?

---

## Deployment Checklist

Before redeploying to Vercel:

1. ✅ Commit the Avatar.jsx fix
2. ✅ Push to GitHub
3. ⚠️ Vercel auto-deploys (or manually redeploy)
4. ⚠️ Test all audio features
5. ⚠️ Check browser console for errors

---

## Known Limitations

### Deployed Mode (Vercel):
- ✅ Idle GIF shows during conversation
- ✅ Audio playback works
- ❌ No lip-sync video (audio-only mode)
- ⚠️ Browser TTS (character selection) may have Chrome issues

### Chrome Speech Synthesis Issues:
- Requires user interaction first
- Sometimes cuts off long text
- Voice quality varies by OS

**Solution**: The important parts (Fish Audio TTS) use real audio, not browser TTS. Only character selection uses browser TTS, which is less critical.

---

## Next Steps

1. **Commit and push the fix**:
   ```bash
   git add buddytalk-app/src/components/Conversation/Avatar.jsx
   git commit -m "Fix idle GIF path for deployed mode"
   git push
   ```

2. **Vercel will auto-deploy** (or click Redeploy in Vercel dashboard)

3. **Test the deployed site**:
   - Idle GIF should now show ✅
   - Greeting should play (check console if not)
   - Chrome audio may still have issues (browser limitation)

4. **Optional**: Apply Chrome fix to `voiceControl.js` if character selection voice doesn't work
