from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, Response
import shutil
import os
from pathlib import Path
import uuid
import json
import httpx
from .wav2lip_inference import generate_lip_sync

app = FastAPI(title="Wav2Lip Backend API")

# CORS middleware to allow React app to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory setup
BASE_DIR = Path(__file__).parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"
CHARACTERS_DIR = BASE_DIR / "characters"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Load characters config
CHARACTERS_CONFIG_PATH = CHARACTERS_DIR / "characters.json"
def load_characters():
    if CHARACTERS_CONFIG_PATH.exists():
        with open(CHARACTERS_CONFIG_PATH) as f:
            return json.load(f)
    return {}


@app.get("/")
async def root():
    return {"message": "Wav2Lip Backend API is running"}


@app.get("/api/characters")
async def get_characters():
    """Get list of available characters."""
    characters = load_characters()
    return {"characters": characters}


@app.get("/api/characters/{character_id}/image")
async def get_character_image(character_id: str):
    """Get character's static image."""
    characters = load_characters()

    if character_id not in characters:
        raise HTTPException(status_code=404, detail=f"Character '{character_id}' not found")

    character = characters[character_id]
    image_path = CHARACTERS_DIR / character["media_file"]

    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Character image not found")

    return FileResponse(image_path, media_type="image/png")


@app.get("/api/characters/{character_id}/idle")
async def get_character_idle_media(character_id: str):
    """Get character's idle/listening media (GIF or video)."""
    characters = load_characters()

    if character_id not in characters:
        raise HTTPException(status_code=404, detail=f"Character '{character_id}' not found")

    character = characters[character_id]

    if "idle_media" not in character:
        raise HTTPException(status_code=404, detail="Character has no idle media")

    idle_path = CHARACTERS_DIR / character["idle_media"]

    if not idle_path.exists():
        raise HTTPException(status_code=404, detail="Idle media not found")

    # Determine media type from file extension
    media_type = "image/gif" if idle_path.suffix == ".gif" else "video/mp4"

    return FileResponse(idle_path, media_type=media_type)


@app.get("/api/characters/{character_id}/placeholder-lipsync")
async def get_placeholder_lipsync(character_id: str):
    """Get placeholder lip-sync video (temporary until Fish Audio TTS is integrated)."""
    # For now, use a hardcoded placeholder video
    placeholder_path = CHARACTERS_DIR / f"lipsync_{character_id}.mp4"

    if not placeholder_path.exists():
        raise HTTPException(status_code=404, detail="Placeholder video not found")

    return FileResponse(placeholder_path, media_type="video/mp4")


@app.get("/api/characters/{character_id}/greeting-audio")
async def get_greeting_audio(character_id: str):
    """Get pre-generated greeting audio for character."""
    greeting_path = CHARACTERS_DIR / f"greeting_{character_id}.mp3"

    if not greeting_path.exists():
        raise HTTPException(status_code=404, detail="Greeting audio not found")

    return FileResponse(greeting_path, media_type="audio/mpeg")


@app.get("/api/characters/{character_id}/greeting-video")
async def get_greeting_video(character_id: str):
    """Get pre-generated greeting lip-sync video for character."""
    greeting_video_path = CHARACTERS_DIR / f"greeting_lipsync_{character_id}.mp4"

    if not greeting_video_path.exists():
        raise HTTPException(status_code=404, detail="Greeting video not found")

    return FileResponse(greeting_video_path, media_type="video/mp4")


@app.post("/api/generate-lipsync")
async def create_lipsync_video(
    character_id: str = Form(..., description="Character ID (e.g., 'elsa')"),
    audio: UploadFile = File(..., description="Input audio file")
):
    """
    Generate lip-synced video using a character's image/video and provided audio.

    Args:
        character_id: ID of the character to use (from characters.json)
        audio: Audio file (wav, mp3, etc.)

    Returns:
        FileResponse: Lip-synced video file
    """
    session_id = str(uuid.uuid4())

    # Load character config
    characters = load_characters()
    if character_id not in characters:
        raise HTTPException(
            status_code=404,
            detail=f"Character '{character_id}' not found. Available: {list(characters.keys())}"
        )

    character = characters[character_id]
    character_media_path = CHARACTERS_DIR / character["media_file"]

    if not character_media_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Character media file not found: {character['media_file']}"
        )

    audio_path = UPLOAD_DIR / f"{session_id}_audio.wav"

    try:
        # Save uploaded audio
        with open(audio_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)

        # Generate lip-sync video
        output_path = OUTPUT_DIR / f"{session_id}_output.mp4"

        generate_lip_sync(
            video_path=str(character_media_path),
            audio_path=str(audio_path),
            output_path=str(output_path)
        )

        # Clean up input audio
        audio_path.unlink()

        # Read video into memory and return as streaming response
        # This allows us to delete the file immediately after reading
        def iterfile():
            with open(output_path, "rb") as f:
                yield from f
            # Delete output file after sending
            output_path.unlink()

        return StreamingResponse(
            iterfile(),
            media_type="video/mp4",
            headers={
                "Content-Disposition": f"attachment; filename=lipsync_{character_id}.mp4",
                "X-Session-ID": session_id
            }
        )

    except Exception as e:
        # Clean up files on error
        if audio_path.exists():
            audio_path.unlink()

        output_path = OUTPUT_DIR / f"{session_id}_output.mp4"
        if output_path.exists():
            output_path.unlink()

        raise HTTPException(status_code=500, detail=f"Error generating lip-sync: {str(e)}")


@app.delete("/api/cleanup/{session_id}")
async def cleanup_output(session_id: str):
    """Clean up generated output file after download."""
    output_path = OUTPUT_DIR / f"{session_id}_output.mp4"

    if output_path.exists():
        output_path.unlink()
        return {"message": "Cleanup successful"}

    return {"message": "File not found"}


@app.post("/api/fish-audio/tts")
async def fish_audio_proxy(request: Request):
    """Proxy endpoint for Fish Audio TTS to avoid CORS issues."""
    try:
        # Get request body
        body = await request.json()

        # Get Fish Audio API key from request headers
        fish_api_key = request.headers.get("X-Fish-Audio-Key")
        if not fish_api_key:
            raise HTTPException(status_code=400, detail="Fish Audio API key required in X-Fish-Audio-Key header")

        # Get model from query params
        model = request.query_params.get("model", "s1")

        # Forward request to Fish Audio API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://api.fish.audio/v1/tts?model={model}",
                headers={
                    "Authorization": f"Bearer {fish_api_key}",
                    "Content-Type": "application/json",
                },
                json=body,
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Fish Audio API error: {response.text}"
                )

            # Return audio blob
            return Response(
                content=response.content,
                media_type="audio/mpeg",
                headers={
                    "Content-Type": "audio/mpeg",
                }
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Fish Audio API timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
