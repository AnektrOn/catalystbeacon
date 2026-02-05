import React, { useRef, useEffect } from 'react';
import './EntityScene.css';

const ACT2_VIDEO_URL = '/assets/kling_20260205_Image_to_Video_Make_the_s_3655_0.mp4';

/**
 * EntityScene Component
 * Full-screen video for Act 2. Plays once then stays on last frame until user clicks CTA.
 */
const EntityScene = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onEnded = () => {
      video.pause();
    };
    video.addEventListener('ended', onEnded);
    return () => video.removeEventListener('ended', onEnded);
  }, []);

  return (
    <div className="entity-scene">
      <video
        ref={videoRef}
        className="entity-background-video"
        src={ACT2_VIDEO_URL}
        autoPlay
        loop={false}
        muted
        playsInline
      />
    </div>
  );
};

export default EntityScene;
