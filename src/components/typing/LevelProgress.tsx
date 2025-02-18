/*
 * ██████╗ ██████╗  ██████╗  ██████╗ ██████╗ ███████╗███████╗███████╗
 * ██╔══██╗██╔══██╗██╔═══██╗██╔════╝ ██╔══██╗██╔════╝██╔════╝██╔════╝
 * ██████╔╝██████╔╝██║   ██║██║  ███╗██████╔╝█████╗  ███████╗███████╗
 * ██╔═══╝ ██╔══██╗██║   ██║██║   ██║██╔══██╗██╔══╝  ╚════██║╚════██║
 * ██║     ██║  ██║╚██████╔╝╚██████╔╝██║  ██║███████╗███████║███████║
 * ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: Level Progress                                                                      ║
 * ║ Description: Visual progress tracking for typing levels with animations and sound feedback     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Award } from "lucide-react";
import { useTypingSounds } from "@/hooks/use-typing-sounds";
import { cn } from "@/lib/utils";

interface LevelProgressProps {
  level: number;
  currentExercise: number;
  totalExercises: number;
  accuracy: number;
  wpm: number;
  className?: string;
  onLevelComplete?: () => void;
}

export function LevelProgress({
  level,
  currentExercise,
  totalExercises,
  accuracy,
  wpm,
  className,
  onLevelComplete,
}: LevelProgressProps) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const { handleAchievement } = useTypingSounds();

  // Check for level completion
  useEffect(() => {
    if (currentExercise === totalExercises) {
      setShowLevelUp(true);
      handleAchievement("levelUp");
      onLevelComplete?.();

      // Check for perfect performance
      if (accuracy >= 98 && wpm >= level * 10) {
        setShowPerfect(true);
        handleAchievement("perfect");
      }

      // Reset animations after delay
      const timer = setTimeout(() => {
        setShowLevelUp(false);
        setShowPerfect(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [
    currentExercise,
    totalExercises,
    accuracy,
    wpm,
    level,
    handleAchievement,
    onLevelComplete,
  ]);

  // Calculate progress percentage
  const progress = (currentExercise / totalExercises) * 100;

  // Determine milestone achievements
  const milestones = [
    { at: 25, icon: Zap, achieved: progress >= 25 },
    { at: 50, icon: Star, achieved: progress >= 50 },
    { at: 75, icon: Award, achieved: progress >= 75 },
    { at: 100, icon: Trophy, achieved: progress >= 100 },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Level {level}</h3>
        <div className="text-sm text-muted-foreground">
          {currentExercise}/{totalExercises} Exercises
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />

        {/* Milestone Markers */}
        {milestones.map(({ at, icon: Icon, achieved }, index) => (
          <motion.div
            key={at}
            className={cn(
              "absolute top-1/2 -translate-y-1/2",
              "w-6 h-6 rounded-full flex items-center justify-center",
              achieved
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20"
            )}
            style={{ left: `${at}%`, marginLeft: "-12px" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Icon className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="text-2xl font-medium">{Math.round(accuracy)}%</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground">WPM</div>
          <div className="text-2xl font-medium">{Math.round(wpm)}</div>
        </div>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-primary/90 text-primary-foreground px-8 py-4 rounded-lg shadow-lg flex items-center gap-4">
              <Trophy className="w-8 h-8" />
              <div>
                <div className="text-2xl font-bold">Level Complete!</div>
                <div className="text-primary-foreground/80">
                  {showPerfect ? "Perfect Performance! 🌟" : "Well Done! 🎉"}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
