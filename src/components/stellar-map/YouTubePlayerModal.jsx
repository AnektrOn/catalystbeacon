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
  const watchTimeRef = useRef(0); // Track watch time in seconds
  const watchTimeIntervalRef = useRef(null);
  const lastPlayTimeRef = useRef(0);
  const playerInitializedRef = useRef(false);

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
      playerInitializedRef.current = false;
      return;
    }

    // Don't create a new player if one already exists for this video
    if (playerInitializedRef.current && player) {
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

    // Create player with fullscreen support
    const newPlayer = new window.YT.Player(playerContainerRef.current, {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        fs: 1, // Enable fullscreen button
        enablejsapi: 1 // Enable JavaScript API for tracking
      },
      events: {
        onReady: (event) => {
          setIsLoading(false);
          setError(null);
          
          // Start tracking watch time
          watchTimeIntervalRef.current = setInterval(() => {
            try {
              const currentTime = newPlayer.getCurrentTime();
              const playerState = newPlayer.getPlayerState();
              
              // Only track if video is playing (state 1 = playing)
              if (playerState === 1) {
                const timeDiff = currentTime - lastPlayTimeRef.current;
                if (timeDiff > 0 && timeDiff < 5) { // Prevent jumps (seeking)
                  watchTimeRef.current += timeDiff;
                }
                lastPlayTimeRef.current = currentTime;
              } else if (playerState === 2) { // Paused
                // Don't update lastPlayTimeRef when paused
              } else if (playerState === 0) { // Ended
                watchTimeRef.current = newPlayer.getDuration(); // Full watch time
                clearInterval(watchTimeIntervalRef.current);
              }
            } catch (err) {
              console.warn('Error tracking watch time:', err);
            }
          }, 1000); // Update every second
        },
        onStateChange: (event) => {
          // YT.PlayerState constants:
          // -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
          if (event.data === window.YT.PlayerState.PLAYING) {
            // Video started playing - track time
            try {
              lastPlayTimeRef.current = newPlayer.getCurrentTime();
            } catch (err) {
              console.warn('Error getting current time:', err);
            }
          } else if (event.data === window.YT.PlayerState.ENDED) {
            // Video ended - complete tracking
            watchTimeRef.current = newPlayer.getDuration();
            if (watchTimeIntervalRef.current) {
              clearInterval(watchTimeIntervalRef.current);
            }
            handleVideoComplete();
          }
        },
        onError: (event) => {
          console.error('YouTube player error:', event.data);
          setError('Failed to load video. Please try again.');
          setIsLoading(false);
          if (watchTimeIntervalRef.current) {
            clearInterval(watchTimeIntervalRef.current);
          }
        }
      }
    });

    setPlayer(newPlayer);
    playerInitializedRef.current = true;

    return () => {
      playerInitializedRef.current = false;
      // Clean up watch time tracking
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
        watchTimeIntervalRef.current = null;
      }
      watchTimeRef.current = 0;
      lastPlayTimeRef.current = 0;
      
      // Safely destroy player - check if container still exists in DOM
      if (newPlayer && newPlayer.destroy) {
        try {
          // Check if the container element still exists in the DOM
          if (playerContainerRef.current && playerContainerRef.current.parentNode) {
            newPlayer.destroy();
          } else {
            // Container already removed, just clear the player reference
            // The iframe will be cleaned up by React
            console.log('Player container already removed, skipping destroy');
          }
        } catch (err) {
          // Silently handle errors - container may already be removed
          if (err.name !== 'NotFoundError') {
            console.warn('Error destroying player:', err);
          }
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, videoId, user?.id, nodeData?.id]);

  // Handle video completion
  const handleVideoComplete = async () => {
    if (!user?.id || !nodeData?.id || isCompleting || isCompleted) {
      return;
    }

    setIsCompleting(true);

    try {
      // Stop watch time tracking
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
        watchTimeIntervalRef.current = null;
      }

      // Get final watch time
      const finalWatchTime = watchTimeRef.current;
      const videoDuration = player?.getDuration() || 0;
      const watchPercentage = videoDuration > 0 ? (finalWatchTime / videoDuration) * 100 : 0;

      console.log('📊 Video completion tracking:', {
        watchTime: finalWatchTime,
        videoDuration: videoDuration,
        watchPercentage: watchPercentage.toFixed(1) + '%'
      });

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

      // Only award XP if watched at least 80% of the video
      if (watchPercentage < 80) {
        toast.error(`Please watch at least 80% of the video to earn XP. You watched ${watchPercentage.toFixed(1)}%.`, {
          duration: 5000,
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
    // Clean up watch time tracking
    if (watchTimeIntervalRef.current) {
      clearInterval(watchTimeIntervalRef.current);
      watchTimeIntervalRef.current = null;
    }
    watchTimeRef.current = 0;
    lastPlayTimeRef.current = 0;
    
    // Safely destroy player - check if container still exists in DOM
    if (player && player.destroy) {
      try {
        // Check if the container element still exists in the DOM
        if (playerContainerRef.current && playerContainerRef.current.parentNode) {
          player.destroy();
        } else {
          // Container already removed, just clear the player reference
          console.log('Player container already removed, skipping destroy');
        }
      } catch (err) {
        // Silently handle NotFoundError - container may already be removed
        if (err.name !== 'NotFoundError') {
          console.warn('Error destroying player on close:', err);
        }
      }
    }
    setPlayer(null);
    playerInitializedRef.current = false;
    setIsCompleted(false);
    setIsCompleting(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden my-auto">
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
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tracking Warning Message */}
        <div className="px-4 py-3 bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              <strong>Important:</strong> We track your watching time to reward XP. If you open this video on YouTube directly, we cannot track it and you won't receive XP rewards. Please watch the video here to earn your XP.
            </p>
          </div>
        </div>

        {/* Player Container - Fixed to prevent clipping */}
        <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%', minHeight: '400px', maxHeight: '90vh' }}> {/* 16:9 aspect ratio */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Loading video...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4 z-10">
              <div className="text-center max-w-md">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors min-h-[44px]"
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
              style={{ 
                minHeight: '400px',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1
              }}
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
