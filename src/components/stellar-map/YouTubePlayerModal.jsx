import React, { useState, useEffect, useRef } from 'react';
import { X, Play, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import stellarMapService from '../../services/stellarMapService';
import { useAuth } from '../../contexts/AuthContext';

const YouTubePlayerModal = ({ 
  isOpen, 
  onClose, 
  nodeData, 
  videoId,
  onComplete 
}) => {
  const { user, fetchProfile } = useAuth();
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const playerContainerRef = useRef(null);
  const youtubeAPIReady = useRef(false);

  // Get XP reward from node data
  const xpReward = nodeData?.metadata?.xp_reward || nodeData?.xp_reward || 50;
  const nodeTitle = nodeData?.title || 'Video';

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isOpen) return;

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      youtubeAPIReady.current = true;
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      // Wait for API to be ready
      const checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          youtubeAPIReady.current = true;
          setIsLoading(false);
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      youtubeAPIReady.current = true;
      setIsLoading(false);
    };

    return () => {
      // Cleanup
      if (window.onYouTubeIframeAPIReady) {
        delete window.onYouTubeIframeAPIReady;
      }
    };
  }, [isOpen]);

  // Initialize player when API is ready
  useEffect(() => {
    if (!isOpen || !youtubeAPIReady.current || !playerContainerRef.current || !videoId) {
      return;
    }

    // Check if already completed
    const checkCompletion = async () => {
      if (!user?.id || !nodeData?.id) return;

      try {
        const { data: completion } = await stellarMapService.checkNodeCompletion(user.id, nodeData.id);
        if (completion) {
          setIsCompleted(true);
        }
      } catch (err) {
        console.warn('Error checking completion status:', err);
      }
    };

    checkCompletion();

    // Create player
    const newPlayer = new window.YT.Player(playerContainerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onReady: (event) => {
          setIsLoading(false);
          setError(null);
        },
        onStateChange: (event) => {
          // YT.PlayerState.ENDED = 0
          if (event.data === window.YT.PlayerState.ENDED) {
            handleVideoComplete();
          }
        },
        onError: (event) => {
          console.error('YouTube player error:', event.data);
          setError('Failed to load video. Please try again.');
          setIsLoading(false);
        }
      }
    });

    setPlayer(newPlayer);

    return () => {
      if (newPlayer && newPlayer.destroy) {
        try {
          newPlayer.destroy();
        } catch (err) {
          console.warn('Error destroying player:', err);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, youtubeAPIReady.current, videoId, user?.id, nodeData?.id]);

  // Handle video completion
  const handleVideoComplete = async () => {
    if (!user?.id || !nodeData?.id || isCompleting || isCompleted) {
      return;
    }

    setIsCompleting(true);

    try {
      // Check if already completed (double-check)
      const { data: existing } = await stellarMapService.checkNodeCompletion(user.id, nodeData.id);
      
      if (existing) {
        setIsCompleted(true);
        toast.success('You\'ve already earned XP for this video!', {
          duration: 3000,
          icon: '✓',
        });
        setIsCompleting(false);
        return;
      }

      // Complete node and award XP
      const { data, error: completeError } = await stellarMapService.completeStellarNode(
        user.id,
        nodeData.id,
        xpReward
      );

      if (completeError) {
        throw completeError;
      }

      if (data?.alreadyCompleted) {
        setIsCompleted(true);
        toast.success('You\'ve already earned XP for this video!', {
          duration: 3000,
          icon: '✓',
        });
      } else {
        setIsCompleted(true);
        toast.success(`Video completed! +${xpReward} XP earned`, {
          duration: 4000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#fff',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 9999,
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        });

        // Refresh user profile to update XP
        if (fetchProfile) {
          setTimeout(async () => {
            await fetchProfile(user.id);
          }, 500);
        }

        // Call completion callback
        if (onComplete) {
          onComplete(data);
        }
      }
    } catch (err) {
      console.error('Error completing node:', err);
      toast.error('Failed to award XP. Please try again.', {
        duration: 4000,
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle manual close
  const handleClose = () => {
    if (player && player.destroy) {
      try {
        player.destroy();
      } catch (err) {
        console.warn('Error destroying player on close:', err);
      }
    }
    setPlayer(null);
    setIsCompleted(false);
    setIsCompleting(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' }}>
              <Play size={20} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{nodeTitle}</h3>
              <p className="text-sm text-gray-400">
                {isCompleted ? 'Completed' : `Watch to earn ${xpReward} XP`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Player Container */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}> {/* 16:9 aspect ratio */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Loading video...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
              <div className="text-center max-w-md">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!error && (
            <div
              ref={playerContainerRef}
              className="absolute inset-0 w-full h-full"
              style={{ minHeight: '400px' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {isCompleted && (
                <>
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-green-400">You've earned {xpReward} XP for this video</span>
                </>
              )}
              {!isCompleted && !isCompleting && (
                <span>Complete the video to earn {xpReward} XP</span>
              )}
              {isCompleting && (
                <span className="text-primary">Processing completion...</span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-primary) 20%, transparent)',
                color: 'var(--color-primary)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 30%, transparent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 20%, transparent)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayerModal;
