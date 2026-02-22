import React, { useEffect, useRef, forwardRef } from 'react';

const THEME = {
  colors: {
    background: '#010204',
    glow: '#00e5ff',
    completed: '#ffffff',
  }
};

const NeuralCanvas = forwardRef(({ nodes, currentLevel, config, containerWidth, containerHeight }, _ref) => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const spores = useRef([]);
  const animIdRef = useRef(null);

  // Init spores whenever container size changes
  useEffect(() => {
    if (!containerWidth || !containerHeight) return;
    const list = [];
    for (let i = 0; i < 60; i++) {
      list.push({
        x: Math.random() * containerWidth,
        y: Math.random() * containerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 2,
        life: Math.random() * Math.PI * 2
      });
    }
    spores.current = list;
  }, [containerWidth, containerHeight]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerWidth || !containerHeight) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    ctx.scale(dpr, dpr);

    const centerX = containerWidth / 2;

    const animate = () => {
      frameRef.current += 1;
      const time = frameRef.current;

      ctx.clearRect(0, 0, containerWidth, containerHeight);
      ctx.fillStyle = THEME.colors.background;
      ctx.fillRect(0, 0, containerWidth, containerHeight);

      // --- Spores ---
      ctx.globalCompositeOperation = 'lighter';
      spores.current.forEach(s => {
        s.x += s.vx + Math.sin(time * 0.01 + s.life) * 0.1;
        s.y += s.vy + Math.cos(time * 0.01 + s.life) * 0.1;
        if (s.x < 0) s.x = containerWidth;
        if (s.x > containerWidth) s.x = 0;
        if (s.y < 0) s.y = containerHeight;
        if (s.y > containerHeight) s.y = 0;
        const alpha = (Math.sin(time * 0.02 + s.life) + 1) / 2 * 0.3;
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Filaments (bezier bundles) ---
      for (let i = 0; i < nodes.length - 1; i++) {
        const start = nodes[i];
        const end = nodes[i + 1];
        const isPast = i < currentLevel;
        const isActive = i === currentLevel;

        const x1 = centerX + start.x;
        const y1 = start.y;
        const x2 = centerX + end.x;
        const y2 = end.y;

        const color = isPast ? THEME.colors.completed : (isActive ? THEME.colors.glow : 'white');
        const baseAlpha = isPast ? 0.45 : (isActive ? 0.6 : 0.03);

        for (let f = 0; f < 8; f++) {
          const offset = f * 15;
          const cp1x = x1 + (x2 - x1) * 0.3 + Math.sin(time * 0.005 + i + offset) * 30;
          const cp1y = y1 + (y2 - y1) * 0.3 + Math.cos(time * 0.005 + i + offset) * 20;
          const cp2x = x1 + (x2 - x1) * 0.7 + Math.cos(time * 0.005 + i + offset * 1.5) * 30;
          const cp2y = y1 + (y2 - y1) * 0.7 + Math.sin(time * 0.005 + i + offset * 1.5) * 20;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
          ctx.strokeStyle = color;
          ctx.lineWidth = isPast ? 0.5 : 0.3;
          ctx.globalAlpha = baseAlpha * (1 - f * 0.1);
          ctx.stroke();

          // Travel particles on active/completed segments
          if (isPast || isActive) {
            const speed = isActive ? 0.004 : 0.0015;
            const t = (time * speed + i * 0.5 + f * 0.1) % 1;
            const invT = 1 - t;
            const px =
              Math.pow(invT, 3) * x1 +
              3 * Math.pow(invT, 2) * t * cp1x +
              3 * invT * Math.pow(t, 2) * cp2x +
              Math.pow(t, 3) * x2;
            const py =
              Math.pow(invT, 3) * y1 +
              3 * Math.pow(invT, 2) * t * cp1y +
              3 * invT * Math.pow(t, 2) * cp2y +
              Math.pow(t, 3) * y2;

            ctx.fillStyle = f === 0 ? '#fff' : color;
            ctx.globalAlpha = (isActive ? 0.8 : 0.5) * (1 - f * 0.1);
            ctx.beginPath();
            ctx.arc(px, py, f === 0 ? 1.5 : 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      animIdRef.current = requestAnimationFrame(animate);
    };

    animIdRef.current = requestAnimationFrame(animate);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [nodes, currentLevel, containerWidth, containerHeight]);

  const w = containerWidth || 600;
  const h = containerHeight || 2000;

  return (
    <canvas
      ref={canvasRef}
      id="neuron-canvas"
      className="neuron-canvas"
      style={{
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${w}px`,
        height: `${h}px`,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
});

NeuralCanvas.displayName = 'NeuralCanvas';

export default NeuralCanvas;
