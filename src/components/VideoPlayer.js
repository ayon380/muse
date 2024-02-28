import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = ({ src, caption, likeCount, viewCount }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        togglePlayPause();
      } else if (event.code === 'KeyM') {
        toggleMute();
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
    setIsPlaying(!isPlaying);
  };  

  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  return (
    <div style={{ position: 'relative' }}>
      <video
        ref={videoRef}
        src={src}
        style={{ width: '100%', display: 'block' }}
        controls={false}
      />
      <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '10px' }}>
        <p>Caption: {caption}</p>
        <p>Likes: {likeCount}</p>
        <p>Views: {viewCount}</p>
      </div>
    </div>
  );
};

export default VideoPlayer;
