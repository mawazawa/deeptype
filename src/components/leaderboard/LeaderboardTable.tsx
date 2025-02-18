/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: LeaderboardTable                                                                    ║
 * ║ Description: Displays user rankings and stats with beautiful animations                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@/hooks/useSupabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLeaderboard, type TimePeriod, type SortBy } from '@/hooks/useLeaderboard';
import LoadingState from '@/components/LoadingState';

interface LeaderboardEntry {
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

interface LeaderboardTableProps {
  className?: string;
  limit?: number;
  timePeriod?: TimePeriod;
  sortBy?: SortBy;
}

const rankColors = {
  1: 'text-yellow-500',
  2: 'text-slate-400',
  3: 'text-amber-600',
};

const rankIcons = {
  1: Trophy,
  2: Medal,
  3: Award,
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  className,
  limit = 100,
  timePeriod = 'all',
  sortBy = 'wpm'
}) => {
  const {
    leaderboard,
    isLoading,
    error,
    currentUserRank,
  } = useLeaderboard({
    limit,
    timePeriod,
    sortBy,
    onError: (error) => {
      console.error('Leaderboard error:', error);
    },
  });

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-destructive">Failed to load leaderboard</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[400px]">
        <LoadingState
          message="Loading leaderboard..."
          variant="fancy"
          size="lg"
        />
      </div>
    );
  }

  if (!leaderboard?.length) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">WPM</TableHead>
            <TableHead className="text-right">Accuracy</TableHead>
            <TableHead className="text-right">Lessons</TableHead>
            <TableHead className="text-right">Level</TableHead>
            <TableHead className="text-right">Achievements</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((entry) => {
            const RankIcon = rankIcons[entry.rank as keyof typeof rankIcons];
            const isCurrentUser = entry.rank === currentUserRank;

            return (
              <TableRow
                key={entry.id}
                className={cn(
                  "transition-colors hover:bg-muted/50",
                  isCurrentUser && "bg-primary/5 hover:bg-primary/10",
                  "animate-in fade-in-50 slide-in-from-left-1"
                )}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {RankIcon ? (
                      <RankIcon
                        className={cn(
                          "w-5 h-5",
                          rankColors[entry.rank as keyof typeof rankColors]
                        )}
                      />
                    ) : (
                      <span className="text-muted-foreground">#{entry.rank}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback>
                        {entry.username?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {entry.full_name || entry.username}
                      </span>
                      {entry.full_name && (
                        <span className="text-xs text-muted-foreground">
                          @{entry.username}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">{entry.average_wpm}</span>
                    <Progress
                      value={entry.average_wpm}
                      max={150}
                      className="w-16 h-2"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">{entry.average_accuracy}%</span>
                    <Progress
                      value={entry.average_accuracy}
                      max={100}
                      className="w-16 h-2"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {entry.total_lessons_completed}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">
                    Level {entry.level}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {entry.achievements_count}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;