/**
 * Audio Recorder Utility
 * Records audio from the browser (including TTS playback) using MediaRecorder
 */

export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  /**
   * Start recording system audio
   * Note: This records the tab's audio output (including TTS)
   */
  async startRecording() {
    try {
      // Get display media with audio (this captures tab audio including TTS)
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('🎙️ Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return audio blob
   * @returns {Promise<Blob>} Audio blob (webm format)
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        console.log('🎙️ Recording stopped. Blob size:', audioBlob.size);

        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
        }

        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Check if currently recording
   */
  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}

/**
 * Simpler approach: Use Web Audio API to capture TTS output
 * This doesn't require screen sharing permission
 */
export class TTSAudioCapture {
  constructor() {
    this.audioContext = null;
    this.destination = null;
    this.recorder = null;
    this.chunks = [];
  }

  async setup() {
    // Create audio context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.destination = this.audioContext.createMediaStreamDestination();

    // Connect to audio context destination
    this.recorder = new MediaRecorder(this.destination.stream);

    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };
  }

  startCapture() {
    this.chunks = [];
    if (this.recorder) {
      this.recorder.start();
      console.log('🎤 TTS audio capture started');
    }
  }

  async stopCapture() {
    return new Promise((resolve) => {
      if (!this.recorder) {
        resolve(null);
        return;
      }

      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        console.log('🎤 TTS audio captured:', blob.size, 'bytes');
        resolve(blob);
      };

      this.recorder.stop();
    });
  }
}
