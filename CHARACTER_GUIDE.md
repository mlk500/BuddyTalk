# Character Addition Guide

This guide explains how to add new characters to BuddyTalk.

## Overview

**All character configuration is in ONE file:** `wav2lip-backend/characters/characters.json`

The frontend automatically reads this file and generates character cards. No manual syncing needed!

## Quick Start - Adding a New Character

To add a new character:

1. **Add character to `wav2lip-backend/characters/characters.json`**
2. **Add card image to `buddytalk-app/public/assets/`**
3. **Done!** The character will automatically appear in the app

### Example: Adding Rapunzel

**Step 1:** Edit `wav2lip-backend/characters/characters.json`:

```json
{
  "rapunzel": {
    "name": "Rapunzel",
    "emoji": "👸",
    "available": false,
    "card_image": "rapunzel.png",
    "media_type": "image",
    "media_file": null,
    "idle_media": null,
    "fish_audio_model_id": null,
    "voice_pitch": 1.0,
    "voice_rate": 1.0,
    "personality": "You are Rapunzel, the princess with magical long hair...",
    "greeting": "Hi there! I'm Rapunzel!",
    "description": "Tangled's Rapunzel character (not yet implemented)"
  }
}
```

**Step 2:** Add `rapunzel.png` to `buddytalk-app/public/assets/`

**Step 3:** Refresh the app - Rapunzel appears automatically! 🎉

## Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Character ID (key) | string | ✅ | Unique identifier (e.g., "elsa", "mickey") |
| `name` | string | ✅ | Display name (e.g., "Elsa") |
| `emoji` | string | ✅ | Emoji shown with name (e.g., "❄️") |
| `available` | boolean | ✅ | `true` = clickable, `false` = "Coming Soon" |
| `card_image` | string | ✅ | Filename in `buddytalk-app/public/assets/` |
| `media_type` | string | ✅ | Always use "image" |
| `media_file` | string | For lip-sync | Filename for lip-sync (in same directory) |
| `idle_media` | string | For idle animation | Path like "idle/elsa.gif" |
| `fish_audio_model_id` | string | For voice | Fish Audio voice model ID |
| `voice_pitch` | number | ✅ | Voice pitch (0.5-2.0, default 1.0) |
| `voice_rate` | number | ✅ | Speech rate (0.5-2.0, default 1.0) |
| `personality` | string | ✅ | System prompt for character |
| `greeting` | string | ✅ | First message to child |
| `description` | string | ✅ | Internal description |

## Making a Character Fully Available

To make a character clickable (not just "Coming Soon"):

1. **Set `available: true`**
2. **Add Fish Audio voice model ID**
3. **Add lip-sync image** (`media_file`)
4. **Add idle animation** (`idle_media`)
5. **Optional:** Generate pre-recorded goodbye:
   - Audio: `buddytalk-app/public/prerecorded/{id}/{id}-bye.mp3`
   - Video: `buddytalk-app/public/prerecorded/{id}/{id}-goodbye.mp4`

### Example: Fully Available Character

```json
{
  "elsa": {
    "name": "Elsa",
    "emoji": "❄️",
    "available": true,
    "card_image": "elsa-image.png",
    "media_type": "image",
    "media_file": "elsa2.png",
    "idle_media": "idle/elsa.gif",
    "fish_audio_model_id": "4f333a3801c64778b778fc06a0f0077c",
    "voice_pitch": 1.1,
    "voice_rate": 0.95,
    "personality": "You are Elsa, the Snow Queen...",
    "greeting": "Hello, little friend! I'm Elsa!",
    "description": "Frozen's Elsa character"
  }
}
```

## File Structure

```
wav2lip-backend/
  characters/
    characters.json           ← SINGLE SOURCE OF TRUTH
    elsa2.png                 ← Lip-sync images (media_file)
    moana.jpg
    idle/
      elsa.gif                ← Idle animations

buddytalk-app/
  public/
    assets/
      elsa-image.png          ← Card images (card_image)
      moana.jpg
      mickey.png
    prerecorded/
      elsa/
        elsa-bye.mp3          ← Optional goodbye audio
        elsa-goodbye.mp4      ← Optional goodbye video
```

## Current Characters

Characters are automatically loaded from the backend file. Current list:

- **Elsa** ❄️ - Available ✅
- **Mickey Mouse** 🐭 - Coming Soon
- **Minnie Mouse** 🎀 - Coming Soon
- **Moana** 🌊 - Coming Soon
- **Iron Man** 🦾 - Coming Soon
- **Cristiano Ronaldo** ⚽ - Coming Soon
- **Lionel Messi** ⚽ - Coming Soon

## Tips

### Card Image vs Lip-Sync Image
- **`card_image`**: What users see in character selection
- **`media_file`**: What Wav2Lip uses for video generation
- You can use the **same image** for both, or different ones

### Adding Multiple Characters Quickly
1. Add all entries to `wav2lip-backend/characters/characters.json`
2. Copy all card images to `buddytalk-app/public/assets/`
3. Refresh - all characters appear automatically!

### No More Manual Syncing
- ❌ No need to edit frontend `characters.json`
- ❌ No need to update multiple files
- ✅ Just edit one backend file and it's done!

## Troubleshooting

**Character not showing up?**
- Check JSON syntax (trailing commas, quotes)
- Verify character ID is unique
- Restart dev server

**Card image not loading?**
- Check `card_image` filename matches file in `assets/`
- Check file extension (.png, .jpg, .svg)
- Open browser console for 404 errors

**"Coming Soon" when it should work?**
- Set `available: true`
- Add `fish_audio_model_id`
- Add `media_file` (lip-sync image)

