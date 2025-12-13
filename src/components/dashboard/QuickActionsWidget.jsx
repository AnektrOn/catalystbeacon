import React, { memo } from 'react';
import { Wind, FileText, Eye, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActionsWidget = memo(({ actions = [] }) => {
    const navigate = useNavigate();

    const defaultActions = [
        {
            id: 'breathwork',
            label: 'Breathwork',
            icon: Wind,
            color: 'var(--color-success, #6BCF7F)',
            action: () => navigate('/mastery/timer')
        },
        {
            id: 'notes',
            label: 'Notes',
            icon: FileText,
            color: 'var(--color-warning, #FFB75B)',
            action: () => navigate('/profile')
        },
        {
            id: 'veilkeeper',
            label: 'Veilkeeper',
            icon: Eye,
            color: 'var(--color-secondary, #A78BFA)',
            action: () => navigate('/mastery')
        },
        {
            id: 'resume',
            label: 'Resume',
            icon: Zap,
            color: 'var(--color-primary, #FF8A5B)',
            action: () => navigate('/courses')
        }
    ];

    const displayActions = actions.length > 0 ? actions : defaultActions;

    return (
        <div className="glass-card-premium p-6">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                Quick Actions
            </div>

            <div className="grid grid-cols-2 gap-3">
                {displayActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <button
                            key={action.id}
                            onClick={action.action}
                            className="group p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-white/70 dark:hover:bg-black/30 hover:scale-105 transition-all duration-300 flex flex-col items-center gap-2"
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                style={{
                                    background: `linear-gradient(135deg, ${action.color}22, ${action.color}44)`,
                                    border: `2px solid ${action.color}`
                                }}
                            >
                                <Icon size={20} style={{ color: action.color }} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {action.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

QuickActionsWidget.displayName = 'QuickActionsWidget';

export default QuickActionsWidget;
