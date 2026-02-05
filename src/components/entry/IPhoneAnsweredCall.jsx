import React, { useState, useEffect } from 'react';
import { PhoneOff } from 'lucide-react';
import CallerHeader from './CallerHeader';
import CallActionButtons from './CallActionButtons';
import './IPhoneAnsweredCall.css';

/**
 * IPhoneAnsweredCall Component
 * iOS-style active call interface
 * Matches reference image 3: timer, action buttons, end call
 */
const IPhoneAnsweredCall = ({ 
  callerName = 'Caller',
  onEndCall,
  onNavigate
}) => {
  const [duration, setDuration] = useState(5); // Start at 5 seconds to match reference
  const [isMuted, setIsMuted] = useState(false);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // After 3 seconds, navigate to the app
  useEffect(() => {
    if (duration >= 8 && onNavigate) {
      const timeout = setTimeout(() => {
        onNavigate();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [duration, onNavigate]);

  const handleEndCall = () => {
    if (onEndCall) {
      onEndCall();
    }
  };

  return (
    <div className="iphone-answered-call">
      {/* Top: Caller name and timer */}
      <CallerHeader callerName={callerName} duration={duration} />

      {/* Spacer */}
      <div className="answered-call-spacer"></div>

      {/* Middle: Action buttons grid */}
      <CallActionButtons 
        isMuted={isMuted}
        onMute={() => setIsMuted(!isMuted)}
        onKeypad={() => {}}
        onAudio={() => {}}
        onAddCall={() => {}}
        onFaceTime={() => {}}
        onContacts={() => {}}
      />

      {/* Bottom: End call button */}
      <div className="end-call-container">
        <button className="end-call-button" onClick={handleEndCall}>
          <div className="end-call-icon">
            <PhoneOff size={32} strokeWidth={2} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default IPhoneAnsweredCall;
