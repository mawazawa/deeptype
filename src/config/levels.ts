/*
 * ██╗     ███████╗██╗   ██╗███████╗██╗     ███████╗
 * ██║     ██╔════╝██║   ██║██╔════╝██║     ██╔════╝
 * ██║     █████╗  ██║   ██║█████╗  ██║     ███████╗
 * ██║     ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ╚════██║
 * ███████╗███████╗ ╚████╔╝ ███████╗███████╗███████║
 * ╚══════╝╚══════╝  ╚═══╝  ╚══════╝╚══════╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Config: Typing Levels                                                                          ║
 * ║ Description: Configuration for typing levels, exercises, and progression                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { Level } from "@/components/typing/LevelSelector";

export const TOTAL_EXERCISES_PER_LEVEL = 10;
export const PERFECT_SCORE_ACCURACY = 98;
export const PERFECT_SCORE_WPM_MULTIPLIER = 10; // Level 1 = 10 WPM, Level 2 = 20 WPM, etc.

export const levels: Level[] = [
  {
    id: 1,
    title: "The Basics",
    description: "Master the home row keys and basic finger positioning",
    difficulty: "beginner",
    exercises: TOTAL_EXERCISES_PER_LEVEL,
    unlocked: true,
    completed: false,
  },
  {
    id: 2,
    title: "Common Words",
    description: "Practice typing frequently used English words",
    difficulty: "beginner",
    exercises: TOTAL_EXERCISES_PER_LEVEL,
    unlocked: false,
    completed: false,
  },
  {
    id: 3,
    title: "Sentences",
    description: "Type complete sentences with proper punctuation",
    difficulty: "intermediate",
    exercises: TOTAL_EXERCISES_PER_LEVEL,
    unlocked: false,
    completed: false,
  },
  {
    id: 4,
    title: "Code Snippets",
    description: "Practice typing common programming patterns",
    difficulty: "intermediate",
    exercises: TOTAL_EXERCISES_PER_LEVEL,
    unlocked: false,
    completed: false,
  },
  {
    id: 5,
    title: "Speed Training",
    description: "Focus on increasing your typing speed",
    difficulty: "advanced",
    exercises: TOTAL_EXERCISES_PER_LEVEL,
    unlocked: false,
    completed: false,
  },
  {
    id: 6,
    title: "Accuracy Challenge",
    description: "Maintain high accuracy at increased speeds",
    difficulty: "advanced",
    exercises: TOTAL_EXERCISES_PER_LEVEL,
    unlocked: false,
    completed: false,
  },
  {
    id: 7,
    title: "Mixed Content",
    description: "Handle various content types and formats",
    difficulty: "advanced",
    exercises: TOTAL_EXERCISES_PER_LEVEL,
    unlocked: false,
    completed: false,
  },
  {
    id: 8,
    title: "Expert Challenge",
    description: "Push your limits with complex exercises",
    difficulty: "expert",
    exercises: TOTAL_EXERCISES_PER_LEVEL,
    unlocked: false,
    completed: false,
  },
];

export const exercises: Record<number, string[]> = {
  1: [
    "The quick brown fox jumps over the lazy dog",
    "Pack my box with five dozen liquor jugs",
    "How vexingly quick daft zebras jump",
    "The five boxing wizards jump quickly",
    "Sphinx of black quartz, judge my vow",
    "Two driven jocks help fax my big quiz",
    "Five quacking zephyrs jolt my wax bed",
    "The jay, pig, fox, zebra, and my wolves quack",
    "Quick zephyrs blow, vexing daft Jim",
    "Waltz, nymph, for quick jigs vex Bud",
  ],
  2: [
    "She sells seashells by the seashore",
    "Peter Piper picked a peck of pickled peppers",
    "How much wood would a woodchuck chuck",
    "Betty Botter bought some butter",
    "I scream, you scream, we all scream for ice cream",
    "A proper copper coffee pot",
    "Fuzzy Wuzzy was a bear",
    "Red lorry, yellow lorry",
    "Unique New York",
    "Six slick slim slick saplings",
  ],
  // Add more exercises for other levels...
};

export function getExerciseForLevel(
  level: number,
  exerciseIndex: number
): string {
  if (!exercises[level] || exerciseIndex >= exercises[level].length) {
    return "Exercise not found";
  }
  return exercises[level][exerciseIndex];
}

export function calculatePerfectScoreRequirements(level: number) {
  return {
    accuracy: PERFECT_SCORE_ACCURACY,
    wpm: level * PERFECT_SCORE_WPM_MULTIPLIER,
  };
}

export function isLevelComplete(
  level: number,
  currentExercise: number,
  accuracy: number,
  wpm: number
): boolean {
  return (
    currentExercise >= TOTAL_EXERCISES_PER_LEVEL &&
    accuracy >= PERFECT_SCORE_ACCURACY &&
    wpm >= level * PERFECT_SCORE_WPM_MULTIPLIER
  );
}

export function shouldUnlockNextLevel(
  currentLevel: number,
  accuracy: number,
  wpm: number
): boolean {
  return accuracy >= 90 && wpm >= currentLevel * 5;
}
