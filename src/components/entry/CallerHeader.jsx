import React from 'react';
import './CallerHeader.css';

/**
 * CallerHeader Component
 * Displays caller name and call duration timer
 */
const CallerHeader = ({ callerName = 'Caller', duration = 0 }) => {
  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="caller-header">
      <h2 className="caller-header-name">{callerName}</h2>
      <p className="caller-header-duration">{formatDuration(duration)}</p>
    </div>
  );
};

export default CallerHeader;
