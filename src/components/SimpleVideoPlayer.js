import React, { useState, useRef, useEffect } from 'react';

const SimpleVideoPlayer = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Intersection Observer setup
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is in view
            if (isPlaying) video.play();
          } else {
            // Video is out of view
            video.pause();
          }
        });
      },
      { threshold: 0.5 }  // 50% of the video is visible
    );

    observer.observe(container);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      observer.unobserve(container);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div ref={containerRef} className="simple-video-player relative">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto"
        onClick={togglePlay}
      />
      <div className="controls absolute top-2 right-2 z-10">
        <button
          className="mute-btn p-2 bg-black bg-opacity-50 rounded-full text-white"
          onClick={toggleMute}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
      {!isPlaying && (
        <div className="play-overlay absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <button
            className="play-btn text-6xl text-white opacity-80 hover:opacity-100 transition-opacity"
            onClick={togglePlay}
          >
            ▶️
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleVideoPlayer;