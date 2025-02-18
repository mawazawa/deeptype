/*
 * ██████╗ ███████╗██╗    ██╗ █████╗ ██████╗ ██████╗ ███████╗
 * ██╔══██╗██╔════╝██║    ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝
 * ██████╔╝█████╗  ██║ █╗ ██║███████║██████╔╝██║  ██║███████╗
 * ██╔══██╗██╔══╝  ██║███╗██║██╔══██║██╔══██╗██║  ██║╚════██║
 * ██║  ██║███████╗╚███╔███╔╝██║  ██║██║  ██║██████╔╝███████║
 * ╚═╝  ╚═╝╚══════╝ ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Hook: useRewards                                                                               ║
 * ║ Description: Custom hook for managing rewards, points, badges, and celebratory effects         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback, useEffect } from "react";
import useSound from "use-sound";
import confetti from "canvas-confetti";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
}

export interface Reward {
  type: "points" | "badge" | "levelUp" | "achievement";
  points?: number;
  badge?: Badge;
  message: string;
  sound: "success" | "levelUp" | "badge" | "achievement";
}

interface UseRewardsOptions {
  onReward?: (reward: Reward) => void;
  initialPoints?: number;
  initialBadges?: Badge[];
}

// Confetti patterns for different reward types
const confettiPatterns = {
  points: {
    particleCount: 50,
    spread: 70,
    origin: { y: 0.7 },
  },
  badge: {
    particleCount: 100,
    spread: 100,
    origin: { y: 0.7 },
  },
  levelUp: {
    particleCount: 200,
    spread: 160,
    origin: { y: 0.7 },
  },
  achievement: {
    particleCount: 150,
    spread: 120,
    origin: { y: 0.7 },
  },
};

export function useRewards({
  onReward,
  initialPoints = 0,
  initialBadges = [],
}: UseRewardsOptions = {}) {
  const [points, setPoints] = useState(initialPoints);
  const [badges, setBadges] = useState<Badge[]>(initialBadges);
  const [recentRewards, setRecentRewards] = useState<Reward[]>([]);

  // Sound effects using use-sound
  const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.5 });
  const [playLevelUp] = useSound("/sounds/level-up.mp3", { volume: 0.7 });
  const [playBadge] = useSound("/sounds/badge.mp3", { volume: 0.6 });
  const [playAchievement] = useSound("/sounds/achievement.mp3", {
    volume: 0.8,
  });

  // Play sound based on reward type
  const playRewardSound = useCallback(
    (sound: Reward["sound"]) => {
      switch (sound) {
        case "success":
          playSuccess();
          break;
        case "levelUp":
          playLevelUp();
          break;
        case "badge":
          playBadge();
          break;
        case "achievement":
          playAchievement();
          break;
      }
    },
    [playSuccess, playLevelUp, playBadge, playAchievement]
  );

  // Trigger confetti based on reward type
  const triggerConfetti = useCallback((type: Reward["type"]) => {
    const pattern = confettiPatterns[type];
    confetti({
      ...pattern,
      colors: ["#FFD700", "#FFA500", "#FF4500"],
      shapes: ["circle", "square"],
      ticks: 200,
    });
  }, []);

  // Add a reward and trigger effects
  const addReward = useCallback(
    (reward: Reward) => {
      // Update points
      if (reward.points) {
        setPoints((prev) => prev + reward.points);
      }

      // Add badge if present
      if (reward.badge) {
        setBadges((prev) => [...prev, reward.badge!]);
      }

      // Add to recent rewards
      setRecentRewards((prev) => [reward, ...prev].slice(0, 5));

      // Play sound effect
      playRewardSound(reward.sound);

      // Trigger confetti
      triggerConfetti(reward.type);

      // Call onReward callback
      onReward?.(reward);
    },
    [playRewardSound, triggerConfetti, onReward]
  );

  // Calculate level based on points
  const calculateLevel = useCallback((points: number) => {
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }, []);

  // Calculate progress to next level
  const calculateProgress = useCallback(
    (points: number) => {
      const currentLevel = calculateLevel(points);
      const currentLevelMinPoints = Math.pow(currentLevel - 1, 2) * 100;
      const nextLevelMinPoints = Math.pow(currentLevel, 2) * 100;
      const progress =
        (points - currentLevelMinPoints) /
        (nextLevelMinPoints - currentLevelMinPoints);
      return Math.min(Math.max(progress, 0), 1);
    },
    [calculateLevel]
  );

  return {
    points,
    badges,
    recentRewards,
    addReward,
    level: calculateLevel(points),
    progress: calculateProgress(points),
    totalBadges: badges.length,
    hasRecentReward: recentRewards.length > 0,
  };
}
