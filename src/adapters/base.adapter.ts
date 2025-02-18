/*
 *  █████╗ ██╗    ████████╗██╗   ██╗████████╗ ██████╗ ██████╗
 * ██╔══██╗██║    ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗
 * ███████║██║       ██║   ██║   ██║   ██║   ██║   ██║██████╔╝
 * ██╔══██║██║       ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗
 * ██║  ██║██║       ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║
 * ╚═╝  ╚═╝╚═╝       ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Adapter: Base AI Adapter Interface                                                             ║
 * ║ Description: Core interface for AI service adapters                                            ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { Lesson, Analysis, TutorFeedback, FeedbackRequest } from '../types/typing';

/**
 * Base interface for AI service adapters
 * Defines the core functionality required for AI-powered typing tutoring
 */
export interface IAIAdapter {
  /**
   * Initialize the AI adapter with configuration
   * @param config Configuration object for the AI service
   */
  initialize(config: AIAdapterConfig): Promise<void>;

  /**
   * Generate a personalized typing lesson
   * @param userLevel Current user level (1-100)
   * @param focusAreas Array of areas to focus on (e.g., ["speed", "accuracy"])
   * @param preferences User preferences for lesson generation
   */
  generateLesson(
    userLevel: number,
    focusAreas: string[],
    preferences: LessonPreferences
  ): Promise<Lesson>;

  /**
   * Analyze typing performance and provide insights
   * @param sessionData Raw typing session data
   * @param userHistory Previous session history
   */
  analyzePerformance(
    sessionData: TypingSessionData,
    userHistory: PerformanceHistory
  ): Promise<Analysis>;

  /**
   * Provide real-time feedback during typing practice
   * @param request Feedback request containing current state
   */
  provideFeedback(request: FeedbackRequest): Promise<TutorFeedback>;

  /**
   * Check adapter health and connectivity
   * @returns Boolean indicating if the adapter is healthy
   */
  healthCheck(): Promise<boolean>;
}

/**
 * Configuration for AI adapter initialization
 */
export interface AIAdapterConfig {
  apiKey?: string;
  endpoint?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  requestTimeout?: number;
  retryConfig?: {
    maxRetries: number;
    backoffFactor: number;
    initialDelay: number;
  };
  cacheConfig?: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
}

/**
 * User preferences for lesson generation
 */
export interface LessonPreferences {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contentType: 'code' | 'text' | 'mixed';
  duration: number;
  includeExercises: boolean;
  adaptivePacing: boolean;
  thematicContent?: string[];
}

/**
 * Raw typing session data
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

/**
 * Historical performance data
 */
export interface PerformanceHistory {
  recentSessions: Array<{
    timestamp: number;
    wpm: number;
    accuracy: number;
    lessonId: string;
  }>;
  weaknesses: Array<{
    pattern: string;
    frequency: number;
    lastSeen: number;
  }>;
  strengths: Array<{
    pattern: string;
    accuracy: number;
    speed: number;
  }>;
  progressMetrics: {
    averageWPM: number;
    averageAccuracy: number;
    totalPracticeTime: number;
    lessonsCompleted: number;
  };
}