import React from 'react';
import { Phone, PhoneOff, MessageCircle, AlarmClock } from 'lucide-react';
import './IPhoneIncomingCall.css';

/**
 * IPhoneIncomingCall Component
 * iOS-style incoming call interface
 * Matches reference image exactly: "The Future is calling"
 */
const IPhoneIncomingCall = ({ 
  onAccept, 
  onDecline,
  callerName = 'Note',
  callerSubtext = 'is calling',
  callerPhoto
}) => {
  return (
    <div className="iphone-incoming-call">
      {/* Top: Caller name */}
      <div className="call-header">
        <h1 className="caller-name">{callerName}</h1>
        <p className="caller-subtext">{callerSubtext}</p>
      </div>

      {/* Photo de profil */}
      {callerPhoto && (
        <div className="caller-photo-container">
          <img src={callerPhoto} alt={callerName} className="caller-photo" />
        </div>
      )}

      {/* Spacer to push content down */}
      <div className="call-spacer"></div>

      {/* Middle: Action buttons (Remind Me, Message) */}
      <div className="call-actions-top">
        <button className="call-action-btn">
          <div className="action-icon">
            <AlarmClock size={26} strokeWidth={1.5} />
          </div>
          <span className="action-label">Remind Me</span>
        </button>
        
        <button className="call-action-btn">
          <div className="action-icon">
            <MessageCircle size={26} strokeWidth={1.5} />
          </div>
          <span className="action-label">Message</span>
        </button>
      </div>

      {/* Bottom: Decline and Accept buttons */}
      <div className="call-actions-bottom">
        <button className="call-main-btn decline-btn" onClick={onDecline}>
          <div className="main-btn-icon">
            <PhoneOff size={34} strokeWidth={2} />
          </div>
          <span className="main-btn-label">Decline</span>
        </button>
        
        <button className="call-main-btn accept-btn" onClick={onAccept}>
          <div className="main-btn-icon">
            <Phone size={34} strokeWidth={2} style={{ transform: 'rotate(135deg)' }} />
          </div>
          <span className="main-btn-label">Accept</span>
        </button>
      </div>
    </div>
  );
};

export default IPhoneIncomingCall;
