/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: AI Hook                                                                                ║
 * ║ Description: React hook for using AI capabilities in components                                ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSupabase } from './useSupabase';
import { getAICore } from '@/lib/ai-utils';
import { TutorResponse, TypingAnalysis } from '@/lib/ai-core';
import { useToast } from '@/components/ui/use-toast';

interface UseAIOptions {
  onStreamUpdate?: (text: string) => void;
  enableStreaming?: boolean;
}

interface UseAIReturn {
  generateLesson: (level: number, mistakes: string[], style: string) => Promise<string>;
  getTutoring: (
    current: string,
    target: string,
    mistakes: Array<{ actual: string; expected: string }>,
    level: number
  ) => Promise<TutorResponse>;
  analyzePatterns: (
    mistakes: Array<{ actual: string; expected: string }>,
    speeds: number[]
  ) => Promise<TypingAnalysis>;
  isLoading: boolean;
  error: Error | null;
  clearError: () => void;
}

export function useAI(options: UseAIOptions = {}): UseAIReturn {
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize AI core with streaming if enabled
  const ai = getAICore(
    supabase,
    options.enableStreaming ? options.onStreamUpdate : undefined
  );

  // Cleanup function for aborting ongoing requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Error handling utility
  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('AI Error:', error);
    setError(new Error(errorMessage));
    toast({
      title: 'AI Error',
      description: errorMessage,
      variant: 'destructive'
    });
    setIsLoading(false);
  }, [toast]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Generate lesson content
  const generateLesson = useCallback(async (
    level: number,
    mistakes: string[],
    style: string
  ): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const content = await ai.generateLessonContent(level, mistakes, style);

      console.info('Generated lesson content:', {
        contentLength: content.length,
        level,
        mistakeCount: mistakes.length,
        style
      });

      return content;
    } catch (error) {
      handleError(error);
      return 'Failed to generate lesson content. Please try again.';
    } finally {
      setIsLoading(false);
    }
  }, [ai, handleError]);

  // Get real-time tutoring feedback
  const getTutoring = useCallback(async (
    current: string,
    target: string,
    mistakes: Array<{ actual: string; expected: string }>,
    level: number
  ): Promise<TutorResponse> => {
    try {
      setIsLoading(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await ai.provideTutoring(current, target, mistakes, level);

      console.info('Generated tutoring response:', {
        hasFeedback: !!response.feedback,
        hasNextLesson: !!response.nextLesson,
        hintCount: response.adaptiveHints?.length
      });

      return response;
    } catch (error) {
      handleError(error);
      return {
        feedback: 'Failed to generate tutoring feedback. Please continue practicing.',
        confidenceScore: 0.5
      };
    } finally {
      setIsLoading(false);
    }
  }, [ai, handleError]);

  // Analyze typing patterns
  const analyzePatterns = useCallback(async (
    mistakes: Array<{ actual: string; expected: string }>,
    speeds: number[]
  ): Promise<TypingAnalysis> => {
    try {
      setIsLoading(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const analysis = await ai.analyzeTypingPatterns(mistakes, speeds);

      console.info('Generated pattern analysis:', {
        patternCount: analysis.errorPatterns.length,
        speedDataPoints: analysis.speedTrends.length,
        focusAreas: analysis.recommendedFocus
      });

      return analysis;
    } catch (error) {
      handleError(error);
      return {
        errorPatterns: [],
        speedTrends: [],
        recommendedFocus: ['Focus on accuracy and consistent speed']
      };
    } finally {
      setIsLoading(false);
    }
  }, [ai, handleError]);

  return {
    generateLesson,
    getTutoring,
    analyzePatterns,
    isLoading,
    error,
    clearError
  };
}