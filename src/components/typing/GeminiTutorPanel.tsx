/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗  █████╗ ███╗   ██╗███████╗██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗████╗  ██║██╔════╝██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝███████║██╔██╗ ██║█████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██║     ██║  ██║██║ ╚████║███████╗███████╗
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: Gemini Tutor Panel                                                                  ║
 * ║ Description: Real-time typing feedback panel powered by Google Gemini                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Target, ArrowRight, X } from "lucide-react";
import { GeminiTutor } from "@/lib/gemini";
import { TutorResponse, TutorCorrection } from "@/types/tutor";
import { UserProfile, TypingMetrics, Analysis } from "@/types/typing";
import { cn } from "@/lib/utils";

interface GeminiTutorPanelProps {
  currentText: string;
  targetText: string;
  userProfile: UserProfile;
  metrics: TypingMetrics;
  analysis?: Analysis;
  className?: string;
  onClose?: () => void;
}

export function GeminiTutorPanel({
  currentText,
  targetText,
  userProfile,
  metrics,
  analysis,
  className,
  onClose,
}: GeminiTutorPanelProps) {
  const [feedback, setFeedback] = useState<TutorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tutor = new GeminiTutor({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
    options: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    },
  });

  const getFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await tutor.getFeedback(currentText, targetText, {
        userProfile,
        currentMetrics: metrics,
        recentAnalysis: analysis,
      });

      setFeedback(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setIsLoading(false);
    }
  }, [currentText, targetText, userProfile, metrics, analysis]);

  useEffect(() => {
    // Get initial feedback
    getFeedback();

    // Set up streaming feedback
    const streamFeedback = async () => {
      try {
        for await (const response of tutor.streamFeedback(
          currentText,
          targetText,
          {
            userProfile,
            currentMetrics: metrics,
            recentAnalysis: analysis,
          }
        )) {
          setFeedback(response);
        }
      } catch (err) {
        console.error("Streaming error:", err);
      }
    };

    streamFeedback();
  }, [currentText, targetText, getFeedback]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        "fixed bottom-4 right-4 w-96 bg-background border rounded-lg shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Gemini Tutor</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <div className="animate-pulse text-muted-foreground">
                Analyzing your typing...
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-destructive text-center py-4"
            >
              {error}
            </motion.div>
          ) : (
            feedback && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Main Feedback */}
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed">
                    {feedback.feedback.message}
                  </p>
                  {feedback.feedback.encouragement && (
                    <p className="text-sm text-muted-foreground italic">
                      {feedback.feedback.encouragement}
                    </p>
                  )}
                </div>

                {/* Corrections */}
                {feedback.feedback.corrections.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Corrections
                    </h4>
                    <ul className="space-y-2">
                      {feedback.feedback.corrections.map(
                        (correction: TutorCorrection, i: number) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-sm flex items-start gap-2 p-2 bg-muted/50 rounded-md"
                          >
                            <ArrowRight className="w-4 h-4 mt-0.5 text-primary" />
                            <div>
                              <span className="font-medium">
                                {correction.error}:
                              </span>{" "}
                              {correction.suggestion}
                            </div>
                          </motion.li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {/* Insights */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Insights
                  </h4>
                  <ul className="space-y-1">
                    {feedback.insights.recommendations.map(
                      (rec: string, i: number) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="text-sm text-muted-foreground"
                        >
                          • {rec}
                        </motion.li>
                      )
                    )}
                  </ul>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-muted/50 rounded-md text-center">
                    <div className="text-2xl font-medium">
                      {Math.round(feedback.metrics.confidence * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confidence
                    </div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-md text-center">
                    <div className="text-2xl font-medium">
                      {feedback.metrics.improvement > 0 && "+"}
                      {Math.round(feedback.metrics.improvement * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Improvement
                    </div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-md text-center">
                    <div className="text-2xl font-medium">
                      {feedback.metrics.focusAreas.length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Focus Areas
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
