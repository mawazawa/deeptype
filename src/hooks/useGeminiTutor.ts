/*
 * ██╗  ██╗ ██████╗  ██████╗ ██╗  ██╗███████╗
 * ██║  ██║██╔═══██╗██╔═══██╗██║ ██╔╝██╔════╝
 * ███████║██║   ██║██║   ██║█████╔╝ ███████╗
 * ██╔══██║██║   ██║██║   ██║██╔═██╗ ╚════██║
 * ██║  ██║╚██████╔╝╚██████╔╝██║  ██╗███████║
 * ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Hook: useGeminiTutor                                                                           ║
 * ║ Description: Custom hook for managing Gemini tutor state and interactions                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback, useEffect } from "react";
import { GeminiTutor } from "@/lib/gemini";
import { TutorResponse } from "@/types/tutor";
import { UserProfile, TypingMetrics, Analysis } from "@/types/typing";

interface UseGeminiTutorProps {
  currentText: string;
  targetText: string;
  userProfile: UserProfile;
  metrics: TypingMetrics;
  analysis?: Analysis;
  streamingEnabled?: boolean;
}

interface UseGeminiTutorState {
  feedback: TutorResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeminiTutor({
  currentText,
  targetText,
  userProfile,
  metrics,
  analysis,
  streamingEnabled = true,
}: UseGeminiTutorProps) {
  const [state, setState] = useState<UseGeminiTutorState>({
    feedback: null,
    isLoading: false,
    error: null,
  });

  // Initialize tutor instance
  const tutor = new GeminiTutor({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
    options: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    },
  });

  // Get one-time feedback
  const getFeedback = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response = await tutor.getFeedback(currentText, targetText, {
        userProfile,
        currentMetrics: metrics,
        recentAnalysis: analysis,
      });

      setState((prev) => ({
        ...prev,
        feedback: response,
        isLoading: false,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to get feedback",
        isLoading: false,
      }));
    }
  }, [currentText, targetText, userProfile, metrics, analysis]);

  // Set up streaming feedback
  useEffect(() => {
    if (!streamingEnabled) return;

    let isMounted = true;
    let controller: AbortController | null = null;

    const streamFeedback = async () => {
      try {
        controller = new AbortController();

        for await (const response of tutor.streamFeedback(
          currentText,
          targetText,
          {
            userProfile,
            currentMetrics: metrics,
            recentAnalysis: analysis,
          }
        )) {
          if (!isMounted || controller.signal.aborted) break;
          setState((prev) => ({
            ...prev,
            feedback: response,
            isLoading: false,
          }));
        }
      } catch (err) {
        if (!isMounted) return;
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error ? err.message : "Streaming error occurred",
          isLoading: false,
        }));
      }
    };

    streamFeedback();

    return () => {
      isMounted = false;
      controller?.abort();
    };
  }, [
    streamingEnabled,
    currentText,
    targetText,
    userProfile,
    metrics,
    analysis,
  ]);

  // Reset state
  const reset = useCallback(() => {
    setState({
      feedback: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    getFeedback,
    reset,
  };
}
