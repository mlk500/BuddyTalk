#!/bin/bash

# Generate pre-recorded goodbye audio and lip-sync video for Elsa
# This script generates the files once so they can be reused on every exit

set -e

echo "🚀 Generating pre-recorded goodbye for Elsa..."
echo ""

# Configuration
FISH_API_KEY="17a37369fb3e4bd7b8d70ba4ef53ce85"
FISH_MODEL_ID="4f333a3801c64778b778fc06a0f0077c"
GOODBYE_TEXT="Bye! It was so fun talking to you! Come back soon!"
OUTPUT_DIR="buddytalk-app/public/prerecorded/elsa"
AUDIO_FILE="$OUTPUT_DIR/goodbye.mp3"
VIDEO_FILE="$OUTPUT_DIR/goodbye.mp4"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Step 1: Generate audio with Fish Audio
echo "🎤 Generating goodbye audio with Fish Audio..."
curl -X POST "https://api.fish.audio/v1/tts" \
  -H "Authorization: Bearer $FISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"$GOODBYE_TEXT\",
    \"reference_id\": \"$FISH_MODEL_ID\",
    \"format\": \"mp3\",
    \"mp3_bitrate\": 128
  }" \
  --output "$AUDIO_FILE"

echo "✅ Audio saved to: $AUDIO_FILE"
echo ""

# Step 2: Generate lip-sync video with Wav2Lip
echo "🎬 Generating lip-sync video with Wav2Lip..."
echo "   (Make sure wav2lip-backend is running on http://localhost:5001)"

curl -X POST "http://localhost:5001/generate" \
  -F "audio=@$AUDIO_FILE" \
  -F "character_id=elsa" \
  --output "$VIDEO_FILE"

echo "✅ Video saved to: $VIDEO_FILE"
echo ""

echo "✅ Done! Goodbye audio and video generated successfully."
echo "   Audio: $AUDIO_FILE"
echo "   Video: $VIDEO_FILE"
echo ""
echo "💡 These files will be reused on every exit, saving API costs!"
