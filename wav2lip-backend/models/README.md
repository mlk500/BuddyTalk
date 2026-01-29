# Pretrained Models

Download pretrained Wav2Lip models and place them in this directory.

## Download Links

Download from Google Drive: https://drive.google.com/drive/folders/153HLrqlBNxzZcHi17PEvP09kkAfzRshM

### Available Models:

- **Wav2Lip-SD-GAN.pt** (Recommended - better visual quality):
  - File size: ~200 MB
  - Best for production use
  - Slightly less accurate lip-sync but much better looking

- **Wav2Lip-SD-NOGAN.pt** (Alternative - more accurate sync):
  - File size: ~200 MB
  - More accurate lip synchronization
  - Lower visual quality

## Installation

```bash
# From wav2lip-backend directory
mkdir -p models
mv ~/Downloads/Wav2Lip-SD-GAN.pt models/
```

## Usage

After downloading, place the model file here:

```
models/
└── Wav2Lip-SD-GAN.pt  (or Wav2Lip-SD-NOGAN.pt)
```

The backend will automatically detect and use the model.

**Note:** The code checks for models in this priority order:
1. `Wav2Lip-SD-GAN.pt` (preferred)
2. `Wav2Lip-SD-NOGAN.pt`
3. `wav2lip_gan.pth` (legacy)
4. `wav2lip.pth` (legacy)
