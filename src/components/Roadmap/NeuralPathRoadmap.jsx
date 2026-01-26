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

const NeuralPathRoadmap = ({ masterschool = 'Ignition' }) => {
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
  const loadRoadmap = async () => {
    try {
      setLoading(true);

      // 1. On appelle ta nouvelle fonction RPC via le service
      // Elle ne renvoie que les quelques leçons de la couche actuelle
      const layerLessons = await roadmapService.getRoadmapLessons(masterschool, user.id);

      setLessons(layerLessons);

      // 2. On génère les nœuds directement
      // Plus besoin de calculer "currentIndex" ou "completedSet"
      createNodes(layerLessons);

      // Update user XP and institute priority
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
      // Safety timeout
      setTimeout(() => {
        endTransition();
      }, 500);
    } finally {
      setLoading(false);
      // Ensure nodes are re-created after loading new lessons
      if (user && masterschool) { // Only reload if user and masterschool are available
        const latestLessons = await roadmapService.getRoadmapLessons(masterschool, user.id);
        setLessons(latestLessons);
        createNodes(latestLessons);
      }
    }
  };

  // Create nodes from lessons - determine unlock status from roadmap_progress
  // Create nodes from lessons (NOUVELLE VERSION SIMPLIFIÉE)
  const createNodes = (lessonsList) => {
    const nodeList = [];

    // On parcourt juste la petite liste renvoyée par la RPC
    for (let i = 0; i < lessonsList.length; i++) {
      const lesson = lessonsList[i];

      // La RPC nous donne directement l'info !
      const isCompleted = lesson.is_completed;

      // Logique simple : Si c'est dans la liste mais pas fini, c'est "Active" (à faire)
      // Si c'est fini, c'est "Completed".
      let status = 'active';
      if (isCompleted) status = 'completed';

      const isBoss = (i + 1) % CONFIG.bossInterval === 0;

      // Positionnement (Garde ton algo visuel pour l'instant)
      const irregularity = Math.sin(i * 1.5) * 30;
      const x = (Math.sin(i * 0.45) * CONFIG.amplitude) + irregularity;
      const y = CONFIG.paddingTop + (i * CONFIG.spacing);

      nodeList.push({
        id: i,
        lesson,
        x,
        y,
        status,
        isBoss,
        isLocked: false, // Plus rien n'est verrouillé visuellement car on n'affiche que le disponible
        is_completed: isCompleted // Add is_completed directly to the node object
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
    </div>
  );
};

export default NeuralPathRoadmap;