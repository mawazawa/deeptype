/*
 * ██████╗ ███████╗██╗    ██╗ █████╗ ██████╗ ██████╗ ███████╗
 * ██╔══██╗██╔════╝██║    ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝
 * ██████╔╝█████╗  ██║ █╗ ██║███████║██████╔╝██║  ██║███████╗
 * ██╔══██╗██╔══╝  ██║███╗██║██╔══██║██╔══██╗██║  ██║╚════██║
 * ██║  ██║███████╗╚███╔███╔╝██║  ██║██║  ██║██████╔╝███████║
 * ╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: RewardsPanel                                                                        ║
 * ║ Description: Displays user rewards, points, badges, and recent achievements                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Trophy, Award, Crown, Target, Medal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge, Reward } from "@/hooks/use-rewards";

interface RewardsPanelProps {
  points: number;
  level: number;
  progress: number;
  badges: Badge[];
  recentRewards: Reward[];
  className?: string;
}

const rarityColors = {
  common: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  rare: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  epic: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  legendary: "bg-red-500/10 text-red-500 border-red-500/20",
};

const badgeIcons = {
  Star,
  Trophy,
  Award,
  Crown,
  Target,
  Medal,
};

export function RewardsPanel({
  points,
  level,
  progress,
  badges,
  recentRewards,
  className,
}: RewardsPanelProps) {
  return (
    <div className={cn("space-y-6 p-6 bg-card rounded-lg border", className)}>
      {/* Points and Level */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Level {level}</h3>
          <span className="text-xl font-semibold text-primary">
            {points} points
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>
      </div>

      {/* Recent Rewards */}
      <div className="space-y-3">
        <h4 className="font-semibold">Recent Rewards</h4>
        <div className="space-y-2">
          <AnimatePresence>
            {recentRewards.map((reward, index) => (
              <motion.div
                key={`${reward.type}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-accent rounded-lg"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    reward.type === "badge"
                      ? rarityColors[reward.badge!.rarity]
                      : "bg-primary/10"
                  )}
                >
                  {reward.type === "badge" ? (
                    React.createElement(
                      badgeIcons[reward.badge!.icon as keyof typeof badgeIcons],
                      {
                        className: "w-5 h-5",
                      }
                    )
                  ) : (
                    <Trophy className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{reward.message}</p>
                  {reward.points && (
                    <p className="text-sm text-muted-foreground">
                      +{reward.points} points
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <h4 className="font-semibold">Badges</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "p-4 rounded-lg border flex flex-col items-center text-center gap-2",
                  rarityColors[badge.rarity]
                )}
              >
                {React.createElement(
                  badgeIcons[badge.icon as keyof typeof badgeIcons],
                  {
                    className: "w-8 h-8",
                  }
                )}
                <div>
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs opacity-80">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
