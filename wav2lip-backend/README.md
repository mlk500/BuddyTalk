# Wav2Lip Backend API

FastAPI backend for lip-sync video generation using Wav2Lip.

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd wav2lip-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Install Wav2Lip

Clone the official Wav2Lip repository:

```bash
git clone https://github.com/Rudrabha/Wav2Lip.git
cd Wav2Lip
pip install -r requirements.txt
cd ..
```

### 3. Download Pretrained Models

Download the pretrained Wav2Lip model:

1. Go to [Wav2Lip Releases](https://github.com/Rudrabha/Wav2Lip/releases)
2. Download `wav2lip_gan.pth` (or `wav2lip.pth` for the non-GAN version)
3. Place it in the `models/` directory:

```bash
mkdir -p models
# Move the downloaded model file to models/
mv ~/Downloads/wav2lip_gan.pth models/
```

### 4. Install System Dependencies (if needed)

**For face detection (required by Wav2Lip):**

```bash
# macOS
brew install cmake

# Ubuntu/Debian
sudo apt-get install cmake libsm6 libxext6 libxrender-dev

# Windows - install Visual Studio Build Tools
```

### 5. Run the Backend

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 6. Test the API

Visit `http://localhost:8000/docs` for the interactive API documentation (Swagger UI).

## API Endpoints

### POST `/api/generate-lipsync`

Generate a lip-synced video.

**Request:**
- `video` (file): Input video file
- `audio` (file): Input audio file

**Response:**
- Returns the lip-synced video file

**Example using curl:**

```bash
curl -X POST "http://localhost:8000/api/generate-lipsync" \
  -F "video=@input_video.mp4" \
  -F "audio=@input_audio.wav" \
  --output result.mp4
```

### DELETE `/api/cleanup/{session_id}`

Clean up generated video file.

### GET `/health`

Health check endpoint.

## Project Structure

```
wav2lip-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   └── wav2lip_inference.py # Wav2Lip wrapper
├── models/                  # Pretrained models (download separately)
│   └── wav2lip_gan.pth
├── uploads/                 # Temporary upload storage
├── outputs/                 # Generated videos
├── Wav2Lip/                # Cloned Wav2Lip repository
├── requirements.txt
└── README.md
```

## Troubleshooting

### CUDA/GPU Support

If you have a CUDA-capable GPU, install the CUDA version of PyTorch:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Memory Issues

For large videos, you may need to:
- Reduce `face_det_batch_size` and `wav2lip_batch_size` in `wav2lip_inference.py`
- Resize input videos before processing

### Face Detection Errors

If face detection fails:
- Ensure the video contains a clear, frontal face
- Try adjusting the `pads` parameter in `wav2lip_inference.py`

## Integration with React App

The React frontend is configured to call this backend. Make sure:

1. Backend is running on `http://localhost:8000`
2. CORS is properly configured (already set in `main.py`)
3. Environment variable is set in React app (`.env`):
   ```
   VITE_WAV2LIP_API_URL=http://localhost:8000
   ```

See the React app's `useWav2Lip` hook for usage examples.

## Production Deployment

For production:

1. Use a production ASGI server (Gunicorn with Uvicorn workers)
2. Set up proper file storage (S3, Cloud Storage)
3. Add authentication/rate limiting
4. Use a reverse proxy (nginx)
5. Consider GPU instances for better performance

Example production command:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
