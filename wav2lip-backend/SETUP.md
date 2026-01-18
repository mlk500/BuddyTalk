# Backend Setup Guide

## Quick Setup (Recommended)

Since you already have a working Wav2Lip setup in `test-lip-sync`, we'll reuse it!

### Step 1: Install Backend Dependencies

```bash
cd /Users/malakyehia/projects/BuddyTalk/wav2lip-backend

# Activate your venv (if not already activated)
source venv/bin/activate

# Install modern dependencies
pip install -r requirements.txt
```

### Step 2: You're Done!

The backend is configured to use your existing Wav2Lip from:
```
/Users/malakyehia/projects/test-lip-sync/Wav2Lip
```

It will automatically:
- Use the Wav2Lip installation from test-lip-sync
- Find the model checkpoint (looks in test-lip-sync or local models/)
- Call it via subprocess

### Step 3: Run the Backend

```bash
# Make sure you're in wav2lip-backend with venv activated
uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/docs to see the API.

---

## Alternative: Create Separate Wav2Lip venv (Optional)

If you want a dedicated environment for Wav2Lip:

```bash
cd /Users/malakyehia/projects/BuddyTalk/wav2lip-backend

# Install Python 3.10 if needed
brew install python@3.10

# Create venv with Python 3.10
python3.10 -m venv wav2lip-venv

# Activate it
source wav2lip-venv/bin/activate

# Install Wav2Lip dependencies from your test project
pip install -r /Users/malakyehia/projects/test-lip-sync/Wav2Lip/requirements.txt

# Install Wav2Lip in editable mode
pip install -e /Users/malakyehia/projects/test-lip-sync/Wav2Lip

# Deactivate
deactivate
```

The backend will automatically detect and use `wav2lip-venv/bin/python` if it exists.

---

## Testing

### Test the API:

```bash
# Health check
curl http://localhost:8000/health

# Generate lip-sync (example)
curl -X POST "http://localhost:8000/api/generate-lipsync" \
  -F "video=@/path/to/image.jpg" \
  -F "audio=@/path/to/audio.wav" \
  --output result.mp4
```

---

## Where Models Are Searched

The backend looks for model checkpoints in this order:

1. `wav2lip-backend/models/wav2lip_gan.pth`
2. `/Users/malakyehia/projects/test-lip-sync/Wav2Lip/checkpoints/wav2lip_gan.pth`
3. Any `.pth` file in `wav2lip-backend/models/`

So you can either:
- Copy model from test-lip-sync to here
- Or just keep using the one in test-lip-sync (automatic)

---

## Troubleshooting

### "Wav2Lip inference.py not found"
Make sure `/Users/malakyehia/projects/test-lip-sync/Wav2Lip/inference.py` exists.

### "No model checkpoint found"
Copy the model file:
```bash
cp /Users/malakyehia/projects/test-lip-sync/Wav2Lip/checkpoints/*.pth \
   /Users/malakyehia/projects/BuddyTalk/wav2lip-backend/models/
```

### Dependencies conflicts
If you get dependency errors, create the separate `wav2lip-venv` as shown above.
