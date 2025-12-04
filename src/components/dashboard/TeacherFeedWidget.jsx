import React, { memo } from 'react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

const TeacherFeedWidget = memo(({ posts = [] }) => {
    // Transform Supabase posts to widget format
    const displayPosts = posts.map(post => ({
        id: post.id,
        title: post.title || post.content?.substring(0, 50) || 'Untitled',
        excerpt: post.excerpt || post.content?.substring(0, 150) || '',
        author: post.profiles?.full_name || post.profiles?.email || 'Unknown',
        timestamp: post.created_at ? new Date(post.created_at) : new Date(),
        mediaUrl: post.image_url || post.video_url || null
    }));

    const formatTimestamp = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };

    return (
        <div className="glass-panel-floating p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        The Wayless Path
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Wisdom from the teachers
                    </p>
                </div>
                <button className="text-sm font-medium text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                    View All
                    <ArrowRight size={14} />
                </button>
            </div>

            {/* Posts List */}
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {displayPosts.map((post) => (
                    <div
                        key={post.id}
                        className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex-shrink-0">
                                <BookOpen size={16} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                                    "{post.title}"
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
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
                ))}
            </div>
        </div>
    );
});

TeacherFeedWidget.displayName = 'TeacherFeedWidget';

export default TeacherFeedWidget;
