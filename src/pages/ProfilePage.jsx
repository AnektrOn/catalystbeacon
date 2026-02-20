import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { User, Star, Flame, Brain, Upload, X, TrendingUp, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import InstituteSorterModal from '../components/InstituteSorterModal'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "src/components/ui/radar-chart"
import { Badge } from "src/components/ui/badge"
import { MiniChart } from "src/components/ui/mini-chart"
import SkillTree from '../components/profile/SkillTree'
import skillsService from '../services/skillsService'
import levelsService from '../services/levelsService'
import useSubscription from '../hooks/useSubscription'
import SkeletonLoader from '../components/ui/SkeletonLoader'
const ProfilePage = () => {
  const { user, profile, updateProfile, loading: authLoading } = useAuth()
  const { isFreeUser, isAdmin } = useSubscription()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState([]) // eslint-disable-line no-unused-vars
  const [masterStats, setMasterStats] = useState([])
  const [userSkills, setUserSkills] = useState([])
  const [userMasterStats, setUserMasterStats] = useState([])
  const [radarData, setRadarData] = useState({})
  const [currentLevel, setCurrentLevel] = useState(null)
  
  // Chart config for the new radar chart
  const chartConfig = {
    value: {
      label: "Stat Level",
      color: "var(--ethereal-cyan)",
    },
  }

  const formattedRadarData = React.useMemo(() => {
    return Object.entries(radarData).map(([stat, value]) => ({
      stat,
      value: value
    }))
  }, [radarData])

  const [nextLevel, setNextLevel] = useState(null)
  const [activeSkillTab, setActiveSkillTab] = useState(null) // Initialize as null to handle default stat selection
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || ''
  })
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || null)
  const avatarInputRef = useRef(null)
  const [showInstituteSorter, setShowInstituteSorter] = useState(false)

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      })
      setAvatarPreview(profile.avatar_url || null)
    }
  }, [profile])

  // Load skills, levels, and user progress data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load all skills, master stats, and levels
        const [skillsResult, masterStatsResult] = await Promise.all([
          skillsService.getAllSkills(),
          skillsService.getMasterStats()
        ]);

        if (skillsResult.data) setSkills(skillsResult.data);
        if (masterStatsResult.data) {
          setMasterStats(masterStatsResult.data);
          // Set first stat as default if no tab selected
          if (!activeSkillTab && masterStatsResult.data.length > 0) {
            setActiveSkillTab(masterStatsResult.data[0].id);
          }
        }

        // Load user skills and master stats if user exists
        if (user?.id) {
          const [userSkillsResult, userMasterStatsResult] = await Promise.all([
            skillsService.getUserSkills(user.id),
            skillsService.getUserMasterStats(user.id)
          ]);
          
          if (userSkillsResult.data) {
            setUserSkills(userSkillsResult.data);
          }
          
          if (userMasterStatsResult.data) {
            setUserMasterStats(userMasterStatsResult.data);
          }
          
          // Use current_xp from profiles table (the actual XP system)
          const totalXP = profile?.current_xp || 0;
          
          // Debug logging removed for production
          
          // Get current and next level based on total XP
          const levelResult = await levelsService.getCurrentAndNextLevel(totalXP);
          if (levelResult.data) {
            setCurrentLevel(levelResult.data.currentLevel);
            setNextLevel(levelResult.data.nextLevel);
          }
          
          // Calculate radar chart data from user master stats
          const radarData = {};
          if (userMasterStatsResult.data) {
            // Debug logging removed for production
            userMasterStatsResult.data.forEach(stat => {
              const currentValue = stat.user_master_stats?.[0]?.current_value || 0;
              radarData[stat.display_name] = Math.min(currentValue, 200); // Cap at 200 for radar
            });
          } else {
          }
          setRadarData(radarData);
        }
      } catch (error) {
      }
    };

    loadUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const validateForm = () => {
    if (formData.full_name && formData.full_name.length < 2) {
      toast.error('Full name must be at least 2 characters')
      return false
    }
    
    if (formData.avatar_url && !isValidUrl(formData.avatar_url)) {
      toast.error('Please enter a valid URL for avatar')
      return false
    }
    
    if (formData.bio && formData.bio.length > 500) {
      toast.error('Bio must be less than 500 characters')
      return false
    }
    
    return true
  }

  const isValidUrl = (string) => {
    try {
      const url = new URL(string)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    const { error } = await updateProfile(formData)
    
    if (!error) {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!user?.id || !profile?.id) {
      toast.error('You must be logged in to upload images')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Try avatars bucket first, fallback to public bucket
      let publicUrl = null

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting
        })

      if (uploadErr) {
        // If avatars bucket doesn't exist, try creating it or use a different approach
        toast.error('Storage bucket not configured. Please contact support.')
        throw uploadErr
      } else {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)
        publicUrl = urlData.publicUrl
      }

      if (!publicUrl) {
        throw new Error('Failed to get image URL')
      }

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })

      if (updateError) throw updateError

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
      toast.success('Profile picture uploaded successfully')
    } catch (error) {
      toast.error(error?.message || 'Failed to upload profile picture')
      setAvatarPreview(profile?.avatar_url || null)
    } finally {
      setIsUploadingAvatar(false)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user?.id || !profile?.id) return

    try {
      const { error } = await updateProfile({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      setFormData(prev => ({ ...prev, avatar_url: '' }))
      setAvatarPreview(null)
      toast.success('Profile picture removed')
    } catch (error) {
      toast.error('Failed to remove profile picture')
    }
  }

  const userRole = profile?.role || 'Free'
  const displayName = profile?.full_name || user?.email || 'User'
  
  // Calculate master stats progress - use user master stats data directly
  const masterStatsProgress = userMasterStats.map(stat => {
    const currentValue = stat.user_master_stats?.[0]?.current_value || 0;
    
    return {
      ...stat,
      points: currentValue,
      maxPoints: 200 // Set a reasonable max for progress bars
    };
  });

  const masterStatsChartData = masterStatsProgress.map(stat => ({
    label: stat.display_name,
    value: stat.points,
    color: stat.color
  }));

  // Group skills by master stats for tabbed interface
  const skillsByMasterStat = masterStats.reduce((acc, masterStat) => {
    acc[masterStat.id] = {
      masterStat,
      skills: userSkills.filter(skill => skill.skills?.master_stat_id === masterStat.id)
    };
    return acc;
  }, {});

  // Get top skills across all categories for summary tab
  const topSkills = userSkills
    .sort((a, b) => (b.current_value || 0) - (a.current_value || 0))
    .slice(0, 12);

  // Create tab data
  const skillTabs = [
    { id: 'summary', label: 'Summary', count: topSkills.length },
    ...masterStats.map(stat => ({
      id: stat.id,
      label: stat.display_name,
      count: skillsByMasterStat[stat.id]?.skills?.length || 0
    }))
  ];

  // Use current_xp from profiles table (the actual XP system)
  const totalXP = profile?.current_xp || 0;
  
  // Calculate level progress
  const levelProgress = currentLevel && nextLevel ? {
    currentXP: totalXP,
    currentLevelXP: currentLevel.xp_threshold,
    nextLevelXP: nextLevel.xp_threshold,
    progressXP: totalXP - currentLevel.xp_threshold,
    neededXP: nextLevel.xp_threshold - totalXP,
    progressPercentage: ((totalXP - currentLevel.xp_threshold) / (nextLevel.xp_threshold - currentLevel.xp_threshold)) * 100
  } : null;

  if (authLoading) {
    return <SkeletonLoader type="page" />
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="profile-header flex justify-between items-center mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-ethereal-cyan via-ethereal-violet to-ethereal-cyan bg-clip-text text-transparent font-heading tracking-tight uppercase">
            {displayName}
          </h1>
          <p className="text-ethereal-text/70 text-xs sm:text-sm mt-1 font-semibold font-heading tracking-widest uppercase">Character Profile</p>
        </div>
      </div>

      {/* Main Content - Reorganized Layout */}
      <div className="space-y-8">
        
        {/* Top Row - Character Info & Key Stats */}
        <div className="profile-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Character Card - Left */}
          <div id="profile-stats-card" className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-4 sm:p-6 border border-ethereal-border shadow-ethereal-base sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-ethereal-cyan shadow-2xl"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-ethereal-cyan via-ethereal-violet to-ethereal-cyan flex items-center justify-center border-4 border-ethereal-cyan shadow-2xl">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                  <div className="bg-gradient-to-r from-ethereal-cyan to-ethereal-violet text-white px-2 sm:px-3 py-1 rounded-xl font-bold text-xs sm:text-sm inline-block font-heading tracking-wider">
                    LEVEL: {currentLevel?.level_number || 0}
                  </div>
                  {currentLevel && (
                    <span className="text-ethereal-cyan text-xs sm:text-sm font-semibold mt-1 sm:mt-0 font-heading tracking-wide">{currentLevel.title}</span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-ethereal-text truncate font-heading tracking-tight">{displayName}</h2>
                <p className="text-ethereal-text/60 text-xs sm:text-sm truncate font-medium">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* XP & Progress - Center */}
          <div className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-4 sm:p-6 border border-ethereal-border shadow-ethereal-base">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-ethereal-text font-heading">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-warning" />
              Experience
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-warning via-orange-400 to-error bg-clip-text text-transparent font-heading">
                {totalXP.toFixed(1)} XP
              </div>
              {levelProgress && (
                <>
                  <div className="text-sm text-ethereal-text/60 mt-2 font-medium">
                    To reach {nextLevel?.title}: {levelProgress.neededXP.toFixed(0)} XP needed
                  </div>
                  <div className="w-full bg-ethereal-glass rounded-full h-3 mt-4 shadow-inner border border-ethereal-border/20">
                    <div 
                      className="bg-gradient-to-r from-warning via-orange-400 to-error h-3 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(var(--warning),0.3)]"
                      style={{width: `${Math.min(levelProgress.progressPercentage, 100)}%`}}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daily Streak - Right */}
          <div className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-4 sm:p-6 border border-ethereal-border shadow-ethereal-base">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-ethereal-text font-heading">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-error" />
              Daily Streak
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-error to-warning bg-clip-text text-transparent font-heading">
                {profile?.completion_streak || 0}
              </div>
              <div className="text-xs sm:text-sm text-ethereal-text/60 mt-1 font-medium">days in a row</div>
              <div className="flex justify-center mt-3 sm:mt-4 space-x-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 shadow-lg transition-all duration-200 ${
                      i < (profile?.completion_streak || 0) 
                        ? 'bg-gradient-to-r from-error to-warning border-warning/50 shadow-error/30' 
                        : 'bg-ethereal-glass border-ethereal-border/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row - Core Stats & Master Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Radar Chart - Left */}
          <Card id="profile-core-stats" className="bg-ethereal-glass backdrop-blur-ethereal border-ethereal-border shadow-ethereal-base rounded-ethereal">
            <CardHeader className="items-center pb-4">
              <CardTitle className="text-ethereal-text flex items-center">
                Core Stats
                {profile?.current_xp > 0 && (
                  <Badge
                    variant="outline"
                    className="text-ethereal-cyan bg-ethereal-cyan/10 border-none ml-2"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>Active</span>
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-ethereal-text/60">
                Your character's growth across core dimensions
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[350px]"
              >
                <RadarChart data={formattedRadarData}>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <PolarAngleAxis dataKey="stat" tick={{ fill: 'var(--ethereal-text)', fontSize: 10, opacity: 0.6 }} />
                  <PolarGrid strokeDasharray="3 3" stroke="var(--ethereal-border)" />
                  <Radar
                    name="Stat"
                    dataKey="value"
                    stroke="var(--ethereal-cyan)"
                    fill="var(--ethereal-cyan)"
                    fillOpacity={0.2}
                    filter="url(#stroke-line-glow)"
                  />
                  <defs>
                    <filter
                      id="stroke-line-glow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                </RadarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Master Stats Progress - Right */}
          <MiniChart 
            data={masterStatsChartData} 
            title="Master Stats" 
            unit="XP"
          />
        </div>

        {/* Bottom Row - Skills & Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Skill Tree - Left (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-4 sm:p-6 border border-ethereal-border shadow-ethereal-base">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base sm:text-lg font-semibold flex items-center text-ethereal-text font-heading uppercase tracking-wider">
                  <Brain className="w-5 h-5 mr-2 text-ethereal-violet" />
                  Evolution Paths
                </h3>
                <div className="text-[10px] font-heading font-bold text-ethereal-text/40 tracking-widest uppercase">
                  {userSkills.length} Nodes Synchronized
                </div>
              </div>
              
              <SkillTree 
                skillsByMasterStat={skillsByMasterStat} 
                activeStatId={activeSkillTab} 
                onStatChange={setActiveSkillTab}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Edit Profile */}
      <div className="mt-8 bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-8 border border-ethereal-border shadow-ethereal-base">
        <h3 className="text-xl font-semibold mb-6 flex items-center text-ethereal-text font-heading uppercase tracking-wider">
          <User className="w-6 h-6 mr-3 text-ethereal-cyan" />
          Edit Character
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-semibold text-ethereal-text/60 mb-2 font-heading uppercase tracking-widest">
              Character Name
            </label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full bg-ethereal-glass border border-ethereal-border rounded-xl px-4 py-3 text-ethereal-text focus:ring-2 focus:ring-ethereal-cyan focus:border-transparent transition-all duration-200 font-medium placeholder:text-ethereal-text/30"
              placeholder="Enter your character name"
            />
          </div>

          <div>
            <label htmlFor="avatar_upload" className="block text-sm font-semibold text-ethereal-text/60 mb-2 font-heading uppercase tracking-widest">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative group">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-ethereal-border shadow-ethereal-base transition-transform group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-error hover:bg-error/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-ethereal-glass border-2 border-ethereal-border flex items-center justify-center shadow-inner">
                    <User size={32} className="text-ethereal-text/20" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={avatarInputRef}
                  type="file"
                  id="avatar_upload"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <label
                  htmlFor="avatar_upload"
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 cursor-pointer font-heading uppercase tracking-wider ${
                    isUploadingAvatar
                      ? 'bg-ethereal-glass text-ethereal-text/40 cursor-not-allowed border border-ethereal-border'
                      : 'bg-gradient-to-r from-ethereal-cyan/80 to-ethereal-cyan hover:from-ethereal-cyan hover:to-ethereal-cyan/80 text-white shadow-ethereal-base hover:shadow-ethereal-hover'
                  }`}
                >
                  {isUploadingAvatar ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      <span>Upload Picture</span>
                    </>
                  )}
                </label>
                <p className="text-[10px] text-ethereal-text/40 mt-1 font-medium italic">Max 5MB, JPG/PNG/GIF/WEBP</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-semibold text-ethereal-text/60 mb-2 font-heading uppercase tracking-widest">
              Character Description
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full bg-ethereal-glass border border-ethereal-border rounded-xl px-4 py-3 text-ethereal-text focus:ring-2 focus:ring-ethereal-cyan focus:border-transparent transition-all duration-200 font-medium placeholder:text-ethereal-text/30"
              placeholder="Tell us about your character..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-ethereal-cyan to-ethereal-violet hover:from-ethereal-cyan/80 hover:to-ethereal-violet/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 shadow-ethereal-base hover:shadow-ethereal-hover font-heading uppercase tracking-widest"
            >
              {loading ? 'Saving...' : 'Save Character'}
            </button>
          </div>
        </form>

        {/* Roadmap Settings Section */}
        <div className="bg-ethereal-glass backdrop-blur-ethereal rounded-ethereal p-6 border border-ethereal-border shadow-ethereal-base">
          <h3 className="text-lg font-semibold text-ethereal-text mb-4 flex items-center font-heading">
            <Settings className="w-5 h-5 mr-2 text-ethereal-cyan" />
            Roadmap Settings
          </h3>
          <p className="text-sm text-ethereal-text/60 mb-4 font-medium">
            Customize your learning journey by reordering your institute priorities. This determines the order of lessons in your roadmap.
          </p>
          <button
            type="button"
            onClick={() => setShowInstituteSorter(true)}
            className="px-6 py-3 bg-gradient-to-r from-ethereal-cyan to-ethereal-violet text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-ethereal-cyan/30 transition-all duration-200 flex items-center gap-2"
          >
            <Settings size={18} />
            Reorder Institutes
          </button>
        </div>
      </div>

      {/* Institute Sorter Modal */}
      {showInstituteSorter && (
        <InstituteSorterModal
          onClose={() => setShowInstituteSorter(false)}
          onSave={(newPriority) => {
            setShowInstituteSorter(false);
            toast.success('Institute priority updated! Your roadmap will refresh.');
            // The modal already saves to database, just refresh the page to show updated roadmap
            // Could be optimized to update state instead of full reload
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }}
        />
      )}
    </div>
  )
}

export default ProfilePage