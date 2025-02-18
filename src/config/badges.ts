/*
 * ██████╗  █████╗ ██████╗  ██████╗ ███████╗███████╗
 * ██╔══██╗██╔══██╗██╔══██╗██╔════╝ ██╔════╝██╔════╝
 * ██████╔╝███████║██║  ██║██║  ███╗█████╗  ███████╗
 * ██╔══██╗██╔══██║██║  ██║██║   ██║██╔══╝  ╚════██║
 * ██████╔╝██║  ██║██████╔╝╚██████╔╝███████╗███████║
 * ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚══════╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Config: Badges and Achievements                                                                ║
 * ║ Description: Configuration for badges, achievements, and their rewards                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { Badge } from "@/hooks/use-rewards";

// Speed Badges
export const speedBadges: Badge[] = [
  {
    id: "speed-novice",
    name: "Speed Novice",
    description: "Reach 30 WPM",
    icon: "Target",
    rarity: "common",
    points: 100,
  },
  {
    id: "speed-intermediate",
    name: "Speed Runner",
    description: "Reach 50 WPM",
    icon: "Zap",
    rarity: "rare",
    points: 250,
  },
  {
    id: "speed-advanced",
    name: "Speed Master",
    description: "Reach 70 WPM",
    icon: "Award",
    rarity: "epic",
    points: 500,
  },
  {
    id: "speed-expert",
    name: "Speed Legend",
    description: "Reach 100 WPM",
    icon: "Crown",
    rarity: "legendary",
    points: 1000,
  },
];

// Accuracy Badges
export const accuracyBadges: Badge[] = [
  {
    id: "accuracy-novice",
    name: "Precision Novice",
    description: "Maintain 90% accuracy",
    icon: "Target",
    rarity: "common",
    points: 100,
  },
  {
    id: "accuracy-intermediate",
    name: "Precision Pro",
    description: "Maintain 95% accuracy",
    icon: "Star",
    rarity: "rare",
    points: 250,
  },
  {
    id: "accuracy-advanced",
    name: "Precision Master",
    description: "Maintain 98% accuracy",
    icon: "Award",
    rarity: "epic",
    points: 500,
  },
  {
    id: "accuracy-expert",
    name: "Precision Legend",
    description: "Achieve 100% accuracy",
    icon: "Crown",
    rarity: "legendary",
    points: 1000,
  },
];

// Streak Badges
export const streakBadges: Badge[] = [
  {
    id: "streak-bronze",
    name: "Bronze Streak",
    description: "Complete 5 exercises in a row",
    icon: "Medal",
    rarity: "common",
    points: 150,
  },
  {
    id: "streak-silver",
    name: "Silver Streak",
    description: "Complete 10 exercises in a row",
    icon: "Medal",
    rarity: "rare",
    points: 300,
  },
  {
    id: "streak-gold",
    name: "Gold Streak",
    description: "Complete 20 exercises in a row",
    icon: "Medal",
    rarity: "epic",
    points: 600,
  },
  {
    id: "streak-diamond",
    name: "Diamond Streak",
    description: "Complete 50 exercises in a row",
    icon: "Medal",
    rarity: "legendary",
    points: 1500,
  },
];

// Level Completion Badges
export const levelBadges: Badge[] = [
  {
    id: "level-beginner",
    name: "Beginner Champion",
    description: "Complete all beginner levels",
    icon: "Trophy",
    rarity: "common",
    points: 200,
  },
  {
    id: "level-intermediate",
    name: "Intermediate Champion",
    description: "Complete all intermediate levels",
    icon: "Trophy",
    rarity: "rare",
    points: 400,
  },
  {
    id: "level-advanced",
    name: "Advanced Champion",
    description: "Complete all advanced levels",
    icon: "Trophy",
    rarity: "epic",
    points: 800,
  },
  {
    id: "level-expert",
    name: "Expert Champion",
    description: "Complete all expert levels",
    icon: "Trophy",
    rarity: "legendary",
    points: 2000,
  },
];

// Perfect Score Badges
export const perfectScoreBadges: Badge[] = [
  {
    id: "perfect-beginner",
    name: "Perfect Beginner",
    description: "Get a perfect score on a beginner level",
    icon: "Star",
    rarity: "rare",
    points: 300,
  },
  {
    id: "perfect-intermediate",
    name: "Perfect Intermediate",
    description: "Get a perfect score on an intermediate level",
    icon: "Star",
    rarity: "epic",
    points: 600,
  },
  {
    id: "perfect-advanced",
    name: "Perfect Advanced",
    description: "Get a perfect score on an advanced level",
    icon: "Star",
    rarity: "legendary",
    points: 1200,
  },
  {
    id: "perfect-expert",
    name: "Perfect Expert",
    description: "Get a perfect score on an expert level",
    icon: "Crown",
    rarity: "legendary",
    points: 2500,
  },
];

// Helper function to get all badges
export function getAllBadges(): Badge[] {
  return [
    ...speedBadges,
    ...accuracyBadges,
    ...streakBadges,
    ...levelBadges,
    ...perfectScoreBadges,
  ];
}

// Helper function to get badge by ID
export function getBadgeById(id: string): Badge | undefined {
  return getAllBadges().find((badge) => badge.id === id);
}

// Helper function to check if user qualifies for speed badge
export function getQualifyingSpeedBadge(wpm: number): Badge | undefined {
  return speedBadges
    .slice()
    .reverse()
    .find((badge) => {
      const requiredWPM = parseInt(badge.description.split(" ")[1]);
      return wpm >= requiredWPM;
    });
}

// Helper function to check if user qualifies for accuracy badge
export function getQualifyingAccuracyBadge(
  accuracy: number
): Badge | undefined {
  return accuracyBadges
    .slice()
    .reverse()
    .find((badge) => {
      const requiredAccuracy = parseInt(badge.description.split(" ")[1]);
      return accuracy >= requiredAccuracy;
    });
}

// Helper function to check if user qualifies for streak badge
export function getQualifyingStreakBadge(streak: number): Badge | undefined {
  return streakBadges
    .slice()
    .reverse()
    .find((badge) => {
      const requiredStreak = parseInt(badge.description.split(" ")[1]);
      return streak >= requiredStreak;
    });
}

// Helper function to get level completion badge
export function getLevelCompletionBadge(difficulty: string): Badge | undefined {
  return levelBadges.find((badge) =>
    badge.description.toLowerCase().includes(difficulty.toLowerCase())
  );
}

// Helper function to get perfect score badge
export function getPerfectScoreBadge(difficulty: string): Badge | undefined {
  return perfectScoreBadges.find((badge) =>
    badge.description.toLowerCase().includes(difficulty.toLowerCase())
  );
}
