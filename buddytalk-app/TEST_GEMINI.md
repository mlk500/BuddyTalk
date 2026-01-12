# Test Gemini API Setup

## Quick Test

Open your browser console and run this to test Gemini API:

```javascript
// Test if Gemini API key is set
console.log('API Key set:', import.meta.env.VITE_GEMINI_API_KEY ? 'YES ✅' : 'NO ❌');

// Test Gemini API call
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Say hi in 5 words' }] }]
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Gemini API works!');
  console.log('Response:', data.candidates[0].content.parts[0].text);
})
.catch(err => {
  console.error('❌ Gemini API error:', err);
});
```

## Expected Results

If everything works, you should see:
```
API Key set: YES ✅
✅ Gemini API works!
Response: Hi there, how are you?
```

## Common Issues

### "API Key set: NO ❌"
**Fix:**
1. Make sure `.env` file exists
2. Contains: `VITE_GEMINI_API_KEY=your_key_here`
3. Restart dev server: `Ctrl+C` then `npm run dev`

### "API Key invalid"
**Fix:**
1. Go to https://aistudio.google.com/app/apikey
2. Create new key
3. Copy ENTIRE key (starts with "AI...")
4. Update `.env` file

### "Quota exceeded"
**Fix:**
- Gemini has free tier limits
- Check https://aistudio.google.com/ for quota
- Wait or upgrade plan
