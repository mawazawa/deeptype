/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: Profile Page                                                                        ║
 * ║ Description: User profile page displaying stats, achievements, and typing progress             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSupabase } from '@/hooks/useSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  level: number;
  total_lessons_completed: number;
  total_practice_time: number;
  average_wpm: number;
  average_accuracy: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SupabaseUserAchievement {
  achievements: Achievement;
  unlocked_at: string;
}

interface AchievementWithUnlockDate extends Achievement {
  unlocked_at: string;
}

const Profile: React.FC = () => {
  const { supabase } = useSupabase();

  // Fetch user profile data
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  // Fetch user achievements
  const { data: achievements, isLoading: isAchievementsLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievements (
            id,
            name,
            description,
            icon
          ),
          unlocked_at
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Type assertion for the raw response data
      const userAchievements = data as unknown as SupabaseUserAchievement[];

      // Map to our desired format
      return userAchievements.map(({ achievements, unlocked_at }) => ({
        ...achievements,
        unlocked_at,
      }));
    },
  });

  if (isProfileLoading || isAchievementsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>
            {profile.username?.slice(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{profile.full_name || profile.username}</h1>
          <p className="text-muted-foreground">Level {profile.level} Typist</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average WPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.average_wpm}</div>
            <Progress value={profile.average_wpm} max={100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.average_accuracy}%</div>
            <Progress value={profile.average_accuracy} max={100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.total_lessons_completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(profile.total_practice_time / 60)}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {achievements?.map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center p-4 bg-muted rounded-lg"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-background rounded-full mb-2">
                  {achievement.icon}
                </div>
                <h3 className="font-medium text-center mb-1">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {achievement.description}
                </p>
                <Badge variant="secondary" className="mt-2">
                  {new Date(achievement.unlocked_at).toLocaleDateString()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;