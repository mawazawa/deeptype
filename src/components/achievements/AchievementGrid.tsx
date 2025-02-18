/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: Achievement Grid                                                                    ║
 * ║ Description: Grid display of achievements with progress and unlock status                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { ACHIEVEMENTS, ACHIEVEMENT_ICONS, type AchievementProgress } from '@/lib/achievements';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AchievementGridProps {
  progress: AchievementProgress[];
  className?: string;
}

const rarityColors = {
  common: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-400',
    badge: 'bg-slate-500',
  },
  rare: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    badge: 'bg-blue-500',
  },
  epic: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    badge: 'bg-purple-500',
  },
  legendary: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500',
  },
};

const AchievementGrid: React.FC<AchievementGridProps> = ({ progress, className }) => {
  // Create a map of achievement progress for easy lookup
  const progressMap = new Map(progress.map(p => [p.achievementId, p]));

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {ACHIEVEMENTS.map(achievement => {
        const achievementProgress = progressMap.get(achievement.id);
        const isUnlocked = achievementProgress?.isUnlocked || false;
        const progressValue = achievementProgress?.progress || 0;
        const IconComponent = ACHIEVEMENT_ICONS[achievement.icon];
        const colors = rarityColors[achievement.rarity];

        return (
          <TooltipProvider key={achievement.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "relative p-4 rounded-lg border-2 transition-all duration-300",
                    colors.border,
                    colors.bg,
                    isUnlocked ? "opacity-100" : "opacity-60 hover:opacity-80",
                    "group cursor-help"
                  )}
                >
                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-background/50 to-background",
                      "transition-transform duration-300 group-hover:scale-110"
                    )}>
                      <IconComponent className={cn(
                        "w-6 h-6 transition-all duration-300",
                        colors.text,
                        isUnlocked ? "opacity-100" : "opacity-50 group-hover:opacity-75"
                      )} />
                    </div>
                  </div>

                  {/* Title and Rarity */}
                  <div className="text-center mb-2">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {achievement.name}
                    </h3>
                    <Badge variant="secondary" className={cn(
                      "text-[10px] px-1.5 py-0.5",
                      colors.badge
                    )}>
                      {achievement.rarity.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <Progress
                    value={progressValue}
                    className="h-1 mt-2"
                  />

                  {/* Unlock Status */}
                  {isUnlocked && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-green-500">
                        ✓
                      </Badge>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium mb-1">{achievement.name}</p>
                  <p className="text-muted-foreground">{achievement.description}</p>
                  {achievementProgress?.unlockedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Unlocked on {new Date(achievementProgress.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                  {!isUnlocked && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Progress: {progressValue}%
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default AchievementGrid;