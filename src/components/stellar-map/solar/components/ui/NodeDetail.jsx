import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Circle } from 'lucide-react';
import { useSelectedNode } from '../../contexts/SelectedNodeContext';
import { useCameraContext } from '../../contexts/CameraContext';
import { useCompletionRefresh } from '../../contexts/CompletionRefreshContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import stellarMapService from '../../../../../services/stellarMapService';
import YouTubePlayerModal from '../../../YouTubePlayerModal';

function getYouTubeVideoId(link) {
  if (!link || typeof link !== 'string') return null;
  const trimmed = link.trim();
  const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return ytMatch ? ytMatch[1] : null;
}

export default function NodeDetail() {
  const [selectedNode] = useSelectedNode();
  const { cameraState } = useCameraContext();
  const { user } = useAuth();
  const completionRefresh = useCompletionRefresh();
  const incrementCompletionVersion = completionRefresh?.incrementCompletionVersion;
  const [displayedNode, setDisplayedNode] = useState(selectedNode);
  const [isCompleted, setIsCompleted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (cameraState === 'DETAIL_VIEW') {
      setDisplayedNode(selectedNode);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [cameraState, selectedNode]);

  useEffect(() => {
    if (!user?.id || !displayedNode?.id || cameraState !== 'DETAIL_VIEW') return;
    let cancelled = false;
    stellarMapService.checkNodeCompletion(user.id, displayedNode.id).then(({ data }) => {
      if (!cancelled) setIsCompleted(!!data);
    });
    return () => { cancelled = true; };
  }, [user?.id, displayedNode?.id, cameraState]);

  const shouldDisplayDetails = cameraState === 'DETAIL_VIEW' && displayedNode;
  const videoId = getYouTubeVideoId(displayedNode?.link);
  const xpReward = displayedNode?.metadata?.xp_reward ?? displayedNode?.xp_reward ?? 50;
  const skills = Array.isArray(displayedNode?.metadata?.selected_skills)
    ? displayedNode.metadata.selected_skills
    : Array.isArray(displayedNode?.selected_skills)
      ? displayedNode.selected_skills
      : [];

  const handleModalComplete = () => {
    setIsCompleted(true);
    if (incrementCompletionVersion) incrementCompletionVersion();
  };

  if (!shouldDisplayDetails) return null;

  return (
    <>
      <div
        key={displayedNode?.id ?? 'empty'}
        className="absolute left-5 right-5 top-20 mt-4 max-w-md z-10 transition-all duration-500 ease-out"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
            <h1 className="tracking-tight font-semibold text-2xl lg:text-3xl opacity-90 text-white line-clamp-3">
              {displayedNode?.title ?? ''}
            </h1>
            <p className="text-sm text-white/80 mt-1">
              {displayedNode?.constellationAlias ?? displayedNode?.constellation_name ?? displayedNode?.constellations?.name}
              {(displayedNode?.familyAlias ?? displayedNode?.family_name) && ` · ${displayedNode.familyAlias ?? displayedNode.family_name}`}
            </p>
            <p className="text-xs text-white/60 mt-0.5">
              {displayedNode?.difficulty_label ?? `Difficulty ${displayedNode?.difficulty ?? ''}`}
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm text-white/80">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 text-green-400">
                  <CheckCircle size={14} /> Complété
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-white/70">
                  <Circle size={14} /> À faire
                </span>
              )}
              <span className="text-white/60">·</span>
              <span>+{xpReward} XP</span>
            </div>
            {videoId ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-white/20 text-white text-sm hover:bg-white/30 transition-colors"
              >
                <Play size={14} /> Regarder la vidéo
              </button>
            ) : displayedNode?.link ? (
              <a
                href={displayedNode.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 px-3 py-2 rounded-lg bg-white/20 text-white text-sm hover:bg-white/30 transition-colors"
              >
                Ouvrir le lien →
              </a>
            ) : null}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.map((skill) => (
                  <span key={skill} className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/80">
                    {skill}
                  </span>
                ))}
              </div>
            )}
      </div>
      <YouTubePlayerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        nodeData={displayedNode}
        videoId={videoId || ''}
        onComplete={handleModalComplete}
      />
    </>
  );
}
