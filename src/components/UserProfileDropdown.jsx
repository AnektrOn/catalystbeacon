import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, LogOut } from 'lucide-react';

const UserProfileDropdown = ({ isOpen, onClose }) => {
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { profile, signOut } = useAuth();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
        onClose();
    };

    return (
        <div ref={dropdownRef} className="glass-user-dropdown">
            {/* User Info Header */}
            <div className="glass-dropdown-header">
                <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-10 h-10 rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                            <User size={20} className="text-white" />
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-kobicha)' }}>
                            {profile?.full_name || 'User'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-coyote)' }}>
                            Level {profile?.level || 1}
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
                <div
                    className="glass-dropdown-item"
                    onClick={() => handleNavigation('/profile')}
                >
                    <User size={16} />
                    <span>Profile</span>
                </div>
                <div
                    className="glass-dropdown-item"
                    onClick={() => handleNavigation('/settings')}
                >
                    <Settings size={16} />
                    <span>Settings</span>
                </div>
            </div>

            <div className="glass-dropdown-divider" />

            {/* Sign Out */}
            <div className="py-1">
                <div
                    className="glass-dropdown-item text-red-600 dark:text-red-400"
                    onClick={handleSignOut}
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </div>
            </div>
        </div>
    );
};

export default UserProfileDropdown;
