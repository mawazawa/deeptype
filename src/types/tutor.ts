/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ████████╗██╗   ██╗██████╗ ███████╗███████╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔════╝
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝       ██║    ╚████╔╝ ██████╔╝█████╗  ███████╗
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗       ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  ╚════██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║       ██║      ██║   ██║     ███████╗███████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝       ╚═╝      ╚═╝   ╚═╝     ╚══════╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Types: Tutor Response Types                                                                    ║
 * ║ Description: Type definitions for the Gemini AI tutor responses and metrics                    ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

/**
 * Represents a correction suggestion from the tutor
 */
export interface TutorCorrection {
  error: string;
  suggestion: string;
  context?: string;
  severity: "low" | "medium" | "high";
}

/**
 * Represents the feedback message and corrections
 */
export interface TutorFeedback {
  message: string;
  encouragement?: string;
  corrections: TutorCorrection[];
  focusArea?: string;
}

/**
 * Represents insights and recommendations
 */
export interface TutorInsights {
  recommendations: string[];
  patterns?: {
    strengths: string[];
    weaknesses: string[];
  };
  nextSteps?: string[];
}

/**
 * Represents performance metrics
 */
export interface TutorMetrics {
  confidence: number; // 0-1
  improvement: number; // -1 to 1
  focusAreas: string[];
  accuracy?: number;
  speed?: number;
  consistency?: number;
}

/**
 * Complete tutor response
 */
export interface TutorResponse {
  feedback: TutorFeedback;
  insights: TutorInsights;
  metrics: TutorMetrics;
  timestamp: number;
  sessionId?: string;
}
