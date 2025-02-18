/*
 * ██╗     ██╗██╗   ██╗███████╗     ██████╗ ██████╗  █████╗  ██████╗██╗  ██╗
 * ██║     ██║██║   ██║██╔════╝    ██╔════╝██╔═══██╗██╔══██╗██╔════╝██║  ██║
 * ██║     ██║██║   ██║█████╗      ██║     ██║   ██║███████║██║     ███████║
 * ██║     ██║╚██╗ ██╔╝██╔══╝      ██║     ██║   ██║██╔══██║██║     ██╔══██║
 * ███████╗██║ ╚████╔╝ ███████╗    ╚██████╗╚██████╔╝██║  ██║╚██████╗██║  ██║
 * ╚══════╝╚═╝  ╚═══╝  ╚══════╝     ╚═════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: Live Coach Panel                                                                    ║
 * ║ Description: Interactive AI typing coach with real-time feedback and personalized guidance     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  Target,
  ArrowRight,
  X,
  MessageSquare,
  Zap,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { useGeminiTutor } from "@/hooks/useGeminiTutor";
import { TutorResponse, TutorCorrection } from "@/types/tutor";
import { UserProfile, TypingMetrics, Analysis } from "@/types/typing";
import { cn } from "@/lib/utils";
import { useFocusManagement } from "@/hooks/use-focus-management";
import { useTypingSounds } from "@/hooks/use-typing-sounds";
import { LevelProgress } from "./LevelProgress";

interface LiveCoachPanelProps {
  currentText: string;
  targetText: string;
  userProfile: UserProfile;
  metrics: TypingMetrics;
  analysis?: Analysis;
  className?: string;
  onClose?: () => void;
  currentExercise: number;
  totalExercises: number;
  onLevelComplete?: () => void;
}

export function LiveCoachPanel({
  currentText,
  targetText,
  userProfile,
  metrics,
  analysis,
  className,
  onClose,
  currentExercise,
  totalExercises,
  onLevelComplete,
}: LiveCoachPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setFocus } = useFocusManagement();
  const [messages, setMessages] = useState<
    Array<{
      type: "coach" | "user" | "system";
      content: string;
      timestamp: number;
    }>
  >([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const { handleFeedback, handleAchievement } = useTypingSounds();

  const { feedback, isLoading, error, getFeedback } = useGeminiTutor({
    currentText,
    targetText,
    userProfile,
    metrics,
    analysis,
    streamingEnabled: true,
  });

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Process feedback into messages with sound effects
  useEffect(() => {
    if (feedback) {
      // Add coach's main feedback with sound
      setMessages((prev) => [
        ...prev,
        {
          type: "coach",
          content: feedback.feedback.message,
          timestamp: Date.now(),
        },
      ]);
      handleFeedback("encouragement");

      // Add corrections with sound
      feedback.feedback.corrections.forEach((correction) => {
        setMessages((prev) => [
          ...prev,
          {
            type: "system",
            content: `Correction: ${correction.error} → ${correction.suggestion}`,
            timestamp: Date.now(),
          },
        ]);
        handleFeedback("correction");
      });

      // Show encouragement with animation and sound
      if (feedback.feedback.encouragement) {
        setShowEncouragement(true);
        handleAchievement("milestone");
        setTimeout(() => setShowEncouragement(false), 3000);
      }
    }
  }, [feedback, handleFeedback, handleAchievement]);

  // Handle error messages
  useEffect(() => {
    if (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: `Error: ${error}`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [error]);

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
          <Brain className="w-5 h-5 text-primary animate-pulse" />
          <h3 className="font-medium">Live AI Coach</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Tracking */}
      <div className="p-4 border-b">
        <LevelProgress
          level={userProfile.level}
          currentExercise={currentExercise}
          totalExercises={totalExercises}
          accuracy={metrics.accuracy}
          wpm={metrics.wpm}
          onLevelComplete={onLevelComplete}
        />
      </div>

      {/* Messages Area */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: message.type === "coach" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "flex items-start gap-2 p-3 rounded-lg",
                message.type === "coach" && "bg-muted/50",
                message.type === "user" && "bg-primary/10 ml-8",
                message.type === "system" && "bg-accent/20"
              )}
            >
              {message.type === "coach" && (
                <Brain className="w-4 h-4 mt-1 text-primary" />
              )}
              {message.type === "user" && (
                <MessageSquare className="w-4 h-4 mt-1 text-primary" />
              )}
              {message.type === "system" && (
                <Zap className="w-4 h-4 mt-1 text-accent-foreground" />
              )}
              <div className="flex-1 text-sm">{message.content}</div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      {/* Metrics & Progress */}
      {feedback && (
        <div className="p-4 border-t bg-muted/50 space-y-4">
          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-background rounded-md text-center">
              <div className="text-2xl font-medium">
                {Math.round(feedback.metrics.confidence * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Confidence</div>
            </div>
            <div className="p-2 bg-background rounded-md text-center">
              <div className="text-2xl font-medium text-green-500">
                {feedback.metrics.improvement > 0 && "+"}
                {Math.round(feedback.metrics.improvement * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Improvement</div>
            </div>
            <div className="p-2 bg-background rounded-md text-center">
              <div className="text-2xl font-medium">
                {feedback.metrics.focusAreas.length}
              </div>
              <div className="text-xs text-muted-foreground">Focus Areas</div>
            </div>
          </div>

          {/* Encouragement Toast */}
          <AnimatePresence>
            {showEncouragement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-green-500/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {feedback.feedback.encouragement}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(
                    100,
                    Math.round(feedback.metrics.confidence * 100)
                  )}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
