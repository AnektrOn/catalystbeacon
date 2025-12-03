import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CreatePostModal from '../components/social/CreatePostModal'
import socialService from '../services/socialService'
import {
  Users,
  MessageCircle,
  Heart,
  Share2,
  Plus,
  Search,
  TrendingUp,
  Star,
  Award,
  Target,
  Calendar,
  Eye,
  Reply,
  MoreHorizontal,
  Trophy
} from 'lucide-react'

const CommunityPage = () => {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('feed')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [leaderboard, setLeaderboard] = useState([])
  const [challenges, setChallenges] = useState([])

  // Mock data for now - will be replaced with real API calls
  const mockPosts = [
    {
      id: '1',
      user: {
        id: 'user1',
        name: 'Alex Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        level: 8,
        title: 'Mindful Explorer',
        xp: 2450
      },
      content: 'Just completed my 30-day meditation streak! 🧘‍♀️ The transformation in my focus and clarity has been incredible. Who else is on a mindfulness journey?',
      type: 'text',
      tags: ['mindfulness', 'meditation', 'personal-growth'],
      likes: 23,
      comments: 8,
      shares: 3,
      createdAt: '2 hours ago',
      isLiked: false
    },
    {
      id: '2',
      user: {
        id: 'user2',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        level: 12,
        title: 'Wisdom Seeker',
        xp: 4200
      },
      content: 'Sharing my latest learning: The power of compound habits. Small daily actions create massive long-term results. What\'s one small habit you\'ve been consistent with?',
      type: 'text',
      tags: ['habits', 'productivity', 'learning'],
      likes: 45,
      comments: 12,
      shares: 7,
      createdAt: '4 hours ago',
      isLiked: true
    },
    {
      id: '3',
      user: {
        id: 'user3',
        name: 'Marcus Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        level: 15,
        title: 'Transformation Catalyst',
        xp: 6800
      },
      content: 'Just unlocked the "Discipline Master" achievement! 🏆 100 days of consistent morning routine. The key was starting small and building momentum.',
      type: 'achievement',
      tags: ['achievement', 'discipline', 'morning-routine'],
      likes: 67,
      comments: 15,
      shares: 12,
      createdAt: '6 hours ago',
      isLiked: false
    }
  ]

  const mockLeaderboard = [
    { id: '1', full_name: 'Elena Martinez', current_xp: 12500, level: 18, title: 'Enlightened Sage', avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
    { id: '2', full_name: 'David Kim', current_xp: 11200, level: 17, title: 'Wisdom Keeper', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { id: '3', full_name: 'Lisa Wang', current_xp: 10800, level: 16, title: 'Transformation Master', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { id: '4', full_name: 'James Wilson', current_xp: 9500, level: 15, title: 'Growth Catalyst', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
    { id: '5', full_name: 'Maria Garcia', current_xp: 8900, level: 14, title: 'Insight Seeker', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' }
  ]

  const mockChallenges = [
    {
      id: '1',
      title: '30-Day Mindfulness Challenge',
      description: 'Practice meditation or mindfulness for 30 consecutive days',
      participants: 156,
      xpReward: 500,
      endDate: '2024-02-15',
      isParticipating: true
    },
    {
      id: '2',
      title: 'Habit Stacking Mastery',
      description: 'Create and maintain 3 new positive habits for 21 days',
      participants: 89,
      xpReward: 300,
      endDate: '2024-02-20',
      isParticipating: false
    },
    {
      id: '3',
      title: 'Knowledge Sharing Week',
      description: 'Share one learning insight every day for a week',
      participants: 234,
      xpReward: 200,
      endDate: '2024-02-10',
      isParticipating: true
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load posts
      const postsResult = await socialService.getPosts()
      if (postsResult.data) {
        setPosts(postsResult.data)
      } else {
        setPosts(mockPosts)
      }

      // Load leaderboard
      const leaderboardResult = await socialService.getLeaderboard()
      if (leaderboardResult.data) {
        setLeaderboard(leaderboardResult.data)
      } else {
        setLeaderboard(mockLeaderboard)
      }

      // Load challenges
      const challengesResult = await socialService.getChallenges()
      if (challengesResult.data) {
        setChallenges(challengesResult.data)
      } else {
        setChallenges(mockChallenges)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setPosts(mockPosts)
      setLeaderboard(mockLeaderboard)
      setChallenges(mockChallenges)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    if (!user) return

    try {
      const result = await socialService.togglePostLike(postId, user.id)
      if (result.data) {
        setPosts(posts.map(post =>
          post.id === postId
            ? {
              ...post,
              isLiked: result.data.liked,
              likes_count: result.data.liked ? post.likes_count + 1 : post.likes_count - 1
            }
            : post
        ))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleShare = (postId) => {
    console.log('Sharing post:', postId)
  }

  const handlePostCreated = (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts])
  }

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageCircle },
    { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
    { id: 'challenges', label: 'Challenges', icon: Target },
    { id: 'discover', label: 'Discover', icon: Search }
  ]

  return (
    <div className="h-full w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">
            Community
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Connect, learn, and grow together</p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowCreatePost(true)}
            className="px-4 py-2 bg-[#B4833D] hover:bg-[#B4833D]/90 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-[#B4833D]/30 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Post</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts, users, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#B4833D]/50 focus:border-[#B4833D]/50 backdrop-blur-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full sm:w-auto px-4 py-3 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B4833D]/50 backdrop-blur-sm"
        >
          <option value="all">All Posts</option>
          <option value="text">Text Posts</option>
          <option value="achievement">Achievements</option>
          <option value="question">Questions</option>
        </select>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="xl:hidden mb-6 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl p-2 border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex space-x-2 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-[#B4833D] text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/10'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Left Sidebar - Navigation */}
        <div className="hidden xl:block xl:col-span-1">
          <div className="glass-panel-floating p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Navigation</h3>
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-[#B4833D] text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="xl:col-span-2">
          {activeTab === 'feed' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B4833D]"></div>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="glass-card-premium p-6 animate-fade-in">
                    {/* Post Header */}
                    <div className="flex items-start space-x-3 mb-4">
                      <img
                        src={post.profiles?.avatar_url || post.user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                        alt={post.profiles?.full_name || post.user?.name || 'User'}
                        className="w-12 h-12 rounded-full border-2 border-[#B4833D]/20 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base truncate">
                            {post.profiles?.full_name || post.user?.name || 'User'}
                          </h4>
                          <span className="text-xs bg-[#B4833D]/10 text-[#B4833D] px-2 py-0.5 rounded-full inline-block w-fit mt-1 sm:mt-0 font-medium border border-[#B4833D]/20">
                            Level {post.profiles?.level || post.user?.level || 1}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {post.created_at ? new Date(post.created_at).toLocaleDateString() : post.createdAt}
                        </p>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Post Title */}
                    {post.title && (
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                    )}

                    {/* Post Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{post.content}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                        >
                          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">{post.likes_count || post.likes || 0}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-500 hover:text-[#B4833D] transition-colors">
                          <Reply className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.comments_count || post.comments || 0}</span>
                        </button>
                        <button
                          onClick={() => handleShare(post.id)}
                          className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.shares_count || post.shares || 0}</span>
                        </button>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2 text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">1.2k views</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="glass-panel-floating p-6">
              <h3 className="text-xl font-bold mb-8 text-gray-900 dark:text-white text-center">Top Performers</h3>

              {/* Podium for Top 3 */}
              {leaderboard.length >= 3 ? (
                <div className="mb-10">
                  <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#B4833D] to-[#81754B] rounded-full flex items-center justify-center shadow-lg">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex items-end justify-center space-x-4">
                    {/* 2nd Place */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <img
                          src={leaderboard[1]?.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + 1 * 100000000}?w=60&h=60&fit=crop&crop=face`}
                          alt={leaderboard[1]?.full_name || 'User'}
                          className="w-16 h-16 rounded-full border-4 border-gray-300 dark:border-gray-600"
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                          2
                        </div>
                      </div>
                      <div className="text-center mb-2">
                        <p className="text-gray-900 dark:text-white font-bold text-sm">{leaderboard[1]?.full_name || 'User'}</p>
                        <p className="text-[#B4833D] text-xs font-medium">
                          {leaderboard[1]?.current_xp?.toLocaleString() || 0} XP
                        </p>
                      </div>
                      <div className="w-20 h-20 bg-gray-300/20 dark:bg-gray-600/20 rounded-t-lg flex items-center justify-center border-t border-x border-gray-300/30">
                        <span className="text-gray-500 dark:text-gray-400 font-bold text-2xl">2</span>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <img
                          src={leaderboard[0]?.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + 0 * 100000000}?w=60&h=60&fit=crop&crop=face`}
                          alt={leaderboard[0]?.full_name || 'User'}
                          className="w-24 h-24 rounded-full border-4 border-[#B4833D]"
                        />
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#B4833D] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                          1
                        </div>
                      </div>
                      <div className="text-center mb-2">
                        <p className="text-gray-900 dark:text-white font-bold text-base">{leaderboard[0]?.full_name || 'User'}</p>
                        <p className="text-[#B4833D] text-sm font-bold">
                          {leaderboard[0]?.current_xp?.toLocaleString() || 0} XP
                        </p>
                      </div>
                      <div className="w-24 h-32 bg-[#B4833D]/20 rounded-t-lg flex items-center justify-center border-t border-x border-[#B4833D]/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#B4833D]/10 to-transparent"></div>
                        <span className="text-[#B4833D] font-bold text-3xl z-10">1</span>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        <img
                          src={leaderboard[2]?.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + 2 * 100000000}?w=60&h=60&fit=crop&crop=face`}
                          alt={leaderboard[2]?.full_name || 'User'}
                          className="w-16 h-16 rounded-full border-4 border-orange-700/50"
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-700/70 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                          3
                        </div>
                      </div>
                      <div className="text-center mb-2">
                        <p className="text-gray-900 dark:text-white font-bold text-sm">{leaderboard[2]?.full_name || 'User'}</p>
                        <p className="text-[#B4833D] text-xs font-medium">
                          {leaderboard[2]?.current_xp?.toLocaleString() || 0} XP
                        </p>
                      </div>
                      <div className="w-20 h-16 bg-orange-900/10 dark:bg-orange-900/20 rounded-t-lg flex items-center justify-center border-t border-x border-orange-900/10">
                        <span className="text-orange-800 dark:text-orange-400 font-bold text-2xl">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 text-center py-8">
                  <p className="text-gray-500">Not enough users for podium yet</p>
                </div>
              )}

              {/* List for remaining users */}
              <div className="space-y-3">
                {leaderboard.slice(3).map((user, index) => (
                  <div key={user.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm">
                      {index + 4}
                    </div>
                    <img
                      src={user.avatar_url || `https://images.unsplash.com/photo-${1500000000000 + (index + 3) * 100000000}?w=40&h=40&fit=crop&crop=face`}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{user.full_name}</h4>
                      <p className="text-[#B4833D] text-sm flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {user.current_xp?.toLocaleString() || 0} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-6">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="glass-card-premium p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{challenge.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{challenge.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                          <Users className="w-4 h-4" />
                          <span>{challenge.participants || 0} participants</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-[#B4833D]/10 text-[#B4833D] px-2 py-1 rounded-lg font-medium">
                          <Star className="w-4 h-4" />
                          <span>{challenge.xp_reward || challenge.xpReward || 0} XP</span>
                        </div>
                        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">
                          <Calendar className="w-4 h-4" />
                          <span>Ends {challenge.end_date ? new Date(challenge.end_date).toLocaleDateString() : challenge.endDate}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-md ${challenge.isParticipating
                          ? 'bg-green-500/10 text-green-600 border border-green-500/20 cursor-default'
                          : 'bg-[#B4833D] text-white hover:bg-[#B4833D]/90 hover:shadow-lg hover:scale-105'
                        }`}
                    >
                      {challenge.isParticipating ? 'Participating' : 'Join Challenge'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="glass-panel-floating p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Discover Content</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Explore trending topics, find new connections, and discover inspiring content. Coming soon!
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Stats */}
        <div className="hidden xl:block xl:col-span-1">
          <div className="space-y-6 sticky top-24">
            {/* Your Stats */}
            <div className="glass-panel-floating p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Level</span>
                  <span className="text-[#B4833D] font-bold">{profile?.level || 1}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Total XP</span>
                  <span className="text-[#B4833D] font-bold">{profile?.current_xp || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Posts</span>
                  <span className="text-gray-900 dark:text-white font-bold">12</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Followers</span>
                  <span className="text-gray-900 dark:text-white font-bold">89</span>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="glass-panel-floating p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#B4833D]" />
                Trending
              </h3>
              <div className="space-y-3">
                {['#mindfulness', '#productivity', '#learning', '#habits', '#growth'].map((topic, index) => (
                  <div key={index} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-gray-600 dark:text-gray-400 group-hover:text-[#B4833D] transition-colors">{topic}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg">{Math.floor(Math.random() * 1000)} posts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}

export default CommunityPage
