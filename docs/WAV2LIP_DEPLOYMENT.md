# Wav2Lip Backend - Deployment Guide

## Overview

This guide covers deploying the Wav2Lip backend to production. The main challenge is that Wav2Lip requires:
- Python 3.11 (for old librosa compatibility)
- Large model files (~140MB each)
- GPU for better performance (optional but recommended)

---

## Deployment Options

### Option 1: Cloud VM with GPU (Recommended for Production)

**Best for:** Production with good performance
**Cost:** Medium ($50-200/month depending on GPU)
**Platforms:** AWS EC2, Google Cloud Compute, Azure VM, DigitalOcean GPU Droplets

#### Steps:

1. **Choose GPU Instance**
   - AWS: `g4dn.xlarge` (NVIDIA T4 GPU)
   - Google Cloud: `n1-standard-4` with NVIDIA T4
   - Azure: `NC6` or `NC6s_v3`

2. **Setup Script** (run on fresh Ubuntu 22.04):

```bash
#!/bin/bash
# Update system
sudo apt-get update
sudo apt-get install -y python3.11 python3.11-venv python3-pip git ffmpeg cmake

# Install CUDA (for GPU support)
# Follow: https://developer.nvidia.com/cuda-downloads

# Clone your repo
cd /home/ubuntu
git clone <your-repo-url> BuddyTalk
cd BuddyTalk/wav2lip-backend

# Create venv with Python 3.11
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy models (upload separately or download)
mkdir -p models
# Upload Wav2Lip-SD-GAN.pt to models/

# Install Wav2Lip dependencies in separate venv
python3.11 -m venv wav2lip-venv
source wav2lip-venv/bin/activate
pip install librosa==0.7.0 numpy==1.17.1 opencv-python torch torchvision tqdm numba

# Clone Wav2Lip (or copy from local)
git clone https://github.com/Rudrabha/Wav2Lip.git
cd Wav2Lip
pip install -r requirements.txt
cd ..

# Download face detection model
mkdir -p Wav2Lip/face_detection/detection/sfd
wget https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth \
  -O Wav2Lip/face_detection/detection/sfd/s3fd.pth

# Install PM2 or systemd for process management
npm install -g pm2

# Run backend
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name wav2lip-backend
pm2 save
pm2 startup
```

3. **Update inference.py path**:
```python
# In wav2lip_inference.py, change:
WAV2LIP_DIR = Path("/home/ubuntu/BuddyTalk/wav2lip-backend/Wav2Lip")
```

---

### Option 2: Docker Container (Best for Portability)

**Best for:** Easy deployment, reproducibility
**Cost:** Low-High (depending on hosting)
**Platforms:** AWS ECS, Google Cloud Run, Azure Container Instances, Fly.io

#### Dockerfile:

```dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# Install Python 3.11
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    git \
    ffmpeg \
    cmake \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend code
COPY wav2lip-backend /app

# Install backend dependencies
RUN python3.11 -m venv venv && \
    . venv/bin/activate && \
    pip install -r requirements.txt

# Install Wav2Lip
RUN git clone https://github.com/Rudrabha/Wav2Lip.git && \
    python3.11 -m venv Wav2Lip/venv && \
    . Wav2Lip/venv/bin/activate && \
    cd Wav2Lip && \
    pip install -r requirements.txt

# Download face detection model
RUN mkdir -p Wav2Lip/face_detection/detection/sfd && \
    wget https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth \
    -O Wav2Lip/face_detection/detection/sfd/s3fd.pth

# Copy models (add models to image or mount as volume)
COPY models /app/models

EXPOSE 8000

CMD ["/app/venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t wav2lip-backend .
docker run -p 8000:8000 --gpus all wav2lip-backend
```

---

### Option 3: Serverless (AWS Lambda with EFS or Google Cloud Run)

**Best for:** Low traffic, cost optimization
**Cost:** Very Low (pay per use)
**Challenges:** Cold starts, model file size limits

#### AWS Lambda + EFS Setup:

1. **Create EFS file system** and mount to Lambda
2. **Upload models to EFS**: `/mnt/efs/models/`
3. **Use Lambda container image** (10GB limit)
4. **Set timeout to 5 minutes**

Not recommended for real-time due to cold starts, but good for async processing.

---

### Option 4: Dedicated Server (Self-hosted)

**Best for:** Full control, dedicated resources
**Cost:** Hardware dependent
**Platforms:** Your own server, Hetzner, OVH

Same setup as Option 1 but on your own hardware.

---

## Pre-Deployment Checklist

### 1. Update Paths for Production

Create a config file for environment-specific paths:

```python
# wav2lip-backend/app/config.py
import os
from pathlib import Path

# Detect environment
IS_PRODUCTION = os.getenv("ENVIRONMENT") == "production"

if IS_PRODUCTION:
    WAV2LIP_DIR = Path("/home/ubuntu/BuddyTalk/wav2lip-backend/Wav2Lip")
    MODELS_DIR = Path("/home/ubuntu/BuddyTalk/wav2lip-backend/models")
else:
    # Local development
    WAV2LIP_DIR = Path("/Users/malakyehia/projects/test-lip-sync/Wav2Lip")
    MODELS_DIR = Path(__file__).parent.parent / "models"
```

Then update `wav2lip_inference.py`:
```python
from .config import WAV2LIP_DIR, MODELS_DIR
```

### 2. Upload Models

Models are large (~140MB each):
```bash
# SCP to server
scp models/Wav2Lip-SD-GAN.pt user@server:/path/to/backend/models/

# Or use cloud storage
aws s3 cp models/Wav2Lip-SD-GAN.pt s3://your-bucket/models/
```

### 3. Environment Variables

Create `.env` for production:
```bash
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend.com
LOG_LEVEL=INFO
```

Update CORS in `main.py`:
```python
import os
allow_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
```

### 4. Add Rate Limiting

```bash
pip install slowapi
```

```python
# In main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/generate-lipsync")
@limiter.limit("5/minute")  # 5 requests per minute
async def create_lipsync_video(...):
    ...
```

### 5. Process Manager

Use PM2, systemd, or supervisor to keep backend running:

**PM2:**
```bash
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name wav2lip
pm2 save
pm2 startup
```

**Systemd:**
```ini
# /etc/systemd/system/wav2lip.service
[Unit]
Description=Wav2Lip Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/BuddyTalk/wav2lip-backend
ExecStart=/home/ubuntu/BuddyTalk/wav2lip-backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### 6. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;  # Long timeout for video generation
    }
}
```

---

## Performance Optimization

### 1. Use GPU

Install PyTorch with CUDA:
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

### 2. Cache Results (Optional)

Store generated videos temporarily:
```python
# Use Redis or file-based cache
# Key: hash(character_id + audio_hash)
# Value: video path
```

### 3. Queue System for High Traffic

Use Celery + Redis for async processing:
```bash
pip install celery redis
```

```python
# tasks.py
from celery import Celery

celery = Celery('wav2lip', broker='redis://localhost:6379')

@celery.task
def generate_video_async(character_id, audio_path):
    # Generate video
    # Upload to S3
    # Return URL
```

---

## Monitoring

### 1. Logging

Already added! Check logs:
```bash
tail -f /var/log/wav2lip.log
```

Logs will show:
- 🎬 Model being used
- 📁 Model path
- 🎥 Generation start
- ✅ Success with file size
- ❌ Errors

### 2. Health Checks

Already have `/health` endpoint. Add to monitoring:
```bash
# Cron job to check health
*/5 * * * * curl -f http://localhost:8000/health || systemctl restart wav2lip
```

### 3. Metrics (Optional)

Add Prometheus metrics:
```bash
pip install prometheus-fastapi-instrumentator
```

---

## Cost Estimates

### AWS (GPU Instance)
- **g4dn.xlarge**: ~$0.526/hour = ~$380/month
- **Storage (EBS)**: ~$10/month for 100GB
- **Traffic**: Varies

### Google Cloud
- **n1-standard-4 + T4**: ~$0.35/hour = ~$250/month
- **Storage**: ~$8/month for 100GB

### DigitalOcean GPU Droplet
- **GPU Droplet**: ~$180/month
- Simpler setup, good for MVP

### Serverless (Low Traffic)
- **AWS Lambda**: ~$0.0000166/GB-second
- **Google Cloud Run**: ~$0.00002400/vCPU-second
- Good for <1000 requests/month

---

## Recommended Setup for MVP

**Platform**: DigitalOcean GPU Droplet or Google Cloud Compute
**Instance**: 4 vCPU, 16GB RAM, NVIDIA T4
**Storage**: 100GB SSD
**Cost**: ~$200-250/month

This gives you:
- Fast generation (5-10s instead of 30s)
- Reliable performance
- Easy scaling later

---

## Next Steps for Deployment

1. Choose platform (recommend DigitalOcean for simplicity)
2. Create instance with GPU
3. Run setup script
4. Upload models
5. Set environment to production
6. Test thoroughly
7. Set up monitoring
8. Configure domain + SSL

Let me know when you're ready to deploy and I can help with specific platform setup!
