/**
 * Generate pre-recorded goodbye audio and lip-sync video for Elsa
 * Run this once to create the cached files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FISH_AUDIO_API_KEY = '17a37369fb3e4bd7b8d70ba4ef53ce85';
const FISH_AUDIO_MODEL_ID = '4f333a3801c64778b778fc06a0f0077c';

async function generateGoodbyeAudio() {
  const text = "Bye! It was so fun talking to you! Come back soon!";

  console.log('🎤 Generating goodbye audio with Fish Audio...');

  const response = await fetch('https://api.fish.audio/v1/tts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FISH_AUDIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      reference_id: FISH_AUDIO_MODEL_ID,
      format: 'mp3',
      mp3_bitrate: 128,
    }),
  });

  if (!response.ok) {
    throw new Error(`Fish Audio API error: ${response.status} ${response.statusText}`);
  }

  const audioBlob = await response.arrayBuffer();
  const audioBuffer = Buffer.from(audioBlob);

  // Save audio file
  const audioPath = path.join(__dirname, 'buddytalk-app/public/prerecorded/elsa/goodbye.mp3');
  fs.writeFileSync(audioPath, audioBuffer);
  console.log('✅ Saved goodbye audio to:', audioPath);

  return audioBuffer;
}

async function generateGoodbyeVideo(audioBuffer) {
  console.log('🎬 Generating lip-sync video with Wav2Lip...');

  // Create form data
  const formData = new FormData();
  const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  formData.append('audio', audioBlob, 'goodbye.mp3');
  formData.append('character_id', 'elsa');

  const response = await fetch('http://localhost:5001/generate', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Wav2Lip API error: ${response.status} ${response.statusText}`);
  }

  const videoBlob = await response.arrayBuffer();
  const videoBuffer = Buffer.from(videoBlob);

  // Save video file
  const videoPath = path.join(__dirname, 'buddytalk-app/public/prerecorded/elsa/goodbye.mp4');
  fs.writeFileSync(videoPath, videoBuffer);
  console.log('✅ Saved goodbye video to:', videoPath);
}

async function main() {
  try {
    console.log('🚀 Generating pre-recorded goodbye for Elsa...\n');

    // Generate audio
    const audioBuffer = await generateGoodbyeAudio();

    // Generate video
    await generateGoodbyeVideo(audioBuffer);

    console.log('\n✅ Done! Goodbye audio and video generated successfully.');
    console.log('   Audio: buddytalk-app/public/prerecorded/elsa/goodbye.mp3');
    console.log('   Video: buddytalk-app/public/prerecorded/elsa/goodbye.mp4');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
