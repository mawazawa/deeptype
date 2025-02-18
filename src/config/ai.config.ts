/*
 *  █████╗ ██╗     ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗
 * ██╔══██╗██║    ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝
 * ███████║██║    ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
 * ██╔══██║██║    ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
 * ██║  ██║██║    ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
 * ╚═╝  ╚═╝╚═╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Config: AI Service Configuration                                                               ║
 * ║ Description: Configuration settings for AI-powered typing tutor                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { AIAdapterConfig } from '../adapters/base.adapter';

/**
 * Default configuration for AI services
 */
export const DEFAULT_AI_CONFIG: AIAdapterConfig = {
  // API Configuration
  apiKey: process.env.OPENAI_API_KEY,
  endpoint: 'https://api.openai.com/v1/chat/completions',
  modelName: 'gpt-4-turbo-preview',
  temperature: 0.7,
  maxTokens: 1000,
  requestTimeout: 30000, // 30 seconds

  // Retry Configuration
  retryConfig: {
    maxRetries: 3,
    backoffFactor: 1.5,
    initialDelay: 1000, // 1 second
  },

  // Cache Configuration
  cacheConfig: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 1000, // number of items
  },
};

/**
 * Lesson generation parameters
 */
export const LESSON_CONFIG = {
  minLength: 100, // characters
  maxLength: 500, // characters
  difficultyLevels: {
    beginner: {
      maxWordLength: 5,
      commonWordsOnly: true,
      includeNumbers: false,
      includeSpecialChars: false,
    },
    intermediate: {
      maxWordLength: 8,
      commonWordsOnly: false,
      includeNumbers: true,
      includeSpecialChars: false,
    },
    advanced: {
      maxWordLength: 12,
      commonWordsOnly: false,
      includeNumbers: true,
      includeSpecialChars: true,
    },
  },
  contentTypes: {
    code: {
      languages: ['typescript', 'javascript', 'python', 'java'],
      includeComments: true,
      maxLineLength: 80,
    },
    text: {
      categories: ['general', 'business', 'technical', 'creative'],
      formatOptions: ['sentences', 'paragraphs', 'dialogue'],
    },
  },
};

/**
 * Performance analysis thresholds
 */
export const ANALYSIS_CONFIG = {
  accuracy: {
    excellent: 98,
    good: 95,
    needsImprovement: 90,
  },
  wpm: {
    beginner: {
      target: 30,
      minimum: 20,
    },
    intermediate: {
      target: 50,
      minimum: 40,
    },
    advanced: {
      target: 80,
      minimum: 60,
    },
    professional: {
      target: 100,
      minimum: 80,
    },
  },
  errorPatterns: {
    significantThreshold: 3, // occurrences
    timeWindow: 300000, // 5 minutes
  },
};

/**
 * Feedback generation settings
 */
export const FEEDBACK_CONFIG = {
  realTime: {
    enabled: true,
    minInterval: 1000, // 1 second
    maxSuggestions: 3,
  },
  sessionEnd: {
    detailedAnalysis: true,
    includeVisualizations: true,
    recommendationCount: 5,
  },
  adaptiveThresholds: {
    enabled: true,
    adjustmentFactor: 0.1,
    minThreshold: 0.5,
    maxThreshold: 1.5,
  },
};

/**
 * AI model prompts and templates
 */
export const AI_PROMPTS = {
  lessonGeneration: {
    system: `You are an expert typing tutor, specialized in creating personalized typing lessons.
Focus on the user's skill level, learning style, and specific areas for improvement.`,

    template: `Create a typing lesson for a {level} user focusing on {focusAreas}.
The lesson should be {contentType} with {difficulty} difficulty.
Include specific exercises for {weaknesses}.`,
  },

  feedback: {
    system: `You are a supportive typing coach, providing constructive feedback to help users improve.
Balance encouragement with specific, actionable suggestions.`,

    template: `Based on the recent performance:
- Accuracy: {accuracy}%
- Speed: {wpm} WPM
- Error Patterns: {errorPatterns}

Provide personalized feedback and recommendations.`,
  },

  analysis: {
    system: `You are an analytical typing assessment tool, identifying patterns and trends in typing behavior.
Focus on data-driven insights and practical improvement strategies.`,

    template: `Analyze the following typing session data:
- Duration: {duration}
- Key Metrics: {metrics}
- Error Distribution: {errorDistribution}

Provide a detailed analysis with actionable insights.`,
  },
};

/**
 * Environment-specific configurations
 */
export const ENV_CONFIG = {
  development: {
    ...DEFAULT_AI_CONFIG,
    cacheConfig: {
      enabled: true,
      ttl: 300, // 5 minutes
      maxSize: 100,
    },
    logging: {
      level: 'debug',
      detailed: true,
    },
  },

  production: {
    ...DEFAULT_AI_CONFIG,
    temperature: 0.5, // More deterministic
    cacheConfig: {
      enabled: true,
      ttl: 3600, // 1 hour
      maxSize: 1000,
    },
    logging: {
      level: 'error',
      detailed: false,
    },
  },

  test: {
    ...DEFAULT_AI_CONFIG,
    apiKey: 'test-key',
    endpoint: 'http://localhost:3000/mock-ai',
    cacheConfig: {
      enabled: false,
    },
    logging: {
      level: 'debug',
      detailed: true,
    },
  },
};