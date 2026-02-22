import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePageTransition } from '../../contexts/PageTransitionContext';
import { supabase } from '../../lib/supabaseClient';
import roadmapService from '../../services/roadmapService';
import useSubscription from '../../hooks/useSubscription';
import NeuralNode from './NeuralNode';
import NeuralCanvas from './NeuralCanvas';
import MissionModal from './MissionModal';
const InstituteSorterModal = React.lazy(() => import('../InstituteSorterModal'));
import CompletionAnimation from './CompletionAnimation';
import { Activity, Crosshair } from 'lucide-react';
import toast from 'react-hot-toast';
import './NeuralPathRoadmap.css';

const CONFIG = {
  count: 10,
  spacing: 180,
  amplitude: 160,
  paddingTop: 200,
  filamentCount: 8,
  filamentChaos: 30,
  particleCount: 60,
  bossInterval: 5
};

const NeuralPathRoadmap = ({ masterschool = 'Ignition', schoolConfig = null }) => {
  const { user } = useAuth();
  const { isFreeUser } = useSubscription();
  const { endTransition } = usePageTransition();
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const recenterBtnRef = useRef(null);
  const animationFrameRef = useRef(null);
  const scrollToActiveAfterUpdateRef = useRef(false);
  const lessonsRef = useRef([]);
  const completionHandledRef = useRef(false);
  const skipNormalLoadAfterCompletionRef = useRef(false);

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
  const [containerSize, setContainerSize] = useState({ width: 600, height: 2000 });

  // Mesure du map-container : une seule source de vérité pour l’alignement canvas / nœuds
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const updateSize = () => {
      const w = el.clientWidth || 600; // clientWidth exclut les bordures/scrollbars (zone de positionnement réelle)
      const h = nodes.length > 0
        ? Math.min(nodes[nodes.length - 1].y + 400, 8000)
        : CONFIG.paddingTop + 500;
      setContainerSize({ width: w, height: Math.min(h, 8000) });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [nodes]);

  // Load user XP and institute_priority
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('current_xp, total_xp_earned, institute_priority')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        setInstitutePriority([]);
        setShowInstituteSorter(true);
        return;
      }
      if (profile) {
        setUserXP(profile.current_xp || profile.total_xp_earned || 0);
        const priority = profile.institute_priority || [];
        setInstitutePriority(priority);
        if (!priority || priority.length === 0) {
          setShowInstituteSorter(true);
        }
      } else {
        setInstitutePriority([]);
        setShowInstituteSorter(true);
      }
    };

    loadUserData();
  }, [user]);

  // Completion: prefer location.state (set by CompleteLessonModal) so we avoid URL/effect races; fallback to URL params.
  useEffect(() => {
    const fromState = location.state?.fromCompletion && location.state?.lessonId;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('completed') === 'true' && params.get('lessonId');
    const lessonId = fromState ? location.state.lessonId : params.get('lessonId');
    const nextLessonId = fromState ? (location.state.nextLessonId ?? null) : params.get('nextLessonId');
    const xp = fromState ? (location.state.xp ?? 0) : parseInt(params.get('xp'), 10) || 0;

    if (!lessonId) {
      completionHandledRef.current = false;
      return;
    }
    if (!fromState && !fromUrl) return;
    if (!user) return;
    if (institutePriority === null) return; // wait for loadUserData
    if (completionHandledRef.current) return;
    completionHandledRef.current = true;

    // Build completedLesson (support negative course_id e.g. "-1999533944-1-1")
    const parts = lessonId.split('-');
    let course_id; let chapter_number; let lesson_number;
    if (parts[0] === '' && parts.length >= 4) {
      course_id = -parseInt(parts[1], 10);
      chapter_number = parseInt(parts[2], 10);
      lesson_number = parseInt(parts[3], 10);
    } else if (parts.length >= 3) {
      course_id = parseInt(parts[0], 10);
      chapter_number = parseInt(parts[1], 10);
      lesson_number = parseInt(parts[2], 10);
    }
    const lessonFromParams = (course_id != null && !Number.isNaN(course_id) && chapter_number != null && lesson_number != null)
      ? { lesson_id: lessonId, course_id, chapter_number, lesson_number, lesson_title: 'Lesson' }
      : null;
    if (lessonFromParams) {
      setCompletedLesson({ lesson: lessonFromParams, xp: Number(xp) || 0 });
      setShowCompletion(true);
    }

    const forceNext = nextLessonId || undefined;
    skipNormalLoadAfterCompletionRef.current = true;
    loadRoadmap(forceNext, lessonId).then(() => {
      window.history.replaceState({}, '', window.location.pathname);
      navigate(location.pathname, { replace: true, state: {} }); // clear completion state
      setTimeout(() => { skipNormalLoadAfterCompletionRef.current = false; }, 3000);
    });
  }, [user, institutePriority, location.state, location.pathname, navigate]);

  // Normal load when no completion in progress. Skip if we have completion state/params or if we just handled completion.
  useEffect(() => {
    if (skipNormalLoadAfterCompletionRef.current) return;
    if (location.state?.fromCompletion) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('completed') === 'true' && params.get('lessonId')) return;

    if (user && institutePriority !== null && !showInstituteSorter) {
      loadRoadmap();
    }
  }, [user, masterschool, institutePriority, showInstituteSorter, location.state]);

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

  // Keep ref in sync for "batch in progress" check
  useEffect(() => {
    lessonsRef.current = lessons;
  }, [lessons]);

  // Helper: compute active index from a lesson list. Never treat just-completed lesson as active.
  const getActiveIndex = (list, forceActiveLessonId, justCompletedLessonId) => {
    if (!list?.length) return 0;
    let activeIndex = -1;
    if (forceActiveLessonId) {
      activeIndex = list.findIndex(l => l.lesson_id === forceActiveLessonId);
    }
    if (activeIndex === -1 && justCompletedLessonId) {
      const completedIdx = list.findIndex(l => l.lesson_id === justCompletedLessonId);
      const nextIdx = list.findIndex((l, i) => i > completedIdx && !l.is_completed);
      activeIndex = nextIdx >= 0 ? nextIdx : (completedIdx >= 0 ? completedIdx + 1 : 0);
    }
    if (activeIndex === -1) {
      activeIndex = list.findIndex(l =>
        !l.is_completed && l.lesson_id !== justCompletedLessonId
      );
    }
    if (activeIndex === -1) {
      activeIndex = list.findIndex(l => l.lesson_id !== justCompletedLessonId);
    }
    if (justCompletedLessonId && activeIndex >= 0 && list[activeIndex]?.lesson_id === justCompletedLessonId) {
      const nextIdx = list.findIndex((l, i) => i > activeIndex && !l.is_completed);
      activeIndex = nextIdx >= 0 ? nextIdx : activeIndex + 1;
    }
    if (activeIndex < 0 || activeIndex >= list.length) activeIndex = list.length - 1;
    return Math.max(0, activeIndex);
  };

  // Load roadmap data. Keep the same 10 lessons until all 10 are completed, then fetch the next 10.
  const loadRoadmap = async (forceActiveLessonId = null, justCompletedLessonId = null) => {
    try {
      setLoading(true);

      if (!institutePriority || institutePriority.length === 0) {
        setShowInstituteSorter(true);
        setLoading(false);
        return;
      }

      const current = lessonsRef.current;
      const batchInProgress = current.length >= 10 && current.some(l => !l.is_completed);

      // Same batch in progress: don't replace list until all 10 are completed
      if (batchInProgress) {
        if (justCompletedLessonId) {
          const updatedLessons = current.map(l =>
            l.lesson_id === justCompletedLessonId ? { ...l, is_completed: true } : l
          );
          setLessons(updatedLessons);
          if (updatedLessons.every(l => l.is_completed)) {
            // All 10 done: fetch next batch
            const nextBatch = await roadmapService.getRoadmapLessons(masterschool, user.id, 10);
            if (nextBatch?.length > 0) {
              const list = nextBatch.slice(0, 10);
              setLessons(list);
              const level = getActiveIndex(list, null, null);
              setCurrentLevel(level);
              createNodes(list, level);
            } else {
              setCurrentLevel(getActiveIndex(updatedLessons, forceActiveLessonId, justCompletedLessonId));
              createNodes(updatedLessons, getActiveIndex(updatedLessons, forceActiveLessonId, justCompletedLessonId));
            }
          } else {
            const level = getActiveIndex(updatedLessons, forceActiveLessonId, justCompletedLessonId);
            setCurrentLevel(level);
            createNodes(updatedLessons, level);
          }
        } else {
          const level = getActiveIndex(current, forceActiveLessonId, null);
          setCurrentLevel(level);
          createNodes(current, level);
        }
        setLoading(false);
        return;
      }

      const layerLessons = await roadmapService.getRoadmapLessons(masterschool, user.id, 10);
      console.log(`[Roadmap] Loaded ${layerLessons.length} lessons (requested: 10)`);

      if (layerLessons.length === 0) {
        console.warn('No roadmap lessons returned - user may need to set institute priority');
        setShowInstituteSorter(true);
        setLoading(false);
        return;
      }

      const list = layerLessons.length > 50 ? layerLessons.slice(0, 10) : layerLessons;
      setLessons(list);

      const calculatedLevel = getActiveIndex(list, forceActiveLessonId, justCompletedLessonId);
      setCurrentLevel(calculatedLevel);
      createNodes(list, calculatedLevel);
    } catch (err) {
      console.error('Error loading roadmap:', err);
      setShowInstituteSorter(true);
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

    const MAX_NODES = 50;
    const limitedLessons = lessonsList.slice(0, MAX_NODES);

    if (lessonsList.length > MAX_NODES) {
      console.warn(`Roadmap has ${lessonsList.length} lessons, limiting to ${MAX_NODES} for performance`);
    }

    for (let i = 0; i < limitedLessons.length; i++) {
      const lesson = limitedLessons[i];
      const isCompleted = lesson.is_completed;

      let status = 'locked';
      if (isCompleted) status = 'completed';
      else if (i === activeLevel) status = 'active';

      // Sinusoidal path — éthéré wave
      const angle = i * 0.6;
      let x = Math.sin(angle) * CONFIG.amplitude;
      // Subtle organic drift (deterministic, no Math.random)
      x += Math.sin(i * 0.5) * 12;

      const y = CONFIG.paddingTop + i * CONFIG.spacing;

      const isBoss = (i + 1) % CONFIG.bossInterval === 0;
      // Boss nodes snap to centre for visual emphasis
      if (isBoss) x = 0;

      nodeList.push({
        id: i,
        lesson,
        x,
        y,
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

  // Initial scroll to active, and scroll after completion when nodes have updated
  useEffect(() => {
    if (nodes.length > 0 && !loading) {
      const delay = scrollToActiveAfterUpdateRef.current ? 300 : 800;
      if (scrollToActiveAfterUpdateRef.current) {
        scrollToActiveAfterUpdateRef.current = false;
      }
      const t = setTimeout(() => {
        scrollToActive(true);
      }, delay);
      return () => clearTimeout(t);
    }
  }, [nodes, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSavePriority = async (newPriority) => {
    setInstitutePriority(newPriority);
    setShowInstituteSorter(false);

    if (!user?.id) {
      loadRoadmap();
      return;
    }

    // Prefer RPC so save persists (bypasses profile UPDATE triggers that can break direct .update)
    const { data: rpcData, error: rpcError } = await supabase.rpc('update_institute_priority', {
      p_user_id: user.id,
      p_institute_priority: newPriority
    });

    if (!rpcError && rpcData?.success) {
      loadRoadmap();
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ institute_priority: newPriority })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to save institute priority:', error);
      toast.error('Failed to save institute priority. Please try again.');
      setShowInstituteSorter(true);
      setInstitutePriority(null);
      return;
    }

    loadRoadmap();
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
        <div className="loading-spinner" />
        <p style={{ marginTop: '16px', fontSize: '8px', letterSpacing: '0.8em', textTransform: 'uppercase', opacity: 0.4 }}>
          Initializing Neural Path...
        </p>
      </div>
    );
  }

  const containerHeight = nodes.length > 0
    ? nodes[nodes.length - 1].y + 400
    : CONFIG.paddingTop + 500;

  return (
    <div id="roadmap-container" className="neural-path-container">

      {/* === ÉTHÉRÉ HUD === */}
      <div className="neural-hud">
        {/* Left — school identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '4px', height: '4px', borderRadius: '50%',
              background: '#00e5ff', boxShadow: '0 0 10px #00e5ff'
            }} />
            <span className="hud-sub-label">Système de Conscience</span>
          </div>
          <span className="hud-val" style={{ marginLeft: '20px' }}>
            {masterschool.toUpperCase()}
          </span>
        </div>

        {/* Right — XP */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className="hud-sub-label">{userXP.toLocaleString()} XP</span>
          <div style={{ width: '160px', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>

      {/* === MAP CONTAINER === */}
      <div
        className="map-container"
        id="mapContainer"
        ref={mapContainerRef}
        style={{ minHeight: `${containerHeight}px` }}
      >
        <NeuralCanvas
          ref={canvasRef}
          nodes={nodes}
          currentLevel={currentLevel}
          config={CONFIG}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
        />

        {nodes.map(node => (
          <NeuralNode
            key={node.id}
            id={`neural-node-${node.id}`}
            node={node}
            containerWidth={containerSize.width}
            onClick={() => handleNodeClick(node)}
          />
        ))}
      </div>

      {/* Top/Bottom vignette fade */}
      <div className="roadmap-vignette" />

      {/* Bottom-left stream label */}
      <div className="roadmap-stream-label">
        <Activity style={{ width: '12px', height: '12px' }} />
        <span>Stream v3.1.0</span>
        <div style={{ width: '80px', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
      </div>

      {/* Recenter Button */}
      <button
        ref={recenterBtnRef}
        id="recenter-btn"
        className="recenter-btn"
        onClick={() => scrollToActive(true)}
      >
        <Crosshair style={{ width: '16px', height: '16px' }} />
      </button>

      {/* Mission Modal */}
      <MissionModal
        isOpen={isModalOpen}
        node={selectedNode}
        masterschool={masterschool}
        onClose={() => setIsModalOpen(false)}
        onStart={startLevel}
        onComplete={async () => {
          await loadRoadmap();
          setTimeout(() => scrollToActive(true), 500);
        }}
      />

      {/* Completion Animation */}
      <CompletionAnimation
        isVisible={showCompletion}
        xpEarned={completedLesson?.xp || 0}
        lessonTitle={completedLesson?.lesson?.lesson_title || ''}
        onComplete={async () => {
          setShowCompletion(false);
          scrollToActiveAfterUpdateRef.current = true;
          await loadRoadmap();
        }}
      />

      {/* Institute Sorter Modal */}
      {showInstituteSorter && user && (
        <React.Suspense fallback={null}>
          <InstituteSorterModal
            onClose={handleCloseSorter}
            onSave={handleSavePriority}
          />
        </React.Suspense>
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