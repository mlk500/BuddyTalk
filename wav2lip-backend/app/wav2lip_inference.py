"""
Wav2Lip inference wrapper.

This module calls Wav2Lip using your existing test-lip-sync setup.
It uses subprocess to call the Wav2Lip script with the appropriate Python environment.
"""

import subprocess
from pathlib import Path
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


def generate_lip_sync(video_path: str, audio_path: str, output_path: str):
    """
    Generate lip-synced video using Wav2Lip from test-lip-sync project.

    Args:
        video_path: Path to input video or image
        audio_path: Path to input audio file
        output_path: Path where output video will be saved

    Raises:
        RuntimeError: If Wav2Lip execution fails
        FileNotFoundError: If required files are not found
    """

    # Path to your working Wav2Lip installation
    WAV2LIP_DIR = Path("/Users/malakyehia/projects/test-lip-sync/Wav2Lip")
    wav2lip_script = WAV2LIP_DIR / "inference.py"

    # Check if Wav2Lip exists
    if not wav2lip_script.exists():
        raise FileNotFoundError(
            f"Wav2Lip inference.py not found at {wav2lip_script}. "
            f"Make sure the test-lip-sync/Wav2Lip directory exists."
        )

    # Model path - Priority order:
    # 1. Backend local models (if you copy them)
    # 2. Test-lip-sync models (auto-detected)

    # Try SD-GAN first (best quality)
    test_sd_gan = WAV2LIP_DIR / "checkpoints" / "Wav2Lip-SD-GAN.pt"
    backend_sd_gan = Path(__file__).parent.parent / "models" / "Wav2Lip-SD-GAN.pt"

    # Fallback to regular GAN
    test_gan = WAV2LIP_DIR / "checkpoints" / "wav2lip_gan.pth"
    backend_gan = Path(__file__).parent.parent / "models" / "wav2lip_gan.pth"

    # Try models in priority order
    if backend_sd_gan.exists():
        checkpoint_path = backend_sd_gan
        model_name = "Wav2Lip-SD-GAN (Backend - Highest Quality)"
    elif test_sd_gan.exists():
        checkpoint_path = test_sd_gan
        model_name = "Wav2Lip-SD-GAN (Test - Highest Quality)"
    elif backend_gan.exists():
        checkpoint_path = backend_gan
        model_name = "wav2lip_gan (Backend - Good Quality)"
    elif test_gan.exists():
        checkpoint_path = test_gan
        model_name = "wav2lip_gan (Test - Good Quality)"
    else:
        # Last resort: any .pth or .pt file
        models_dir = Path(__file__).parent.parent / "models"
        model_files = list(models_dir.glob("*.pth")) + list(models_dir.glob("*.pt"))
        if model_files:
            checkpoint_path = model_files[0]
            model_name = f"{model_files[0].name} (Auto-detected)"
        else:
            raise FileNotFoundError(
                f"No model checkpoint found. Please place a model in:\n"
                f"  - {backend_sd_gan}\n"
                f"  - OR {test_sd_gan}"
            )

    logger.info(f"🎬 Using model: {model_name}")
    logger.info(f"📁 Model path: {checkpoint_path}")

    # Use Python from test-lip-sync venv (has correct librosa version)
    test_venv_python = WAV2LIP_DIR / "venv" / "bin" / "python"

    # Or use wav2lip-venv if created
    wav2lip_venv_python = Path(__file__).parent.parent / "wav2lip-venv" / "bin" / "python"

    if test_venv_python.exists():
        python_cmd = str(test_venv_python)
    elif wav2lip_venv_python.exists():
        python_cmd = str(wav2lip_venv_python)
    else:
        # Fallback to system python3
        python_cmd = "python3"

    # Build command
    cmd = [
        python_cmd,
        str(wav2lip_script),
        "--checkpoint_path", str(checkpoint_path),
        "--face", video_path,
        "--audio", audio_path,
        "--outfile", output_path,
    ]

    # Run Wav2Lip
    try:
        logger.info(f"🎥 Starting Wav2Lip generation...")
        logger.info(f"🖼️  Input: {Path(video_path).name}")
        logger.info(f"🎵 Audio: {Path(audio_path).name}")

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=str(WAV2LIP_DIR),  # Run from Wav2Lip directory
            timeout=300  # 5 minute timeout
        )

        if result.returncode != 0:
            error_msg = result.stderr if result.stderr else result.stdout
            logger.error(f"❌ Wav2Lip failed: {error_msg}")
            raise RuntimeError(
                f"Wav2Lip inference failed with exit code {result.returncode}:\n{error_msg}"
            )

        # Check if output was created
        if not Path(output_path).exists():
            logger.error(f"❌ Output file not created at {output_path}")
            raise RuntimeError(
                f"Wav2Lip completed but output file not found at {output_path}"
            )

        logger.info(f"✅ Lip-sync video generated successfully!")
        logger.info(f"📦 Output size: {Path(output_path).stat().st_size / 1024 / 1024:.2f} MB")

    except subprocess.TimeoutExpired:
        logger.error("⏱️  Wav2Lip processing timed out (>5 minutes)")
        raise RuntimeError("Wav2Lip processing timed out (>5 minutes)")
    except Exception as e:
        logger.error(f"❌ Error running Wav2Lip: {str(e)}")
        raise RuntimeError(f"Error running Wav2Lip: {str(e)}")
