import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import levelsService from '../services/levelsService';
import { logWarn } from '../utils/logger';

/**
 * Single source for nav/shell data: notifications, XP, last achievement, level title.
 * Use in AppShell and pass to DesktopNav/MobileNav to avoid double-fetch on resize.
 */
export function useNavigationData() {
  const { user, profile } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [lastAchievement, setLastAchievement] = useState(null);
  const [levelTitle, setLevelTitle] = useState(null);

  useEffect(() => {
    if (!user) {
      setNotificationCount(0);
      setTotalXP(0);
      setLastAchievement(null);
      setLevelTitle(null);
      return;
    }

    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        if (error && error.code !== 'PGRST116') {
          logWarn('Notifications table not available:', error.message);
          setNotificationCount(0);
        } else {
          setNotificationCount(data?.length ?? 0);
        }
      } catch (err) {
        logWarn('Error loading notifications:', err);
        setNotificationCount(0);
      }
    };

    loadNotifications();
    const channel = supabase
      .channel('nav-notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, loadNotifications)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  useEffect(() => {
    if (!user || !profile) {
      setTotalXP(0);
      setLastAchievement(null);
      setLevelTitle(null);
      return;
    }

    const loadXPAndAchievement = async () => {
      try {
        if (profile?.current_xp !== undefined) setTotalXP(profile.current_xp);

        const achievements = [];
        const { data: recentBadge, error: badgeError } = await supabase
          .from('user_badges')
          .select('awarded_at, badges (title, badge_image_url)')
          .eq('user_id', user.id)
          .order('awarded_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!badgeError && recentBadge)
          achievements.push({
            type: 'badge',
            title: recentBadge.badges?.title || 'Achievement Unlocked',
            iconUrl: recentBadge.badges?.badge_image_url,
            timestamp: recentBadge.awarded_at,
          });

        const { data: recentLesson, error: lessonError } = await supabase
          .from('user_lesson_progress')
          .select('completed_at, course_id, chapter_number, lesson_number')
          .eq('user_id', user.id)
          .eq('is_completed', true)
          .not('completed_at', 'is', null)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!lessonError && recentLesson?.completed_at) {
          let courseTitle = 'Course';
          if (recentLesson.course_id) {
            const { data: courseData } = await supabase
              .from('course_metadata')
              .select('course_title')
              .eq('course_id', recentLesson.course_id)
              .maybeSingle();
            if (courseData) courseTitle = courseData.course_title;
          }
          achievements.push({
            type: 'lesson',
            title: 'Lesson Completed',
            subtitle: `${courseTitle} • Ch ${recentLesson.chapter_number} L ${recentLesson.lesson_number}`,
            timestamp: recentLesson.completed_at,
          });
        }

        if (achievements.length > 0) {
          achievements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setLastAchievement(achievements[0]);
        } else setLastAchievement(null);
      } catch (err) {
        setLastAchievement(null);
      }
    };

    const loadLevelTitle = async () => {
      try {
        if (profile?.rank) {
          setLevelTitle(profile.rank);
          return;
        }
        const currentXP = profile?.current_xp ?? 0;
        const { data: levelInfo, error } = await levelsService.getCurrentAndNextLevel(currentXP);
        if (!error && levelInfo?.currentLevel) setLevelTitle(levelInfo.currentLevel.title);
        else if (profile?.level) {
          const { data: levelData } = await levelsService.getLevelByNumber(profile.level);
          if (levelData?.title) setLevelTitle(levelData.title);
        } else setLevelTitle(null);
      } catch (err) {
        setLevelTitle(null);
      }
    };

    loadXPAndAchievement();
    loadLevelTitle();
  }, [user?.id, profile?.current_xp, profile?.rank, profile?.level]);

  return {
    notificationCount,
    totalXP,
    lastAchievement,
    levelTitle,
  };
}
