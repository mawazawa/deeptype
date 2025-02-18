/*
 * ██╗     ███████╗██╗   ██╗███████╗██╗     ███████╗
 * ██║     ██╔════╝██║   ██║██╔════╝██║     ██╔════╝
 * ██║     █████╗  ██║   ██║█████╗  ██║     ███████╗
 * ██║     ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ╚════██║
 * ███████╗███████╗ ╚████╔╝ ███████╗███████╗███████║
 * ╚══════╝╚══════╝  ╚═══╝  ╚══════╝╚══════╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: Level Selector                                                                       ║
 * ║ Description: Interactive level selection interface with previews and progress tracking          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, ChevronRight, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTypingSounds } from "@/hooks/use-typing-sounds";

export interface Level {
  id: number;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  exercises: number;
  unlocked: boolean;
  completed: boolean;
  perfectScore?: boolean;
  bestAccuracy?: number;
  bestWPM?: number;
}

interface LevelSelectorProps {
  levels: Level[];
  currentLevel: number;
  onSelectLevel: (level: Level) => void;
  className?: string;
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  intermediate: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  advanced: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  expert: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function LevelSelector({
  levels,
  currentLevel,
  onSelectLevel,
  className,
}: LevelSelectorProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { handleKeyPress } = useTypingSounds();

  const handleSelect = (level: Level) => {
    if (!level.unlocked) {
      handleKeyPress("error");
      return;
    }
    handleKeyPress("normal");
    setSelectedId(level.id);
    onSelectLevel(level);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-2xl font-bold">Select Level</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {levels.map((level) => (
            <motion.div
              key={level.id}
              layoutId={`level-${level.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={level.unlocked ? { scale: 1.02 } : undefined}
              onClick={() => handleSelect(level)}
              className={cn(
                "relative p-6 rounded-lg border cursor-pointer transition-colors",
                level.unlocked
                  ? "bg-card hover:bg-accent"
                  : "bg-muted/50 cursor-not-allowed",
                level.id === currentLevel && "ring-2 ring-primary",
                "group"
              )}
            >
              {/* Level Status */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {level.completed && (
                  <Trophy
                    className={cn(
                      "w-4 h-4",
                      level.perfectScore ? "text-yellow-500" : "text-primary"
                    )}
                  />
                )}
                {!level.unlocked && (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              {/* Level Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Level {level.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {level.description}
                  </p>
                </div>

                {/* Difficulty Badge */}
                <div
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                    difficultyColors[level.difficulty]
                  )}
                >
                  {level.difficulty.charAt(0).toUpperCase() +
                    level.difficulty.slice(1)}
                </div>

                {/* Progress Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{level.exercises} exercises</span>
                  {level.bestWPM && (
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {level.bestWPM} WPM
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {level.unlocked && (
                  <div className="relative h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-primary"
                      initial={{ width: 0 }}
                      animate={{
                        width: level.completed ? "100%" : "0%",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Hover State */}
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none",
                  "bg-gradient-to-r from-primary/5 to-primary/10"
                )}
                initial={false}
                animate={{ opacity: level.unlocked ? 0 : 0.1 }}
                whileHover={{ opacity: level.unlocked ? 1 : 0.1 }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
