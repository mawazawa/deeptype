/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: Achievements                                                                           ║
 * ║ Description: Achievement system for tracking and unlocking user accomplishments                ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { LucideIcon, Trophy, Zap, Target, Clock, Star, Award, Crown, Medal } from 'lucide-react';
import { createElement } from 'react';
import AchievementNotification from '@/components/achievements/AchievementNotification';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof ACHIEVEMENT_ICONS;
  criteria: AchievementCriteria;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCriteria {
  type: 'wpm' | 'accuracy' | 'lessons' | 'streak' | 'practice_time' | 'perfect_score';
  threshold: number;
  comparison: 'gte' | 'eq' | 'lte';
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export const ACHIEVEMENT_ICONS = {
  Zap,
  Target,
  Trophy,
  Clock,
  Star,
  Award,
  Crown,
  Medal
} as const;

// Define achievements with their criteria
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach 100 WPM in a typing session',
    icon: 'Zap',
    criteria: {
      type: 'wpm',
      threshold: 100,
      comparison: 'gte'
    },
    rarity: 'epic'
  },
  {
    id: 'perfect_accuracy',
    name: 'Perfectionist',
    description: 'Complete a lesson with 100% accuracy',
    icon: 'Target',
    criteria: {
      type: 'accuracy',
      threshold: 100,
      comparison: 'eq'
    },
    rarity: 'rare'
  },
  {
    id: 'practice_master',
    name: 'Practice Master',
    description: 'Complete 50 typing lessons',
    icon: 'Trophy',
    criteria: {
      type: 'lessons',
      threshold: 50,
      comparison: 'gte'
    },
    rarity: 'common'
  },
  {
    id: 'consistency_king',
    name: 'Consistency King',
    description: 'Maintain a 10-day practice streak',
    icon: 'Crown',
    criteria: {
      type: 'streak',
      threshold: 10,
      comparison: 'gte'
    },
    rarity: 'rare'
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Practice for a total of 24 hours',
    icon: 'Clock',
    criteria: {
      type: 'practice_time',
      threshold: 24,
      comparison: 'gte'
    },
    rarity: 'epic'
  },
  {
    id: 'flawless_victory',
    name: 'Flawless Victory',
    description: 'Complete an advanced lesson with 100% accuracy and 100+ WPM',
    icon: 'Star',
    criteria: {
      type: 'perfect_score',
      threshold: 1,
      comparison: 'gte'
    },
    rarity: 'legendary'
  }
];

export class AchievementManager {
  private supabase: SupabaseClient;
  private userId: string;
  private toast: ReturnType<typeof useToast>['toast'];

  constructor(supabase: SupabaseClient, userId: string, toast: ReturnType<typeof useToast>['toast']) {
    this.supabase = supabase;
    this.userId = userId;
    this.toast = toast;
  }

  private getIconComponent(iconName: keyof typeof ACHIEVEMENT_ICONS): LucideIcon {
    return ACHIEVEMENT_ICONS[iconName];
  }

  private async checkAchievementCriteria(
    criteria: AchievementCriteria,
    stats: {
      wpm: number;
      accuracy: number;
      lessons: number;
      streak: number;
      practiceTime: number;
      isPerfectScore: boolean;
    }
  ): Promise<boolean> {
    const value = criteria.type === 'perfect_score'
      ? stats.isPerfectScore
      : stats[criteria.type === 'practice_time' ? 'practiceTime' : criteria.type];

    if (typeof value === 'boolean') {
      return value;
    }

    switch (criteria.comparison) {
      case 'gte':
        return value >= criteria.threshold;
      case 'eq':
        return value === criteria.threshold;
      case 'lte':
        return value <= criteria.threshold;
      default:
        return false;
    }
  }

  public async checkAndUnlockAchievements(stats: {
    wpm: number;
    accuracy: number;
    lessons: number;
    streak: number;
    practiceTime: number;
    isPerfectScore: boolean;
  }): Promise<void> {
    try {
      // Get already unlocked achievements
      const { data: unlockedAchievements } = await this.supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', this.userId);

      const unlockedIds = new Set(unlockedAchievements?.map(ua => ua.achievement_id) || []);

      // Check each achievement
      for (const achievement of ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue;

        const isUnlocked = await this.checkAchievementCriteria(achievement.criteria, stats);
        if (isUnlocked) {
          // Unlock the achievement
          const { error } = await this.supabase
            .from('user_achievements')
            .insert({
              user_id: this.userId,
              achievement_id: achievement.id,
              unlocked_at: new Date().toISOString()
            });

          if (error) throw error;

          // Show notification
          const IconComponent = this.getIconComponent(achievement.icon);
          this.toast({
            title: '🏆 Achievement Unlocked!',
            description: createElement(AchievementNotification, {
              name: achievement.name,
              description: achievement.description,
              icon: IconComponent,
              rarity: achievement.rarity
            }),
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      this.toast({
        title: 'Error',
        description: 'Failed to check achievements',
        variant: 'destructive',
      });
    }
  }

  public async getProgress(): Promise<AchievementProgress[]> {
    try {
      // Get user stats
      const { data: stats, error: statsError } = await this.supabase
        .from('profiles')
        .select('average_wpm, average_accuracy, total_lessons_completed, total_practice_time')
        .eq('id', this.userId)
        .single();

      if (statsError) throw statsError;

      // Get unlocked achievements
      const { data: unlockedAchievements, error: achievementsError } = await this.supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', this.userId);

      if (achievementsError) throw achievementsError;

      const unlockedMap = new Map(
        unlockedAchievements?.map(ua => [ua.achievement_id, ua.unlocked_at]) || []
      );

      // Calculate progress for each achievement
      return ACHIEVEMENTS.map(achievement => {
        const unlockedAt = unlockedMap.get(achievement.id);
        let progress = 0;

        switch (achievement.criteria.type) {
          case 'wpm':
            progress = (stats.average_wpm / achievement.criteria.threshold) * 100;
            break;
          case 'accuracy':
            progress = (stats.average_accuracy / achievement.criteria.threshold) * 100;
            break;
          case 'lessons':
            progress = (stats.total_lessons_completed / achievement.criteria.threshold) * 100;
            break;
          case 'practice_time':
            progress = ((stats.total_practice_time / 60) / achievement.criteria.threshold) * 100;
            break;
          default:
            progress = unlockedAt ? 100 : 0;
        }

        return {
          achievementId: achievement.id,
          progress: Math.min(Math.round(progress), 100),
          isUnlocked: !!unlockedAt,
          unlockedAt
        };
      });
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      throw error;
    }
  }
}

// Export a function to create the achievement manager
export function createAchievementManager(
  supabase: SupabaseClient,
  userId: string,
  toast: ReturnType<typeof useToast>['toast']
): AchievementManager {
  return new AchievementManager(supabase, userId, toast);
}