import React from 'react';

const NotificationBadge = ({ count = 0, showDot = false }) => {
    // Always show dot if there are notifications, even if count is 0
    if (count > 0 || showDot) {
        if (showDot || count === 0) {
            return <div className="glass-notification-dot" />;
        }
        
        return (
            <div className="glass-notification-badge">
                {count > 99 ? '99+' : count}
            </div>
        );
    }

    return null;
};

export default NotificationBadge;
