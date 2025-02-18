/*
 *  █████╗  ██████╗██╗  ██╗██╗███████╗██╗   ██╗███████╗███╗   ███╗███████╗███╗   ██╗████████╗
 * ██╔══██╗██╔════╝██║  ██║██║██╔════╝██║   ██║██╔════╝████╗ ████║██╔════╝████╗  ██║╚══██╔══╝
 * ███████║██║     ███████║██║█████╗  ██║   ██║█████╗  ██╔████╔██║█████╗  ██╔██╗ ██║   ██║
 * ██╔══██║██║     ██╔══██║██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║╚██╔╝██║██╔══╝  ██║╚██╗██║   ██║
 * ██║  ██║╚██████╗██║  ██║██║███████╗ ╚████╔╝ ███████╗██║ ╚═╝ ██║███████╗██║ ╚████║   ██║
 * ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝╚══════╝  ╚═══╝  ╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: Achievement Overlay                                                                  ║
 * ║ Description: Animated overlay for displaying achievements and rewards                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Award, Crown, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTypingSounds } from "@/hooks/use-typing-sounds";

export interface Achievement {
  id: string;
  type:
    | "levelUp"
    | "perfect"
    | "milestone"
    | "streak"
    | "speedRecord"
    | "accuracyRecord";
  title: string;
  description: string;
  icon: keyof typeof achievementIcons;
  color: string;
}

const achievementIcons = {
  Trophy,
  Star,
  Zap,
  Award,
  Crown,
  Target,
};

interface AchievementOverlayProps {
  achievement?: Achievement;
  onComplete?: () => void;
  className?: string;
}

export function AchievementOverlay({
  achievement,
  onComplete,
  className,
}: AchievementOverlayProps) {
  const { handleAchievement } = useTypingSounds();

  // Play sound effect when achievement is shown
  React.useEffect(() => {
    if (achievement) {
      handleAchievement(
        achievement.type === "levelUp" ? "levelUp" : "milestone"
      );
      if (onComplete) {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [achievement, handleAchievement, onComplete]);

  const Icon = achievement ? achievementIcons[achievement.icon] : Trophy;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          className={cn(
            "fixed inset-0 flex items-center justify-center pointer-events-none z-50",
            className
          )}
        >
          <div className="relative">
            {/* Background glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.2, scale: 2 }}
              exit={{ opacity: 0, scale: 3 }}
              className={cn(
                "absolute inset-0 rounded-full blur-3xl",
                achievement.color
              )}
            />

            {/* Achievement card */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className={cn(
                "bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-6",
                "flex items-center gap-4 relative z-10"
              )}
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  achievement.color
                )}
              >
                <Icon className="w-8 h-8 text-primary-foreground" />
              </div>

              <div className="flex-1">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold"
                >
                  {achievement.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-muted-foreground"
                >
                  {achievement.description}
                </motion.p>
              </div>

              {/* Particles */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 1,
                      scale: 0,
                      x: 0,
                      y: 0,
                    }}
                    animate={{
                      opacity: 0,
                      scale: 1,
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                    }}
                    transition={{
                      duration: 1,
                      delay: Math.random() * 0.5,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "absolute top-1/2 left-1/2 w-1 h-1 rounded-full",
                      achievement.color
                    )}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
