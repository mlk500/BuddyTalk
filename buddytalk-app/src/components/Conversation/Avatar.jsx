import { useEffect, useRef, useState } from 'react';

export default function Avatar({ character, expression = 'neutral', isSpeaking, videoUrl = null, status = 'idle' }) {
  const lipSyncVideoRef = useRef(null);
  const [idleVideoLoaded, setIdleVideoLoaded] = useState(false);

  // Get idle media URL from backend (GIF or video)
  const idleMediaUrl = `/api/characters/${character.id}/idle`;

  console.log('Avatar render:', { status, isSpeaking, hasVideoUrl: !!videoUrl, idleVideoLoaded });

  // Play lip-sync video when it loads
  useEffect(() => {
    if (videoUrl && lipSyncVideoRef.current) {
      console.log('Playing lip-sync video');
      lipSyncVideoRef.current.play().catch(err => {
        console.error('Error playing lip-sync video:', err);
      });
    }
  }, [videoUrl]);

  const handleIdleVideoLoaded = () => {
    console.log('Idle GIF loaded successfully');
    setIdleVideoLoaded(true);
  };

  const handleIdleVideoError = (e) => {
    console.error('Idle GIF failed to load:', e);
    setIdleVideoLoaded(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        backgroundColor: '#000',
        aspectRatio: '730 / 1280', // Match the GIF dimensions
      }}
    >
      {/* Idle GIF - always rendered, hidden when speaking */}
      <img
        src={idleMediaUrl}
        alt={character.name}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: videoUrl ? 'none' : 'block',
        }}
        onLoad={handleIdleVideoLoaded}
        onError={handleIdleVideoError}
      />

      {/* Lip-sync video - shown when speaking */}
      {videoUrl && (
        <video
          ref={lipSyncVideoRef}
          src={videoUrl}
          loop
          muted
          playsInline
          autoPlay
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  );
}
