/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: Leaderboard Page                                                                    ║
 * ║ Description: Global leaderboard with filters and time periods                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLeaderboard, type TimePeriod, type SortBy, formatRank } from '@/hooks/useLeaderboard';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [sortBy, setSortBy] = useState<SortBy>('wpm');
  const { toast } = useToast();

  const {
    currentUserRank,
    refetch,
  } = useLeaderboard({
    limit: 50,
    timePeriod,
    sortBy,
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: 'Refreshed',
        description: 'Leaderboard data has been updated.',
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>
                {currentUserRank ? (
                  <>You are ranked {formatRank(currentUserRank)} globally</>
                ) : (
                  'See how you stack up against other typists'
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={timePeriod}
                onValueChange={(value) => setTimePeriod(value as TimePeriod)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortBy)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wpm">WPM</SelectItem>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="lessons">Lessons</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="global" className="space-y-4">
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="local">Your Region</TabsTrigger>
            </TabsList>
            <TabsContent value="global" className="space-y-4">
              <LeaderboardTable
                limit={50}
                timePeriod={timePeriod}
                sortBy={sortBy}
                className="animate-in fade-in-50 slide-in-from-bottom-5"
              />
            </TabsContent>
            <TabsContent value="friends" className="space-y-4">
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-sm">
                  Challenge your friends and track your progress together
                </p>
              </div>
            </TabsContent>
            <TabsContent value="local" className="space-y-4">
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <p className="text-lg font-medium mb-2">Coming Soon</p>
                <p className="text-sm">
                  Compete with typists in your region
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;