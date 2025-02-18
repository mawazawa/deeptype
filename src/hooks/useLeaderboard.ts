/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: Leaderboard Hook                                                                       ║
 * ║ Description: React hook for managing leaderboard data with filtering and sorting               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from './useSupabase';
import { useToast } from '@/components/ui/use-toast';

export type TimePeriod = 'all' | 'today' | 'week' | 'month';
export type SortBy = 'wpm' | 'accuracy' | 'lessons' | 'achievements';

export interface LeaderboardEntry {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  average_wpm: number;
  average_accuracy: number;
  total_lessons_completed: number;
  level: number;
  achievements_count: number;
  rank: number;
}

interface UseLeaderboardOptions {
  limit?: number;
  timePeriod?: TimePeriod;
  sortBy?: SortBy;
  refetchInterval?: number;
  onError?: (error: Error) => void;
}

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: Error | null;
  currentUserRank: number | null;
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
}

export function useLeaderboard({
  limit = 100,
  timePeriod = 'all',
  sortBy = 'wpm',
  refetchInterval = 30000,
  onError,
}: UseLeaderboardOptions = {}): UseLeaderboardReturn {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user for rank highlighting
  const { data: currentUser } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  // Fetch leaderboard data
  const { data: leaderboard = [], isLoading, error } = useQuery({
    queryKey: ['leaderboard', timePeriod, sortBy, limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_leaderboard', {
            p_limit: limit,
            p_time_period: timePeriod,
            p_sort_by: sortBy
          });

        if (error) throw error;
        return data as LeaderboardEntry[];
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch leaderboard';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        onError?.(error as Error);
        throw error;
      }
    },
    refetchInterval,
  });

  // Find current user's rank
  const currentUserRank = currentUser
    ? leaderboard.find(entry => entry.id === currentUser.id)?.rank ?? null
    : null;

  // Function to manually refetch data
  const refetch = async () => {
    try {
      await queryClient.invalidateQueries({
        queryKey: ['leaderboard', timePeriod, sortBy, limit],
      });
    } catch (error) {
      console.error('Error refetching leaderboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refetch leaderboard';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      onError?.(error as Error);
    }
  };

  // Function to invalidate cache
  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['leaderboard'],
    });
  };

  return {
    leaderboard,
    isLoading,
    error: error as Error | null,
    currentUserRank,
    refetch,
    invalidate,
  };
}

// Export a function to format rank display
export function formatRank(rank: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = rank % 100;
  return rank + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

// Export a function to get rank color
export function getRankColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'text-yellow-500';
    case 2:
      return 'text-slate-400';
    case 3:
      return 'text-amber-600';
    default:
      return 'text-muted-foreground';
  }
}

// Export a function to get rank icon
export function getRankIcon(rank: number): string {
  switch (rank) {
    case 1:
      return '🏆';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return `#${rank}`;
  }
}