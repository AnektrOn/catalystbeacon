import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Star, Flame, Target, BookOpen, Heart, Brain, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import RadarChart from '../components/profile/RadarChart'
import ProgressBar from '../components/profile/ProgressBar'
import skillsService from '../services/skillsService'
import levelsService from '../services/levelsService'

const ProfilePage = () => {
  const { user, profile, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [skills, setSkills] = useState([]) // eslint-disable-line no-unused-vars
  const [masterStats, setMasterStats] = useState([])
  const [userSkills, setUserSkills] = useState([])
  const [userMasterStats, setUserMasterStats] = useState([])
  const [radarData, setRadarData] = useState({})
  const [currentLevel, setCurrentLevel] = useState(null)
  const [nextLevel, setNextLevel] = useState(null)
  const [activeSkillTab, setActiveSkillTab] = useState('summary')
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    background_image: profile?.background_image || ''
  })

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
        if (masterStatsResult.data) setMasterStats(masterStatsResult.data);

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
          console.log('- User skills data:', userSkillsResult.data);
          console.log('- User master stats data:', userMasterStatsResult.data);
          console.log('- Total XP from profile.current_xp:', totalXP);
          console.log('- Profile object:', profile);
          
          // Get current and next level based on total XP
          const levelResult = await levelsService.getCurrentAndNextLevel(totalXP);
          if (levelResult.data) {
            console.log('- Current level:', levelResult.data.currentLevel);
            console.log('- Next level:', levelResult.data.nextLevel);
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
              console.log(`- ${stat.display_name}: ${currentValue}`);
            });
            console.log('🎯 Final Radar Data:', radarData);
          } else {
            console.log('❌ No user master stats data available for radar chart');
          }
          setRadarData(radarData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
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
    
    if (formData.background_image && !isValidUrl(formData.background_image)) {
      toast.error('Please enter a valid URL for background image')
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

  return (
    <div className="w-full">
      {/* Header */}
      <div className="profile-header flex justify-between items-center mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {displayName}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">Character Profile</p>
        </div>
        <div className="profile-header-actions flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button className="hidden md:block px-3 py-2 sm:px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/25">
            Character Lore
          </button>
          <button className="hidden md:block px-3 py-2 sm:px-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-cyan-500/25">
            Achievement Book
          </button>
          <button className="hidden md:block px-3 py-2 sm:px-4 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-violet-500/25">
            Save Point
          </button>
        </div>
      </div>

      {/* Main Content - Reorganized Layout */}
      <div className="space-y-8">
        
        {/* Top Row - Character Info & Key Stats */}
        <div className="profile-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Character Card - Left */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50 shadow-xl sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={displayName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-gradient-to-r from-emerald-400 to-cyan-400 shadow-2xl"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-400 flex items-center justify-center border-4 border-gradient-to-r from-emerald-400 to-cyan-400 shadow-2xl">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-2 sm:px-3 py-1 rounded-xl font-bold text-xs sm:text-sm inline-block">
                    LEVEL: {currentLevel?.level_number || 0}
                  </div>
                  {currentLevel && (
                    <span className="text-emerald-400 text-xs sm:text-sm font-medium mt-1 sm:mt-0">{currentLevel.title}</span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">{displayName}</h2>
                <p className="text-slate-400 text-xs sm:text-sm truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* XP & Progress - Center */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50 shadow-xl">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-white">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-yellow-400" />
              Experience
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {totalXP.toFixed(1)} XP
              </div>
              {levelProgress && (
                <>
                  <div className="text-sm text-slate-400 mt-2">
                    To reach {nextLevel?.title}: {levelProgress.neededXP.toFixed(0)} XP needed
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 mt-4 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{width: `${Math.min(levelProgress.progressPercentage, 100)}%`}}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daily Streak - Right */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50 shadow-xl">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-white">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-400" />
              Daily Streak
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {profile?.completion_streak || 0}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">days in a row</div>
              <div className="flex justify-center mt-3 sm:mt-4 space-x-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 shadow-lg transition-all duration-200 ${
                      i < (profile?.completion_streak || 0) 
                        ? 'bg-gradient-to-r from-orange-400 to-red-400 border-orange-300 shadow-orange-400/50' 
                        : 'bg-slate-700 border-slate-600'
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
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-600/50 shadow-xl">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center text-white">Core Stats</h3>
            <div className="profile-radar-chart flex justify-center">
              <RadarChart data={radarData} size={Math.min(350, window.innerWidth - 100)} />
            </div>
          </div>

          {/* Master Stats Progress - Right */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50 shadow-xl">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-white">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-violet-400" />
              Master Stats
            </h3>
            <div className="space-y-4">
              {masterStatsProgress.map((stat) => (
                <ProgressBar
                  key={stat.id}
                  label={stat.display_name}
                  value={stat.points}
                  maxValue={stat.maxPoints}
                  color={stat.color}
                  showValue={true}
                />
              ))}
              <div className="pt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-300">Total</span>
                  <span className="text-emerald-400 font-bold">{masterStatsProgress.reduce((sum, stat) => sum + stat.points, 0).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Skills & Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Skills Tabs - Left (2/3 width) */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-600/50 shadow-xl">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center text-white">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-violet-400" />
              Skills ({userSkills.length})
            </h3>
            
            {/* Tab Navigation */}
            <div className="profile-skills-tabs flex flex-wrap gap-1 sm:gap-2 mb-4 sm:mb-6">
              {skillTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSkillTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeSkillTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white shadow-lg'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
                </div>
                
            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeSkillTab === 'summary' ? (
                  <div>
                  <h4 className="text-md font-semibold text-slate-300 mb-4">Top Skills</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {topSkills.map((skill, index) => (
                      <div key={skill.id} className="flex justify-between items-center text-sm bg-slate-700/30 rounded-lg p-3 hover:bg-slate-600/30 transition-colors">
                        <div className="flex items-center">
                          <span className="text-slate-400 text-xs mr-2">#{index + 1}</span>
                          <span className="text-slate-300 truncate">{skill.skills?.display_name || skill.skills?.name}</span>
                        </div>
                        <span className="text-emerald-400 font-medium bg-slate-800/50 px-2 py-1 rounded">
                          {skill.current_value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                  <div>
                  <h4 className="text-md font-semibold text-slate-300 mb-4">
                    {skillsByMasterStat[activeSkillTab]?.masterStat?.display_name} Skills
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {skillsByMasterStat[activeSkillTab]?.skills?.map((skill) => (
                      <div key={skill.id} className="flex justify-between items-center text-sm bg-slate-700/30 rounded-lg p-3 hover:bg-slate-600/30 transition-colors">
                        <span className="text-slate-300 truncate">{skill.skills?.display_name || skill.skills?.name}</span>
                        <span 
                          className="font-medium bg-slate-800/50 px-2 py-1 rounded"
                          style={{ color: skillsByMasterStat[activeSkillTab]?.masterStat?.color || '#10b981' }}
                        >
                          {skill.current_value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bio & Quest - Right (1/3 width) */}
          <div className="space-y-6">
            {/* Character Bio */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                <BookOpen className="w-5 h-5 mr-2 text-cyan-400" />
                Character Bio
              </h3>
              <div className="text-sm text-slate-300 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Role:</span>
                  <span className="text-emerald-400 font-medium">{userRole}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Level:</span>
                  <span className="text-cyan-400 font-medium">{currentLevel?.level_number || 0} - {currentLevel?.title || 'Uninitiated'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total XP:</span>
                  <span className="text-yellow-400 font-medium">{totalXP.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Streak:</span>
                  <span className="text-orange-400 font-medium">{profile?.completion_streak || 0} days</span>
                </div>
                {formData.bio && (
                  <div className="pt-2 border-t border-slate-600">
                    <p className="text-slate-300"><strong>Description:</strong> {formData.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Quest */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/50 shadow-xl">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
                <Target className="w-5 h-5 mr-2 text-yellow-400" />
                Current Quest
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full mr-3 shadow-lg"></div>
                  <span className="text-slate-300">Complete daily habits</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mr-3 shadow-lg"></div>
                  <span className="text-slate-300">Use toolbox items</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full mr-3 shadow-lg"></div>
                  <span className="text-slate-300">Level up skills</span>
                </div>
              </div>
                  </div>
                </div>
              </div>
            </div>

      {/* Bottom Section - Edit Profile */}
      <div className="mt-8 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/50 shadow-xl">
        <h3 className="text-xl font-semibold mb-6 flex items-center text-white">
          <User className="w-6 h-6 mr-3 text-cyan-400" />
          Edit Character
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-300 mb-2">
              Character Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      id="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              placeholder="Enter your character name"
                    />
                  </div>

                  <div>
            <label htmlFor="avatar_url" className="block text-sm font-medium text-slate-300 mb-2">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar_url"
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">
              Character Description
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={3}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
              placeholder="Tell us about your character..."
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="background_image" className="block text-sm font-medium text-slate-300 mb-2">
                      Background Image URL
                    </label>
                    <input
                      type="url"
                      name="background_image"
                      id="background_image"
                      value={formData.background_image}
                      onChange={handleInputChange}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-200"
                      placeholder="https://example.com/background.jpg"
                    />
                    {formData.background_image && (
              <div className="mt-4">
                        <div 
                  className="w-full h-32 rounded-xl bg-cover bg-center bg-no-repeat border border-slate-600 shadow-lg"
                          style={{ backgroundImage: `url(${formData.background_image})` }}
                        />
                      </div>
                    )}
                  </div>

          <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
                    >
              {loading ? 'Saving...' : 'Save Character'}
                    </button>
                  </div>
                </form>
              </div>
    </div>
  )
}

export default ProfilePage