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
  const [completedSet, setCompletedSet] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedLesson, setCompletedLesson] = useState(null);

  // Load user XP
  useEffect(() => {
    const loadUserXP = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_xp, total_xp_earned')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserXP(profile.current_xp || profile.total_xp_earned || 0);
      }
    };
    
    loadUserXP();
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
  const loadRoadmap = async () => {
    try {
      setLoading(true);
      
      // Get lessons
      const allLessons = await roadmapService.getRoadmapLessons(masterschool);
      setLessons(allLessons);

      // Get roadmap progress from roadmap_progress table
      const roadmapProgress = await roadmapService.getUserRoadmapProgress(user.id, masterschool);
      
      // Extract completed lessons from roadmap_progress
      const completedFromRoadmap = new Set();
      if (roadmapProgress?.lessons_completed && Array.isArray(roadmapProgress.lessons_completed)) {
        roadmapProgress.lessons_completed.forEach((lesson) => {
          const key = `${lesson.course_id}-${lesson.chapter_number}-${lesson.lesson_number}`;
          completedFromRoadmap.add(key);
        });
      }

      // Also check user_lesson_progress as fallback
      const { data: lessonProgressData } = await supabase
        .from('user_lesson_progress')
        .select('course_id, chapter_number, lesson_number, is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      const completedFromProgress = new Set(
        (lessonProgressData || []).map(c => `${c.course_id}-${c.chapter_number}-${c.lesson_number}`)
      );

      // Merge both sets (roadmap_progress is authoritative)
      const completed = new Set([...completedFromRoadmap, ...completedFromProgress]);
      setCompletedSet(completed);

      // Find current level based on roadmap_progress current_lesson_id or first incomplete
      let currentIndex = -1;
      if (roadmapProgress?.current_lesson_id) {
        // Find lesson by lesson_id from roadmap_progress
        currentIndex = allLessons.findIndex(l => l.lesson_id === roadmapProgress.current_lesson_id);
      }
      
      // If not found, find first incomplete lesson
      if (currentIndex === -1) {
        currentIndex = allLessons.findIndex((lesson) => {
          const key = `${lesson.course_id}-${lesson.chapter_number}-${lesson.lesson_number}`;
          return !completed.has(key);
        });
      }

      // If all completed, set to last lesson
      if (currentIndex === -1) {
        currentIndex = allLessons.length - 1;
      }

      setCurrentLevel(currentIndex);

      // Create nodes - use roadmap_progress to determine unlocked status
      createNodes(allLessons, completed, currentIndex);

      // Update user XP
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_xp, total_xp_earned')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserXP(profile.current_xp || profile.total_xp_earned || 0);
      }

    } catch (err) {
      // Even on error, end transition to prevent infinite loading
      setTimeout(() => {
        endTransition();
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  // Create nodes from lessons - determine unlock status from roadmap_progress
  const createNodes = (lessonsList, completed, currentIdx) => {
    const nodeList = [];
    
    for (let i = 0; i < lessonsList.length; i++) {
      const lesson = lessonsList[i];
      const key = `${lesson.course_id}-${lesson.chapter_number}-${lesson.lesson_number}`;
      const isCompleted = completed.has(key);
      const isActive = i === currentIdx;
      
      // Determine if lesson is unlocked based on roadmap_progress
      // First lesson is always unlocked, others require previous lesson completion
      let isUnlocked = false;
      if (i === 0) {
        isUnlocked = true; // First lesson always unlocked
      } else {
        // Check if previous lesson is completed
        const prevLesson = lessonsList[i - 1];
        const prevKey = `${prevLesson.course_id}-${prevLesson.chapter_number}-${prevLesson.lesson_number}`;
        isUnlocked = completed.has(prevKey);
      }
      
      const isLocked = !isUnlocked && !isCompleted;
      const isBoss = (i + 1) % CONFIG.bossInterval === 0;

      const irregularity = Math.sin(i * 1.5) * 30;
      const x = (Math.sin(i * 0.45) * CONFIG.amplitude) + irregularity;
      const y = CONFIG.paddingTop + (i * CONFIG.spacing);

      let status = 'locked';
      if (isCompleted) status = 'completed';
      else if (isActive && isUnlocked) status = 'active';
      else if (isUnlocked) status = 'unlocked';

      nodeList.push({
        id: i,
        lesson,
        x,
        y,
        status,
        isBoss,
        isLocked: !isUnlocked
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
    navigate(`/courses/${lesson.course_id}/chapters/${lesson.chapter_number}/lessons/${lesson.lesson_number}?return=${returnUrl}&fromRoadmap=true`);
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
    <div className="neural-path-container">
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
        onComplete={() => {
          // Reload roadmap to update progress
          loadRoadmap();
        }}
      />

      {/* Completion Animation */}
      <CompletionAnimation
        isVisible={showCompletion}
        xpEarned={completedLesson?.xp || 0}
        lessonTitle={completedLesson?.lesson?.lesson_title || ''}
        onComplete={() => {
          setShowCompletion(false);
          // Reload roadmap and scroll to next active node
          loadRoadmap().then(() => {
            setTimeout(() => {
              scrollToActive(true);
            }, 500);
          });
        }}
      />
    </div>
  );
};

export default NeuralPathRoadmap;
