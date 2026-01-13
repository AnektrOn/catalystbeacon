import React, { memo, useMemo, useCallback } from 'react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherFeedWidget = memo(({ posts = [] }) => {
    const navigate = useNavigate();
    
    // Memoize timestamp formatting function
    const formatTimestamp = useCallback((date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    }, []);
    
    // Memoize post transformation to avoid recalculation on every render
    const displayPosts = useMemo(() => posts.map(post => ({
        id: post.id,
        title: post.title || post.content?.substring(0, 50) || 'Untitled',
        excerpt: post.excerpt || post.content?.substring(0, 150) || '',
        author: post.profiles?.full_name || post.profiles?.email || 'Unknown',
        timestamp: post.created_at ? new Date(post.created_at) : new Date(),
        mediaUrl: post.image_url || post.video_url || null
    })), [posts]);

    return (
        <div className="glass-panel-floating p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-ethereal-white mb-1">
                        The Wayless Path
                    </h3>
                    <p className="text-sm text-ethereal-text">
                        Wisdom from the teachers
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/community')}
                    className="text-sm font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    style={{ color: 'var(--color-info)' }}
                    aria-label="View all teacher posts in community"
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'color-mix(in srgb, var(--color-info) 90%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-info)';
                    }}
                >
                    View All
                    <ArrowRight size={14} aria-hidden="true" />
                </button>
            </div>

            {/* Posts List */}
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {displayPosts.length === 0 ? (
                    <div className="text-center py-8 text-ethereal-text">
                        <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No teacher posts yet.</p>
                        <p className="text-xs mt-1 opacity-75">Check back soon for wisdom from the teachers!</p>
                    </div>
                ) : (
                    displayPosts.map((post) => (
                        <div
                            key={post.id}
                            className="p-4 rounded-ethereal bg-ethereal-glass border border-ethereal hover:bg-ethereal-glass-hover hover:border-ethereal-hover transition-all duration-300 cursor-pointer group"
                        >
                            <div className="flex items-start gap-3">
                                <div 
                                    className="p-2 rounded-lg flex-shrink-0"
                                    style={{
                                        backgroundColor: 'color-mix(in srgb, var(--color-info) 10%, transparent)',
                                        color: 'var(--color-info)'
                                    }}
                                >
                                    <BookOpen size={16} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 
                                        className="text-base font-medium text-ethereal-white mb-1 transition-colors"
                                        style={{
                                            color: 'inherit'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = 'var(--color-info)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '';
                                        }}
                                    >
                                        "{post.title}"
                                    </h4>
                                    <p className="text-sm text-ethereal-text mb-2 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="font-medium">{post.author}</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            <span>{formatTimestamp(post.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

TeacherFeedWidget.displayName = 'TeacherFeedWidget';

export default TeacherFeedWidget;
