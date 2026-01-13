import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConstellationNavigatorWidget = ({ 
  currentSchool = 'Ignition', 
  currentConstellation = { name: 'Transformation Path', nodes: [] } 
}) => {
  const navigate = useNavigate();

  // Si on a des nodes, on les affiche, sinon on met des placeholders
  const displayNodes = currentConstellation.nodes && currentConstellation.nodes.length > 0 
    ? currentConstellation.nodes 
    : [1, 2, 3, 4]; 

  // Calcul du pourcentage pour l'affichage
  const completedNodes = displayNodes.filter(n => n.completed).length;
  const totalNodes = displayNodes.length;
  const progressPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  const handleEnterRoadmap = () => {
    // Redirection sécurisée : on force ignition si l'école est inconnue pour éviter la redirection vers Landing Page
    const target = currentSchool.toLowerCase() === 'awakening' ? 'ignition' : currentSchool.toLowerCase();
    navigate(`/roadmap/${target}`);
  };

  return (
    <div 
      className="
        relative w-full h-full flex flex-col justify-between p-6
        /* On garde le flou et la structure de base */
        backdrop-blur-md
        rounded-2xl
        shadow-sm
        group
        transition-all duration-300
      "
      style={{
        // 🎨 STYLE DYNAMIQUE : Suit la palette active
        // IMPORTANT : On enveloppe les variables dans hsl() car elles sont souvent définies en valeurs brutes (ex: "220 14% 96%")
        backgroundColor: 'hsl(var(--card) / 0.6)',
        // La bordure prend la couleur primaire (subtile)
        border: '1px solid hsl(var(--primary) / 0.2)',
        // L'ombre prend une teinte de la couleur primaire
        boxShadow: '0 4px 20px -5px hsl(var(--primary) / 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 
            className="text-[10px] uppercase tracking-widest font-semibold mb-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Constellation
          </h3>
          <h2 
            className="text-2xl font-serif truncate max-w-[200px]"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {currentConstellation.name || 'Path unknown'}
          </h2>
          <p 
            className="text-xs mt-1"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {currentSchool} School
          </p>
        </div>

        {/* Bouton d'action : Suit la couleur primaire */}
        <button 
          onClick={handleEnterRoadmap}
          className="
            p-3 rounded-full 
            transition-all duration-300
            cursor-pointer
            hover:scale-110
          "
          style={{
            backgroundColor: 'hsl(var(--primary) / 0.1)',
            color: 'hsl(var(--primary))',
            boxShadow: '0 0 15px hsl(var(--primary) / 0.2)'
          }}
          aria-label="Enter Neural Path"
        >
          <Sparkles size={20} />
        </button>
      </div>

      {/* Visual Path (Ligne de points minimaliste) */}
      <div className="relative flex items-center justify-between px-2 py-6">
        {/* Ligne de fond */}
        <div 
          className="absolute left-2 right-2 top-1/2 h-0.5 -z-10" 
          style={{ backgroundColor: 'hsl(var(--foreground) / 0.1)' }}
        />

        {/* Points dynamiques */}
        {displayNodes.slice(0, 5).map((node, index) => {
          // Logique d'affichage selon l'état du node (si disponible)
          const isCompleted = node.completed || false;
          const isCurrent = node.isCurrent || (!node.completed && index === 0); // Fallback logique
          
          return (
            <div key={index} className="relative group/node">
              <div 
                className={`
                  w-3 h-3 rounded-full border-2 transition-all duration-300 z-10
                `}
                style={{
                  // Couleurs dynamiques selon l'état
                  backgroundColor: isCompleted ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                  borderColor: isCompleted ? 'hsl(var(--primary))' : (isCurrent ? 'hsl(var(--secondary))' : 'hsl(var(--muted))'),
                  boxShadow: isCompleted 
                    ? '0 0 8px hsl(var(--primary) / 0.5)' 
                    : (isCurrent ? '0 0 10px hsl(var(--secondary) / 0.5)' : 'none'),
                  transform: isCurrent ? 'scale(1.25)' : 'scale(1)'
                }}
              />
              
              {/* Tooltip au survol du point */}
              {node.name && (
                <div 
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 text-[9px] px-2 py-1 rounded opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
                  style={{
                    backgroundColor: 'hsl(var(--popover))',
                    color: 'hsl(var(--popover-foreground))',
                    border: '1px solid hsl(var(--border))'
                  }}
                >
                  {node.name}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-end mt-auto">
        <span 
          className="text-xs"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          {completedNodes} of {totalNodes} nodes active
        </span>
        <span 
          className="text-xs font-bold font-serif"
          style={{ color: 'hsl(var(--primary))' }}
        >
          {progressPercent}%
        </span>
      </div>
      
      {/* Glow Effect d'ambiance (Optionnel, ajoute de la profondeur liée au thème) */}
      <div 
        className="absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-20"
        style={{ backgroundColor: 'hsl(var(--primary))' }}
      />
    </div>
  );
};

export default ConstellationNavigatorWidget;