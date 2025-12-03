import React from 'react';

const NotificationBadge = ({ count = 0, showDot = false }) => {
    if (count === 0 && !showDot) return null;

    if (showDot) {
        return <div className="glass-notification-dot" />;
    }

    return (
        <div className="glass-notification-badge">
            {count > 99 ? '99+' : count}
        </div>
    );
};

export default NotificationBadge;
