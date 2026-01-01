import React from 'react';
import './RoadmapPath.css';

/**
 * RoadmapPath - Winding S-curve path like Duolingo
 * Creates a zigzag path connecting circular lesson bubbles
 */
const RoadmapPath = ({ lessons, completedLessonIds = [] }) => {
  // Calculate positions for each node in a winding path
  const getNodePosition = (index) => {
    const verticalSpacing = 150; // Space between nodes vertically
    const horizontalAmplitude = 120; // How far left/right the path swings
    const cycleLength = 4; // Number of nodes in one S-curve cycle
    
    // Create S-curve using sine wave
    const progress = (index / cycleLength) * Math.PI * 2;
    const x = Math.sin(progress) * horizontalAmplitude;
    const y = index * verticalSpacing;
    
    return { x, y };
  };

  // Create SVG path connecting all nodes
  const createPathData = () => {
    let pathData = '';
    
    lessons.forEach((lesson, index) => {
      const pos = getNodePosition(index);
      
      if (index === 0) {
        pathData += `M ${pos.x + 250},${pos.y + 50}`;
      } else {
        const prevPos = getNodePosition(index - 1);
        const midY = (prevPos.y + pos.y) / 2;
        
        // Create smooth curve
        pathData += ` Q ${prevPos.x + 250},${midY + 50} ${pos.x + 250},${pos.y + 50}`;
      }
    });
    
    return pathData;
  };

  const getConnectionState = (index) => {
    if (index === 0) return 'completed';
    const previousLesson = lessons[index - 1];
    return completedLessonIds.includes(previousLesson?.lesson_id) ? 'completed' : 'locked';
  };

  const totalHeight = lessons.length * 150 + 100;

  return (
    <div className="roadmap-path-container">
      <svg 
        className="roadmap-path-svg"
        width="500"
        height={totalHeight}
        style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}
      >
        {/* Background path (full path) */}
        <path
          d={createPathData()}
          stroke="rgba(180, 131, 61, 0.2)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Progress path (completed portion) */}
        {lessons.map((lesson, index) => {
          if (index === 0) return null;
          
          const connectionState = getConnectionState(index);
          if (connectionState === 'locked') return null;
          
          const startPos = getNodePosition(index - 1);
          const endPos = getNodePosition(index);
          const midY = (startPos.y + endPos.y) / 2;
          
          const segmentPath = `M ${startPos.x + 250},${startPos.y + 50} Q ${startPos.x + 250},${midY + 50} ${endPos.x + 250},${endPos.y + 50}`;
          
          return (
            <path
              key={`progress-${index}`}
              d={segmentPath}
              stroke="#B4833D"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              className="roadmap-path-completed"
            />
          );
        })}
        
        {/* Animated dot traveling on completed path */}
        {completedLessonIds.length > 0 && (
          <circle
            r="6"
            fill="#B4833D"
            className="roadmap-path-dot"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path={createPathData()}
            />
          </circle>
        )}
      </svg>

      {/* Node positions */}
      <div className="roadmap-path-nodes">
        {lessons.map((lesson, index) => {
          const pos = getNodePosition(index);
          
          return (
            <div
              key={lesson.lesson_id}
              className="roadmap-path-node-position"
              style={{
                position: 'absolute',
                left: `calc(50% + ${pos.x}px)`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, 0)',
              }}
            >
              {/* Node component will be rendered here by parent */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapPath;

