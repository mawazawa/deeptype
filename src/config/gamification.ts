/*
 * ██████╗  █████╗ ███╗   ███╗██╗███████╗██╗ ██████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
 * ██╔════╝ ██╔══██╗████╗ ████║██║██╔════╝██║██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
 * ██║  ███╗███████║██╔████╔██║██║█████╗  ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║
 * ██║   ██║██╔══██║██║╚██╔╝██║██║██╔══╝  ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
 * ╚██████╔╝██║  ██║██║ ╚═╝ ██║██║██║     ██║╚██████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
 *  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Config: Advanced Gamification                                                                  ║
 * ║ Description: Cutting-edge gamification features inspired by top-tier apps                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { Badge } from "@/hooks/use-rewards";

// Streak Multipliers
export const streakMultipliers = {
  daily: {
    3: 1.2, // 3 days: 20% bonus
    7: 1.5, // 7 days: 50% bonus
    14: 1.8, // 14 days: 80% bonus
    30: 2.0, // 30 days: 100% bonus
    60: 2.5, // 60 days: 150% bonus
    90: 3.0, // 90 days: 200% bonus
  },
  perfect: {
    3: 1.3, // 3 perfect scores: 30% bonus
    5: 1.6, // 5 perfect scores: 60% bonus
    10: 2.0, // 10 perfect scores: 100% bonus
  },
};

// Power-ups
export interface PowerUp {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  cooldown: number; // in seconds
  effect: {
    type: "multiplier" | "shield" | "boost" | "freeze";
    value: number;
  };
  cost: number;
  icon: string;
}

export const powerUps: PowerUp[] = [
  {
    id: "double-points",
    name: "Double Points",
    description: "Double all points earned for 30 seconds",
    duration: 30,
    cooldown: 300,
    effect: {
      type: "multiplier",
      value: 2,
    },
    cost: 1000,
    icon: "Zap",
  },
  {
    id: "error-shield",
    name: "Error Shield",
    description: "Ignore the next 3 typing errors",
    duration: 60,
    cooldown: 600,
    effect: {
      type: "shield",
      value: 3,
    },
    cost: 1500,
    icon: "Shield",
  },
  {
    id: "speed-boost",
    name: "Speed Boost",
    description: "WPM requirements reduced by 20% for 45 seconds",
    duration: 45,
    cooldown: 450,
    effect: {
      type: "boost",
      value: 0.8,
    },
    cost: 2000,
    icon: "Rocket",
  },
  {
    id: "time-freeze",
    name: "Time Freeze",
    description: "Pause the timer for 15 seconds",
    duration: 15,
    cooldown: 900,
    effect: {
      type: "freeze",
      value: 1,
    },
    cost: 3000,
    icon: "Clock",
  },
];

// Combo System
export const comboSystem = {
  thresholds: [
    { streak: 5, multiplier: 1.2 },
    { streak: 10, multiplier: 1.5 },
    { streak: 15, multiplier: 1.8 },
    { streak: 20, multiplier: 2.0 },
    { streak: 30, multiplier: 2.5 },
    { streak: 50, multiplier: 3.0 },
  ],
  bonusPoints: {
    perfect: 100,
    speedThreshold: 50,
    noErrors: 75,
    comboMaintained: 50,
  },
  decayRate: 0.1, // Combo decay rate per second
};

// Achievement Chains
export interface AchievementChain {
  id: string;
  name: string;
  description: string;
  stages: {
    requirement: number;
    reward: number;
    badge: Badge;
  }[];
}

export const achievementChains: AchievementChain[] = [
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Chain of speed-related achievements",
    stages: [
      {
        requirement: 50, // WPM
        reward: 500,
        badge: {
          id: "speed-demon-1",
          name: "Speed Demon I",
          description: "Reach 50 WPM",
          icon: "Zap",
          rarity: "rare",
          points: 500,
        },
      },
      {
        requirement: 75,
        reward: 1000,
        badge: {
          id: "speed-demon-2",
          name: "Speed Demon II",
          description: "Reach 75 WPM",
          icon: "Zap",
          rarity: "epic",
          points: 1000,
        },
      },
      {
        requirement: 100,
        reward: 2000,
        badge: {
          id: "speed-demon-3",
          name: "Speed Demon III",
          description: "Reach 100 WPM",
          icon: "Zap",
          rarity: "legendary",
          points: 2000,
        },
      },
    ],
  },
];

// Daily Challenges
export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  requirement: {
    type: "wpm" | "accuracy" | "exercises" | "perfect" | "combo";
    value: number;
  };
  reward: {
    points: number;
    powerUp?: PowerUp;
    badge?: Badge;
  };
  timeLimit: number; // in seconds
}

export const dailyChallenges: DailyChallenge[] = [
  {
    id: "speed-sprint",
    name: "Speed Sprint",
    description: "Reach 70 WPM in a single exercise",
    requirement: {
      type: "wpm",
      value: 70,
    },
    reward: {
      points: 1000,
      powerUp: powerUps[0], // Double Points power-up
    },
    timeLimit: 300,
  },
  {
    id: "perfect-chain",
    name: "Perfect Chain",
    description: "Complete 5 exercises with 100% accuracy",
    requirement: {
      type: "perfect",
      value: 5,
    },
    reward: {
      points: 2000,
      badge: {
        id: "daily-perfect",
        name: "Daily Perfectionist",
        description: "Complete the Perfect Chain challenge",
        icon: "Star",
        rarity: "epic",
        points: 1000,
      },
    },
    timeLimit: 1800,
  },
];

// Special Events
export interface TypingEvent {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  multiplier: number;
  challenges: DailyChallenge[];
  specialPowerUps: PowerUp[];
  leaderboard: boolean;
}

export const typingEvents: TypingEvent[] = [
  {
    id: "speed-week",
    name: "Speed Week",
    description: "A week-long event focused on typing speed",
    duration: 604800, // 7 days
    multiplier: 2.0,
    challenges: [
      // Add event-specific challenges
    ],
    specialPowerUps: [
      // Add event-specific power-ups
    ],
    leaderboard: true,
  },
];

// Haptic Feedback Patterns
export const hapticPatterns = {
  keyPress: {
    normal: [10],
    error: [30, 50],
    combo: [10, 20, 30],
    achievement: [20, 40, 60, 80],
  },
  rewards: {
    small: [20, 40],
    medium: [30, 60, 90],
    large: [40, 80, 120, 160],
    epic: [50, 100, 150, 200, 250],
  },
};

// Sound Effect Variations
export const soundEffects = {
  keyPress: ["key-press-1.mp3", "key-press-2.mp3", "key-press-3.mp3"],
  achievement: [
    "achievement-1.mp3",
    "achievement-2.mp3",
    "achievement-epic.mp3",
  ],
  combo: ["combo-start.mp3", "combo-maintain.mp3", "combo-break.mp3"],
  powerUp: ["power-up-activate.mp3", "power-up-deactivate.mp3"],
};

// Visual Effects
export const visualEffects = {
  combo: {
    colors: ["#FFD700", "#FFA500", "#FF4500"],
    particles: {
      small: { count: 20, spread: 50 },
      medium: { count: 50, spread: 100 },
      large: { count: 100, spread: 150 },
    },
  },
  achievement: {
    colors: ["#4CAF50", "#2196F3", "#9C27B0", "#F44336"],
    particles: {
      rare: { count: 50, spread: 70 },
      epic: { count: 100, spread: 120 },
      legendary: { count: 200, spread: 180 },
    },
  },
};
