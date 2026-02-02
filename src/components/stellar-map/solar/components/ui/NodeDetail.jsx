import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelectedNode } from '../../contexts/SelectedNodeContext';
import { useCameraContext } from '../../contexts/CameraContext';

export default function NodeDetail() {
  const [selectedNode] = useSelectedNode();
  const { cameraState } = useCameraContext();
  const [displayedNode, setDisplayedNode] = useState(selectedNode);

  useEffect(() => {
    if (cameraState === 'DETAIL_VIEW') {
      setDisplayedNode(selectedNode);
    }
  }, [cameraState, selectedNode]);

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const shouldDisplayDetails = cameraState === 'DETAIL_VIEW' && displayedNode;

  return (
    <AnimatePresence>
      {shouldDisplayDetails && (
        <motion.div
          key={displayedNode?.id ?? 'empty'}
          className="absolute left-5 right-5 top-20 mt-4 max-w-md z-10"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          transition={{ duration: 0.5, ease: 'easeOut' }}
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
          {displayedNode?.link && (
            <a
              href={displayedNode.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 px-3 py-2 rounded-lg bg-white/20 text-white text-sm hover:bg-white/30 transition-colors"
            >
              Ouvrir le lien →
            </a>
          )}
          {Array.isArray(displayedNode?.selected_skills) && displayedNode.selected_skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {displayedNode.selected_skills.map((skill) => (
                <span key={skill} className="text-xs px-2 py-0.5 rounded bg-white/10 text-white/80">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
