/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: Achievement Hook                                                                       ║
 * ║ Description: React hook for managing achievements and progress                                 ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from './useSupabase';
import { useToast } from '@/components/ui/use-toast';
import { createAchievementManager, type AchievementProgress } from '@/lib/achievements';

interface UseAchievementsReturn {
  achievements: AchievementProgress[];
  isLoading: boolean;
  error: Error | null;
  checkAchievements: (stats: {
    wpm: number;
    accuracy: number;
    lessons: number;
    streak: number;
    practiceTime: number;
    isPerfectScore: boolean;
  }) => Promise<void>;
}

export function useAchievements(): UseAchievementsReturn {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      return user;
    },
  });

  // Create achievement manager instance
  const achievementManager = useMemo(() => {
    if (!user) return null;
    return createAchievementManager(supabase, user.id, toast);
  }, [user, supabase, toast]);

  // Fetch achievements progress
  const { data: achievements, isLoading, error } = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: async () => {
      if (!achievementManager) throw new Error('Achievement manager not initialized');
      return achievementManager.getProgress();
    },
    enabled: !!achievementManager,
  });

  // Function to check achievements
  const checkAchievements = async (stats: {
    wpm: number;
    accuracy: number;
    lessons: number;
    streak: number;
    practiceTime: number;
    isPerfectScore: boolean;
  }) => {
    if (!achievementManager) {
      console.error('Achievement manager not initialized');
      return;
    }

    await achievementManager.checkAndUnlockAchievements(stats);
    // Invalidate achievements query to refresh the data
    queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] });
  };

  // Log achievement system initialization
  useEffect(() => {
    if (achievementManager) {
      console.info('Achievement system initialized for user:', user?.id);
    }
  }, [achievementManager, user?.id]);

  return {
    achievements: achievements || [],
    isLoading,
    error: error as Error | null,
    checkAchievements,
  };
}