import React, { useEffect, useRef, forwardRef, useState } from 'react';

// 🎨 CONFIGURATION DU DESIGN "QUANTUM DEEP VOID" v1.4
// Fusion de l'organique (Code 1.2) et du cinématique (Code 1.3)
const THEME = {
  colors: {
    activeCore: '#FFFFFF',      // Cœur blanc pur
    activeGlow: '#00F3FF',      // Cyan électrique
    completed: '#FFD700',       // Or antique
    future: 'rgba(51, 65, 85, 0.2)', // Sombre pour le vide
    boss: '#F43F5E',            // Rouge magenta
    particles: '#94A3B8',       // Poussière
    nebula: 'rgba(0, 243, 255, 0.02)' // Brume très légère
  },
  animation: {
    speed: 0.0015,          // Base lente
    flowSpeed: 0.012,       // Vitesse énergie
    breathingSpeed: 0.02    // Respiration
  }
};

const NeuralCanvas = forwardRef(({ nodes, currentLevel, config }, ref) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const nebulasRef = useRef([]);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 600, height: 5000 });

  // 1. Initialisation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    const width = container.offsetWidth || 600;
    const calculatedHeight = nodes.length > 0 
      ? nodes[nodes.length - 1].y + 300 
      : (config.paddingTop || 300) + 500;
    
    // 🛡️ SÉCURITÉ : Limite hauteur texture
    const height = Math.min(calculatedHeight, 5000);
    
    if (calculatedHeight > 5000) {
    }

    canvas.width = width;
    canvas.height = height;
    setCanvasDimensions({ width, height });
    
    // A. Particules (Poussière)
    particlesRef.current = [];
    const pCount = config.particleCount || 120;
    for (let i = 0; i < pCount; i++) {
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 1.5,
        alpha: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.02,
        offset: Math.random() * 100
      });
    }

    // B. Nébuleuses (Profondeur abyssale)
    nebulasRef.current = [];
    for (let i = 0; i < 6; i++) {
      nebulasRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 200 + Math.random() * 400,
        speed: (Math.random() - 0.5) * 0.1
      });
    }

  }, [nodes, config]);

  // 2. Tracking Souris
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

  // 3. Boucle de Rendu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;

    const animate = () => {
      frameRef.current++;
      const time = frameRef.current;
      
      if (!canvas || !ctx || canvas.width === 0) return;
      
      // Nettoyage
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // -- GESTION DE L'AMBIANCE GLOBALE (Ton ajout "Silence") --
      const silencePhase = Math.sin(time * 0.001);
      const silenceFactor = silencePhase > 0.95 ? 0.7 : 1; // Légère baisse de tension
      
      // Respiration globale du canvas
      const globalBreath = (0.95 + Math.sin(time * 0.002) * 0.05) * silenceFactor;
      
      // Mode de fusion pour les lumières
      ctx.globalCompositeOperation = 'screen'; 

      // A. Fond: Nébuleuses & Particules
      drawBackground(ctx, canvas.width, canvas.height, time);

      // B. Connexions Neuronales
      for (let i = 0; i < nodes.length - 1; i++) {
        const curr = nodes[i];
        const next = nodes[i + 1];
        
        const isCompleted = i < currentLevel;
        const isActive = i === currentLevel; 
        const isFuture = i > currentLevel;
        const isBossPath = next.isBoss;

        // Proximité souris
        let mouseProximity = 0;
        if (mouseRef.current.x > -100) {
          const midX = centerX + (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          const dist = Math.hypot(mouseRef.current.x - midX, mouseRef.current.y - midY);
          if (dist < 300) mouseProximity = (300 - dist) / 300;
        }
       
        drawSynapticBundle(
          ctx,
          centerX + curr.x, curr.y,
          centerX + next.x, next.y,
          { isCompleted, isActive, isFuture, isBossPath },
          time,
          mouseProximity,
          globalBreath
        );
      }

      // C. Nœud Actif (Cœur d'énergie)
      if (nodes.length > currentLevel) {
        drawActiveNodeHalo(ctx, frameRef.current, centerX, nodes[currentLevel]);
      }

      ctx.globalCompositeOperation = 'source-over';
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [nodes, currentLevel, config]);

  // --- MOTEUR DE DESSIN ---

  const drawBackground = (ctx, width, height, time) => {
    // 1. Nébuleuses (Grosses taches pour la profondeur "Void")
    ctx.fillStyle = THEME.colors.nebula;
    nebulasRef.current.forEach(n => {
      const y = n.y + Math.sin(time * 0.0005) * 50;
      ctx.beginPath();
      ctx.arc(n.x, y, n.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Particules précises
    ctx.fillStyle = THEME.colors.particles;
    particlesRef.current.forEach((p, index) => {
      // Dérive verticale (Ton ajout) + Mouvement organique
      const floatX = Math.sin(time * 0.001 + p.offset) * 20;
      const verticalDrift = Math.sin(time * 0.0005) * 15;
      
      const x = p.baseX + floatX;
      const y = p.baseY + verticalDrift + p.y * 0.01; // Légère distorsion Y
      
      const alpha = p.alpha + Math.sin(time * 0.02 + index) * 0.1;
      
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawSynapticBundle = (ctx, x1, y1, x2, y2, status, time, proximity, globalBreath) => {
    const { isCompleted, isActive, isFuture, isBossPath } = status;
    
    // Ton idée : Warped Time (Ralentissement temporel près de la souris)
    const warpedTime = time * (1 - proximity * 0.4);

    let mainColor = isFuture ? THEME.colors.future : (isActive ? THEME.colors.activeGlow : THEME.colors.completed);
    if (isBossPath && (isActive || isCompleted)) mainColor = THEME.colors.boss;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    const fiberCount = isFuture ? 1 : (isActive ? 16 : 10);
    
    // --- 1. DESSIN DES FIBRES (Tissus Nerveux) ---
    for (let i = 0; i < fiberCount; i++) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);

      // Calculs organiques fusionnés
      const localTime = warpedTime + i * 150;
      const drift = Math.sin(time * 0.0001 + i * 10) * 2; // Ton drift
      
      // Spread combiné : Structurel + Organique
      const baseSpread = isFuture ? 0 : Math.sin(i * 123.45) * 8; 
      const organicWave = Math.sin(localTime * THEME.animation.speed + (y1 * 0.01)) * 5;
      
      const spread = baseSpread + organicWave + drift;
      
      // Control Point
      const cp1x = midX + spread + (proximity * 30 * (i%2===0?1:-1));
      const cp1y = midY + (Math.cos(localTime * THEME.animation.speed + i) * 6);

      ctx.quadraticCurveTo(cp1x, cp1y, x2, y2);

      // Gestion de l'Alpha (Transparence)
      // On évite ctx.save/restore dans la boucle pour la performance
      // On calcule l'alpha final mathématiquement
      const centerFactor = 1 - Math.abs(i - fiberCount/2) / (fiberCount/2); 
      let fiberAlpha = isFuture ? 0.2 : (0.1 + (centerFactor * 0.1));
      
      fiberAlpha += proximity * 0.2;
      if (isActive) fiberAlpha += Math.sin(time * 0.05) * 0.05; // Scintillement
      if (isCompleted) fiberAlpha *= 0.85 + Math.sin(time * 0.02 + y1) * 0.05; // Ton effet "Completed Breath"

      ctx.strokeStyle = mainColor;
      
      // Variation d'épaisseur (Ton ajout "Breathing Width")
      const baseWidth = isFuture ? 1 : (Math.random() * 0.5 + 0.5 + centerFactor);
      const breathingWidth = baseWidth * (0.8 + Math.sin(time * 0.01 + i) * 0.2);
      ctx.lineWidth = breathingWidth;
      
      ctx.globalAlpha = Math.max(0, Math.min(1, fiberAlpha * globalBreath));
      ctx.stroke();
    }

    // --- 2. FLUX D'ÉNERGIE (Comètes) ---
    if (!isFuture) {
      const particleCount = isActive ? 2 : 1;
      if (isCompleted && Math.random() > 0.02) return; 

      for (let p = 0; p < particleCount; p++) {
        // Position avec Warped Time
        const t = ((warpedTime * THEME.animation.flowSpeed) + (p * 0.4)) % 1;
        
        // Helper Bezier
        const getPos = (posT) => {
          if (posT < 0) posT += 1;
          const mt = 1 - posT;
          const avgWave = Math.sin(warpedTime * THEME.animation.speed + (y1 * 0.01)) * 5; // Moyenne du mouvement
          const cx = midX + avgWave;
          const cy = midY;
          return {
            x: (mt * mt * x1) + (2 * mt * posT * cx) + (posT * posT * x2),
            y: (mt * mt * y1) + (2 * mt * posT * cy) + (posT * posT * y2)
          };
        };

        const currentPos = getPos(t);

        // A. Traînée (Tail) - Rendu cinématique
        // Beaucoup plus joli que des cercles simples
        const tailSteps = 8;
        const tailLen = 0.12;
        
        for(let s = 1; s <= tailSteps; s++) {
           const tailT = t - (s * (tailLen / tailSteps));
           if(tailT < 0) continue;
           
           const p1 = getPos(tailT);
           const p2 = getPos(t - ((s-1) * (tailLen / tailSteps)));
           
           ctx.beginPath();
           ctx.moveTo(p1.x, p1.y);
           ctx.lineTo(p2.x, p2.y);
           ctx.lineWidth = (isBossPath ? 3 : 1.5) * (1 - s/tailSteps);
           ctx.strokeStyle = mainColor;
           ctx.globalAlpha = (1 - s/tailSteps) * 0.6;
           ctx.stroke();
        }

        // B. Tête (Head)
        const size = isBossPath ? 3 : 2;
        
        // Halo de la particule
        ctx.fillStyle = mainColor;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Cœur blanc
        ctx.fillStyle = THEME.colors.activeCore;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const drawActiveNodeHalo = (ctx, frame, centerX, node) => {
    if (!node) return;
    const x = centerX + node.x;
    const y = node.y;

    const breath = Math.sin(frame * THEME.animation.breathingSpeed); 
    const size = 35 + (breath * 5); 

    // 1. Halo Conique
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(frame * 0.015);
    
    const gradient = ctx.createConicGradient(0, x, y);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 243, 255, 0.05)');
    gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.3)');
    gradient.addColorStop(0.8, 'rgba(0, 243, 255, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Cercle Pulsant
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 243, 255, 0.05)';
    ctx.strokeStyle = THEME.colors.activeGlow;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5 + (breath * 0.3);
    ctx.fill();
    ctx.stroke();

    // 3. Électrons en orbite (Ton ajout "Local Radius")
    const orbitSpeed = frame * 0.04;
    const orbitR = size * 1.2;
    
    for(let i=0; i<3; i++) {
        const angle = orbitSpeed + (i * (Math.PI * 2 / 3));
        // Ton effet de rayon variable
        const localR = orbitR + Math.sin(frame * 0.02 + i * 10) * 3;
        
        const ox = x + Math.cos(angle) * localR;
        const oy = y + Math.sin(angle) * (localR * 0.4); // Inclinaison 3D
        
        const depthScale = 1 + Math.sin(angle) * 0.3;
        
        ctx.beginPath();
        ctx.arc(ox, oy, 2 * depthScale, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = THEME.colors.activeGlow;
        ctx.shadowBlur = 10 * depthScale;
        ctx.globalAlpha = 0.8 + Math.sin(angle) * 0.2;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
  };

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
        width: `${canvasDimensions.width}px`,
        height: `${canvasDimensions.height}px`,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
});

NeuralCanvas.displayName = 'NeuralCanvas';

export default NeuralCanvas;