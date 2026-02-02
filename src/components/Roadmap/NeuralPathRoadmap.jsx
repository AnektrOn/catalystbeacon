import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import { supabase } from '../../lib/supabaseClient';
import roadmapService from '../../services/roadmapService';
import useSubscription from '../../hooks/useSubscription';
import NeuralNode from './NeuralNode';
import NeuralCanvas from './NeuralCanvas';
import MissionModal from './MissionModal';
import InstituteSorterModal from '../InstituteSorterModal';
import CompletionAnimation from './CompletionAnimation';
import './NeuralPathRoadmap.css';

const CONFIG = {
  count: 35,
  spacing: 120,
  amplitude: 140,
  paddingTop: 300,
  filamentCount: 8,
  filamentChaos: 25,
  particleCount: 60,
  bossInterval: 5
};

const NeuralPathRoadmap = ({ masterschool = 'Ignition', schoolConfig = null }) => {
  const { user } = useAuth();
  const { isFreeUser } = useSubscription();
  const { endTransition } = usePageTransition();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const recenterBtnRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [lessons, setLessons] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [institutePriority, setInstitutePriority] = useState(null);
  const [showInstituteSorter, setShowInstituteSorter] = useState(false); // This will control the modal visibility
  //const [completedSet, setCompletedSet] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedLesson, setCompletedLesson] = useState(null);

  // Load user XP and institute_priority
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_xp, total_xp_earned, institute_priority')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserXP(profile.current_xp || profile.total_xp_earned || 0);
        setInstitutePriority(profile.institute_priority);
        // Show sorter if priority is null or empty
        if (!profile.institute_priority || profile.institute_priority.length === 0) {
          setShowInstituteSorter(true);
        }
      }
    };

    loadUserData();
  }, [user]);

  // Check for completion from URL params
  useEffect(() => {
    if (!lessons.length) return;

    const params = new URLSearchParams(window.location.search);
    const completed = params.get('completed');
    const lessonId = params.get('lessonId');
    const xp = params.get('xp');

    if (completed === 'true' && lessonId) {
      // Find the completed lesson
      const lesson = lessons.find(l =>
        `${l.course_id}-${l.chapter_number}-${l.lesson_number}` === lessonId
      );

      if (lesson) {
        setCompletedLesson({
          lesson,
          xp: parseInt(xp) || lesson.lesson_xp_reward || 0
        });
        setShowCompletion(true);

        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [lessons]);

  // Initialize
  useEffect(() => {
    if (user) {
      loadRoadmap();
    }
  }, [user, masterschool]);

  // End transition when roadmap is loaded (with safety timeout)
  useEffect(() => {
    // Safety timeout: always end transition after max 5 seconds to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      endTransition();
    }, 5000);

    if (!loading && lessons.length > 0 && nodes.length > 0) {
      // Roadmap is fully loaded, end the global transition
      clearTimeout(safetyTimeout);
      setTimeout(() => {
        endTransition();
      }, 300); // Small delay to ensure smooth transition
    } else if (!loading && lessons.length === 0) {
      // Even if no lessons, end transition after a short delay
      clearTimeout(safetyTimeout);
      setTimeout(() => {
        endTransition();
      }, 500);
    }

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, [loading, lessons, nodes, endTransition]);

  // Load roadmap data
  // Load roadmap data (NOUVELLE VERSION LÉGÈRE)
 // 1. MODIFIER la fonction loadRoadmap pour calculer le niveau
 const loadRoadmap = async () => {
  try {
    setLoading(true);

    // Récupération des leçons
    const layerLessons = await roadmapService.getRoadmapLessons(masterschool, user.id);
    setLessons(layerLessons);

    // --- LE FIX EST ICI : CALCUL DU NIVEAU ACTUEL ---
    // On cherche l'index de la première leçon qui n'est PAS complétée.
    // Si toutes sont finies (findIndex renvoie -1), on prend la dernière.
    const firstIncompleteIndex = layerLessons.findIndex(l => !l.is_completed);
    const calculatedLevel = firstIncompleteIndex === -1 ? layerLessons.length - 1 : firstIncompleteIndex;
    
    // On met à jour l'état pour que le Canvas sache où dessiner le Halo
    setCurrentLevel(calculatedLevel);
    // -----------------------------------------------

    createNodes(layerLessons);

    // Mise à jour XP (inchangé)
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_xp, total_xp_earned, institute_priority')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserXP(profile.current_xp || profile.total_xp_earned || 0);
      setInstitutePriority(profile.institute_priority);
    }

  } catch (err) {
    console.error(err);
    setTimeout(() => { endTransition(); }, 500);
  } finally {
    setLoading(false);
  }
};

  // Create nodes from lessons - determine unlock status from roadmap_progress
  // Create nodes from lessons (NOUVELLE VERSION SIMPLIFIÉE)
// 2. MODIFIER createNodes pour passer le bon statut aux nœuds
// DANS src/components/Roadmap/NeuralPathRoadmap.jsx

  const createNodes = (lessonsList, activeLevel) => {
    const nodeList = [];
    
    // Configuration "Géométrie Sacrée"
    const HEX_RADIUS = 120; // Rayon de l'hexagone
    const VERTICAL_STEP = 100; // Espace vertical entre chaque ligne

    for (let i = 0; i < lessonsList.length; i++) {
      const lesson = lessonsList[i];
      const isCompleted = lesson.is_completed;
      
      let status = 'locked';
      if (isCompleted) status = 'completed';
      else if (i === activeLevel) status = 'active';

      // --- NOUVELLE MATHÉMATIQUE : LE CADUCÉE HEXAGONAL ---
      // Cela crée un motif qui oscille comme une double hélice d'ADN ou une fleur de vie verticale.
      
      // Cycle de 6 positions (comme une fleur)
      // 0: Centre
      // 1: Droite
      // 2: Droite Extrême (ou retour centre)
      // 3: Centre
      // 4: Gauche
      // 5: Gauche Extrême
      
      const cycle = i % 4; // Cycle de 4 pour une symétrie parfaite
      let x = 0;
      
      // Motif : Centre -> Droite -> Centre -> Gauche (Le Serpent/Caducée)
      if (cycle === 0) x = 0;                // Centre (Chakra)
      else if (cycle === 1) x = HEX_RADIUS;  // Droite (Pingala)
      else if (cycle === 2) x = 0;           // Centre (Retour)
      else if (cycle === 3) x = -HEX_RADIUS; // Gauche (Ida)

      // Ajout d'une petite variation "Organique" pour ne pas faire trop rigide
      const organicDrift = Math.sin(i * 0.5) * 10;
      x += organicDrift;

      // Position Y : Descend régulièrement
      const y = CONFIG.paddingTop + (i * VERTICAL_STEP);

      const isBoss = (i + 1) % CONFIG.bossInterval === 0;

      // Si c'est un Boss, on le force au CENTRE pour marquer une étape
      if (isBoss) x = 0;

      nodeList.push({
        id: i,
        lesson,
        x, // Position X calculée géométriquement
        y, // Position Y stricte
        status,
        isBoss,
        isLocked: status === 'locked',
        is_completed: isCompleted
      });
    }

    setNodes(nodeList);
  };

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    if (node.status === 'locked') {
      // Shake animation handled by NeuralNode
      return;
    }

    setSelectedNode(node);
    setIsModalOpen(true);
  }, []);

  // Start level
  const startLevel = () => {
    if (!selectedNode) return;

    const { lesson } = selectedNode;
    // Add return URL for completion detection
    const returnUrl = encodeURIComponent(`/roadmap/ignition?completed=true&lessonId=${lesson.course_id}-${lesson.chapter_number}-${lesson.lesson_number}&xp=${lesson.lesson_xp_reward || 0}`);

    // Always add fromRoadmap=true when coming from roadmap (for both free and paid users)
    // This allows the modal to redirect back to roadmap after completion
    // Free users will have restricted access, paid users will have full access
    navigate(`/courses/${lesson.course_id}/chapters/${lesson.chapter_number}/lessons/${lesson.lesson_number}?return=${returnUrl}&fromRoadmap=true&isFreeUser=${isFreeUser}`);
    setIsModalOpen(false);
  };

  // Scroll to active node
  const scrollToActive = (cinematic = false) => {
    const activeNode = nodes.find(n => n.status === 'active');
    if (activeNode && mapContainerRef.current) {
      const nodeElement = document.getElementById(`neural-node-${activeNode.id}`);
      if (nodeElement) {
        nodeElement.scrollIntoView({
          behavior: cinematic ? 'smooth' : 'auto',
          block: 'center'
        });
      }
    }
  };

  // Check scroll position for recenter button
  useEffect(() => {
    const handleScroll = () => {
      const activeNode = nodes.find(n => n.status === 'active');
      if (!activeNode || !recenterBtnRef.current) return;

      const nodeElement = document.getElementById(`neural-node-${activeNode.id}`);
      if (nodeElement) {
        const rect = nodeElement.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        if (rect.top < -200 || rect.top > viewHeight + 200) {
          recenterBtnRef.current.classList.add('visible');
        } else {
          recenterBtnRef.current.classList.remove('visible');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [nodes]);

  // Initial scroll to active
  useEffect(() => {
    if (nodes.length > 0 && !loading) {
      setTimeout(() => {
        scrollToActive(true);
      }, 800);
    }
  }, [nodes, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSavePriority = (newPriority) => {
    setInstitutePriority(newPriority);
    setShowInstituteSorter(false); // Hide the modal
    loadRoadmap(); // Reload roadmap with new priority
  };

  const handleCloseSorter = () => {
    // If user closes without saving, and priority is still empty, keep modal open
    // Or handle this case based on UX requirements (e.g., force them to choose)
    // For now, let's just close it. If institutePriority is null/empty, it will reappear next load.
    setShowInstituteSorter(false);
  };

  const handleJumpToNextInstitute = async () => {
    if (!institutePriority || institutePriority.length < 2) {
      // Or show a message that there's no next institute
      return;
    }

    // Create the next priority order
    const nextPriority = [...institutePriority.slice(1), institutePriority[0]];

    // Update in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ institute_priority: nextPriority })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to update institute priority:', error);
      // Optionally show an error to the user
      return;
    }

    // Reload the roadmap with the new priority
    setInstitutePriority(nextPriority);
    loadRoadmap();
  };

  if (loading) {
    return (
      <div className="neural-path-loading">
        <div className="loading-spinner"></div>
        <p>Initializing Neural Path...</p>
      </div>
    );
  }

  const containerHeight = nodes.length > 0
    ? nodes[nodes.length - 1].y + 300
    : CONFIG.paddingTop + 500;

  return (
    <div id="roadmap-container" className="neural-path-container">
      {/* HUD */}
      <div className="neural-hud">
        <div className="hud-item">
          <i className="fas fa-graduation-cap"></i>
          <span className="hud-val">{masterschool.toUpperCase()}</span>
        </div>
        <div className="hud-item">
          <i className="fas fa-star"></i>
          <span className="hud-val">{userXP.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Map Container */}
      <div
        className="map-container"
        id="mapContainer"
        ref={mapContainerRef}
        style={{ minHeight: `${containerHeight}px` }}
      >
        {/* Canvas for particles and connections */}
        <NeuralCanvas
          ref={canvasRef}
          nodes={nodes}
          currentLevel={currentLevel}
          config={CONFIG}
        />

        {/* Nodes */}
        {nodes.map(node => (
          <NeuralNode
            key={node.id}
            id={`neural-node-${node.id}`}
            node={node}
            onClick={() => handleNodeClick(node)}
          />
        ))}
      </div>

      {/* Recenter Button */}
      <button
        ref={recenterBtnRef}
        id="recenter-btn"
        className="recenter-btn"
        onClick={() => scrollToActive(true)}
      >
        <i className="fas fa-crosshairs"></i>
      </button>

      {/* Mission Modal */}
      <MissionModal
        isOpen={isModalOpen}
        node={selectedNode}
        masterschool={masterschool}
        onClose={() => setIsModalOpen(false)}
        onStart={startLevel}
        onComplete={async () => { // Make onComplete async
          await loadRoadmap(); // Ensure roadmap is reloaded
          setTimeout(() => {
            scrollToActive(true); // Scroll to active node after reload
          }, 500);
        }}
      />

      {/* Completion Animation */}
      <CompletionAnimation
        isVisible={showCompletion}
        xpEarned={completedLesson?.xp || 0}
        lessonTitle={completedLesson?.lesson?.lesson_title || ''}
        onComplete={async () => { // Make onComplete async
          setShowCompletion(false);
          await loadRoadmap(); // Reload roadmap and then scroll to next active node
          setTimeout(() => {
            scrollToActive(true);
          }, 500);
        }}
      />
      {/* Institute Sorter Modal */}
      {showInstituteSorter && (
        <InstituteSorterModal
          onClose={handleCloseSorter}
          onSave={handleSavePriority}
        />
      )}

      {/* Jump to Next Institute Button */}
      {nodes.some(node => node.isLocked) && (
        <button
          className="jump-institute-btn"
          onClick={handleJumpToNextInstitute}
        >
          Jump to Institute Priority 2
        </button>
      )}
    </div>
  );
};

export default NeuralPathRoadmap;