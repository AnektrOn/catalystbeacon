import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const NeuralCanvas = forwardRef(({ nodes, currentLevel, config }, ref) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Initialize particles
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;
    
    const width = container.offsetWidth || 600;
    const height = nodes.length > 0 ? nodes[nodes.length - 1].y + 300 : config.paddingTop + 500;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // Create particles
    particlesRef.current = [];
    for (let i = 0; i < config.particleCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        speedY: (Math.random() - 0.5) * 0.2,
        speedX: (Math.random() - 0.5) * 0.2,
      });
    }
  }, [nodes, config]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;

    const animate = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      particlesRef.current.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;

        // Boundary wrap
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      const jitterSeed = Math.floor(frameRef.current / 4);
      for (let i = 0; i < nodes.length - 1; i++) {
        const curr = nodes[i];
        const next = nodes[i + 1];
        const isActivePath = i < currentLevel;
        const isBossPath = next.isBoss;

        // Mouse proximity
        let mouseProximity = 0;
        if (mouseRef.current.x > -100) {
          const midX = centerX + (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          const dist = Math.hypot(mouseRef.current.x - midX, mouseRef.current.y - midY);
          if (dist < 150) {
            mouseProximity = (150 - dist) / 150;
          }
        }

        drawChaosBundle(
          ctx,
          centerX + curr.x,
          curr.y,
          centerX + next.x,
          next.y,
          isActivePath,
          jitterSeed + i,
          isBossPath,
          mouseProximity,
          config
        );
      }

      // Draw avatar spark
      if (nodes.length > currentLevel) {
        drawAvatarSpark(ctx, frameRef.current, centerX, nodes[currentLevel], config);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes, currentLevel, config]);

  const drawChaosBundle = (ctx, x1, y1, x2, y2, isActive, seed, isBossPath, proximity, config) => {
    let baseColor = isActive ? '255, 255, 255' : '50, 50, 50';
    if (isBossPath && isActive) baseColor = '255, 0, 60';

    let opacity = isActive ? 0.2 : 0.15;
    opacity += proximity * 0.4;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const random = (offset) => {
      const x = Math.sin(seed * 12.9898 + offset) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let j = 0; j < config.filamentCount; j++) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);

      const r1 = random(j * 11.1) - 0.5;
      const r2 = random(j * 7.7) - 0.5;

      const cx = midX + r1 * config.filamentChaos * 2;
      const cy = midY + r2 * config.filamentChaos * 2;

      ctx.quadraticCurveTo(cx, cy, x2, y2);
      ctx.strokeStyle = `rgba(${baseColor}, ${opacity})`;
      ctx.lineWidth = isActive ? (1.5 + proximity) : 1;
      ctx.stroke();
    }

    // Pulse packet
    if (isActive) {
      const pulsePos = (Date.now() % 2000) / 2000;
      const px = x1 + (x2 - x1) * pulsePos;
      const py = y1 + (y2 - y1) * pulsePos;

      ctx.fillStyle = isBossPath ? "rgba(255, 50, 50, 0.9)" : "rgba(255, 255, 255, 0.9)";
      ctx.shadowBlur = 15;
      ctx.shadowColor = isBossPath ? "red" : "white";
      ctx.beginPath();
      ctx.arc(px, py, 2.5 + (proximity * 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  const drawAvatarSpark = (ctx, frame, centerX, node, config) => {
    if (!node) return;

    const x = centerX + node.x;
    const y = node.y;
    const radius = 25;
    const speed = frame * 0.05;

    const sx = x + Math.cos(speed) * radius;
    const sy = y + Math.sin(speed) * radius;

    ctx.fillStyle = "#00f3ff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00f3ff";
    ctx.beginPath();
    ctx.arc(sx, sy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  return (
    <canvas
      ref={canvasRef}
      id="neuron-canvas"
      className="neuron-canvas"
    />
  );
});

NeuralCanvas.displayName = 'NeuralCanvas';

export default NeuralCanvas;
