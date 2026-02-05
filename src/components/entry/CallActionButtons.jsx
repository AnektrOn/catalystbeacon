import React from 'react';
import { Mic, MicOff, Grid3x3, Volume2, UserPlus, Video, Users } from 'lucide-react';
import './CallActionButtons.css';

/**
 * CallActionButtons Component
 * Grid of 6 call control buttons (mute, keypad, audio, add call, FaceTime, contacts)
 */
const CallActionButtons = ({ 
  isMuted = false,
  onMute,
  onKeypad,
  onAudio,
  onAddCall,
  onFaceTime,
  onContacts
}) => {
  const buttons = [
    {
      id: 'mute',
      icon: isMuted ? MicOff : Mic,
      label: 'mute',
      onClick: onMute,
      active: isMuted
    },
    {
      id: 'keypad',
      icon: Grid3x3,
      label: 'keypad',
      onClick: onKeypad
    },
    {
      id: 'audio',
      icon: Volume2,
      label: 'audio',
      onClick: onAudio
    },
    {
      id: 'add',
      icon: UserPlus,
      label: 'add call',
      onClick: onAddCall
    },
    {
      id: 'facetime',
      icon: Video,
      label: 'FaceTime',
      onClick: onFaceTime
    },
    {
      id: 'contacts',
      icon: Users,
      label: 'contacts',
      onClick: onContacts
    }
  ];

  return (
    <div className="call-action-buttons">
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <button 
            key={button.id}
            className={`call-action-button ${button.active ? 'active' : ''}`}
            onClick={button.onClick}
          >
            <div className="call-action-icon">
              <Icon size={24} strokeWidth={1.5} />
            </div>
            <span className="call-action-label">{button.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CallActionButtons;
