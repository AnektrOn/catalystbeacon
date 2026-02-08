import React, { useState, useEffect } from 'react';

export default function IntroText() {
  const [isVisible, setIsVisible] = useState(false);
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    const fadeInTimeoutId = setTimeout(() => setIsVisible(true), 150);
    const fadeOutTimeoutId = setTimeout(() => setIsVisible(false), 600);
    const hideTimeoutId = setTimeout(() => setDisplay(false), 900);

    return () => {
      clearTimeout(fadeInTimeoutId);
      clearTimeout(fadeOutTimeoutId);
      clearTimeout(hideTimeoutId);
    };
  }, []);

  if (!display) return null;

  return (
    <div
      className="absolute top-0 left-0 bottom-0 right-0 flex flex-col justify-center items-center opacity-95 z-10 transition-opacity duration-200"
      style={{ opacity: isVisible ? 0.95 : 0 }}
    >
      <h1 className="tracking-tight font-semibold text-2xl md:text-5xl lg:text-7xl xl:text-8xl">
        <span className="text-white">Welcome to the </span>
        <span className="from-[#FF1CF7] to-[#b249f8] bg-clip-text text-transparent bg-gradient-to-b">
          Solar System
        </span>
      </h1>
    </div>
  );
}
