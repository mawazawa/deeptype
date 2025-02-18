/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Types: Typing Core                                                                             ║
 * ║ Description: Type definitions for typing tutor core functionality                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Finger positions for touch typing
 */
export type FingerPosition =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky";

/**
 * Metadata for each key on the keyboard
 */
export interface KeyMetadata {
  character: string;
  finger: FingerPosition;
  frequencyScore: number;
  soundProfile: string;
  hapticPattern: {
    intensity: number;
    duration: number;
    pattern: number[];
    description: string;
  };
}

/**
 * User profile with typing preferences and history
 */
export interface UserProfile {
  id: string;
  level: number;
  accuracy: number;
  wpm: number;
  weakKeys: string[];
  learningStyle: "visual" | "auditory" | "kinesthetic";
  recentMistakes: Array<{ actual: string; expected: string }>;
  focusAreas: string[];
  preferences: {
    soundEnabled: boolean;
    hapticEnabled: boolean;
    visualGuides: boolean;
    keyboardLayout: "qwerty" | "dvorak" | "colemak";
  };
}

/**
 * A typing lesson with content and metadata
 */
export interface Lesson {
  id: string;
  content: string;
  level: number;
  focusKeys: string[];
  estimatedDuration: number;
  metadata?: {
    category?: string;
    tags?: string[];
    source?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
  };
}

/**
 * A typing session with performance metrics
 */
export interface TypingSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  wpm: number;
  accuracy: number;
  errors: Array<{
    actual: string;
    expected: string;
    timestamp: number;
    position: number;
  }>;
  keyPressTimings: Record<string, number[]>;
  pauseDurations: number[];
  completedText: string;
  targetText: string;
}

/**
 * Analysis of typing performance
 */
export interface Analysis {
  wpm: number;
  accuracy: number;
  errorPatterns: Array<{
    pattern: string;
    frequency: number;
    suggestion: string;
    impact?: number;
  }>;
  speedTrends: Array<{
    timestamp: string;
    wpm: number;
  }>;
  recommendedFocus: string[];
  aiRecommendations: string[];
}

/**
 * Request for AI tutor feedback
 */
export interface FeedbackRequest {
  currentText: string;
  targetText: string;
  recentMistakes: Array<{ actual: string; expected: string }>;
  userLevel: number;
  learningStyle: string;
  context?: {
    lessonType?: string;
    previousAttempts?: number;
    timeSpent?: number;
  };
}

/**
 * AI tutor feedback response
 */
export interface TutorFeedback {
  message: string;
  corrections: Array<{
    actual: string;
    expected: string;
    suggestion: string;
  }>;
  suggestions: string[];
  metadata?: {
    confidence: number;
    focusAreas?: string[];
    nextLessonRecommendation?: string;
  };
}

/**
 * Performance metrics for analytics
 */
export interface TypingMetrics {
  userId: string;
  sessionId: string;
  timestamp: number;
    wpm: number;
    accuracy: number;
    errorRate: number;
    backspaceCount: number;
    pauseCount: number;
    totalTime: number;
    activeTime: number;
  heatmap: Record<string, number>;
  progression: {
    levelProgress: number;
    achievementsUnlocked: string[];
    skillsImproved: string[];
  };
}

/**
 * Raw typing session data for analysis
 */
export interface TypingSessionData {
  keyPresses: Array<{
    key: string;
    timestamp: number;
    duration: number;
    pressure?: number;
  }>;
  errors: Array<{
    expected: string;
    actual: string;
    position: number;
    timestamp: number;
  }>;
  metrics: {
    wpm: number;
    accuracy: number;
    duration: number;
    pauseCount: number;
  };
  context: {
    lessonId: string;
    difficulty: string;
    targetText: string;
    completedText: string;
  };
}
