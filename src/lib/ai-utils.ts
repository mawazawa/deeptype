/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: AI Utilities                                                                           ║
 * ║ Description: Utility functions for initializing and managing AI components                     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AICore, AIConfig, TutorResponse } from './ai-core';
import { getConfig } from './config';

// Singleton instance of AICore
let aiCoreInstance: AICore | null = null;

/**
 * Initialize the AI Core with proper configuration
 * @param supabase - Supabase client instance
 * @param streamCallback - Optional callback for streaming responses
 * @returns Initialized AICore instance
 */
export function initializeAICore(
  supabase: SupabaseClient,
  streamCallback?: (text: string) => void
): AICore {
  if (aiCoreInstance) {
    console.info('Reusing existing AI Core instance');
    return aiCoreInstance;
  }

  const config = getConfig();

  const aiConfig: AIConfig = {
    model: config.aiModel,
    temperature: config.aiTemperature,
    maxTokens: config.aiMaxTokens,
    streamCallback
  };

  console.info('Initializing new AI Core with config:', {
    model: aiConfig.model,
    temperature: aiConfig.temperature,
    maxTokens: aiConfig.maxTokens,
    hasStreamCallback: !!streamCallback
  });

  aiCoreInstance = new AICore(supabase, aiConfig);
  return aiCoreInstance;
}

/**
 * Reset the AI Core instance (useful for testing or reconfiguration)
 */
export function resetAICore(): void {
  aiCoreInstance = null;
  console.info('AI Core instance has been reset');
}

/**
 * Get the current AI Core instance, initializing if necessary
 * @param supabase - Supabase client instance
 * @param streamCallback - Optional callback for streaming responses
 * @returns AICore instance
 */
export function getAICore(
  supabase: SupabaseClient,
  streamCallback?: (text: string) => void
): AICore {
  return aiCoreInstance || initializeAICore(supabase, streamCallback);
}

/**
 * Format tutor response for display
 * @param response - Raw tutor response
 * @returns Formatted response object
 */
export function formatTutorResponse(response: TutorResponse): {
  message: string;
  hints: string[];
  confidence: number;
} {
  return {
    message: response.feedback,
    hints: response.adaptiveHints || [],
    confidence: response.confidenceScore || 0.5
  };
}

/**
 * Calculate typing accuracy percentage
 * @param mistakes - Array of typing mistakes
 * @param totalCharacters - Total characters typed
 * @returns Accuracy percentage
 */
export function calculateAccuracy(
  mistakes: Array<{ actual: string; expected: string }>,
  totalCharacters: number
): number {
  if (totalCharacters === 0) return 100;
  const errorCount = mistakes.length;
  return Math.round(((totalCharacters - errorCount) / totalCharacters) * 100);
}

/**
 * Calculate words per minute (WPM)
 * @param characterCount - Number of characters typed
 * @param timeInSeconds - Time taken in seconds
 * @returns WPM calculation
 */
export function calculateWPM(characterCount: number, timeInSeconds: number): number {
  if (timeInSeconds === 0) return 0;
  // Standard calculation: 5 characters = 1 word
  const wordsTyped = characterCount / 5;
  const minutes = timeInSeconds / 60;
  return Math.round(wordsTyped / minutes);
}

/**
 * Generate a typing challenge appropriate for the user's level
 * @param userLevel - Current user level (1-10)
 * @param previousMistakes - Array of previous mistakes
 * @returns Challenge text and metadata
 */
export async function generateChallenge(
  userLevel: number,
  previousMistakes: Array<{ actual: string; expected: string }> = []
): Promise<{
  text: string;
  difficulty: number;
  focusAreas: string[];
}> {
  // Fallback content if AI generation fails
  const fallbackChallenges = [
    { text: 'The quick brown fox jumps over the lazy dog.', difficulty: 1 },
    { text: 'Pack my box with five dozen liquor jugs.', difficulty: 2 },
    { text: 'How vexingly quick daft zebras jump!', difficulty: 3 },
    { text: 'The five boxing wizards jump quickly.', difficulty: 4 },
    { text: 'Sphinx of black quartz, judge my vow.', difficulty: 5 }
  ];

  try {
    const ai = aiCoreInstance;
    if (!ai) {
      throw new Error('AI Core not initialized');
    }

    const lessonContent = await ai.generateLessonContent(
      userLevel,
      previousMistakes.map(m => `${m.actual} -> ${m.expected}`),
      'adaptive'
    );

    return {
      text: lessonContent,
      difficulty: userLevel,
      focusAreas: previousMistakes.map(m => m.expected)
    };
  } catch (error) {
    console.error('Failed to generate challenge:', error);
    const fallback = fallbackChallenges[Math.min(userLevel - 1, fallbackChallenges.length - 1)];
    return {
      text: fallback.text,
      difficulty: fallback.difficulty,
      focusAreas: ['accuracy', 'speed']
    };
  }
}