/*
 * ██████╗ ███████╗██████╗ ██████╗ ██╗     ███████╗██╗  ██╗██╗████████╗██╗   ██╗
 * ██╔══██╗██╔════╝██╔══██╗██╔══██╗██║     ██╔════╝╚██╗██╔╝██║╚══██╔══╝╚██╗ ██╔╝
 * ██████╔╝█████╗  ██████╔╝██████╔╝██║     █████╗   ╚███╔╝ ██║   ██║    ╚████╔╝
 * ██╔═══╝ ██╔══╝  ██╔══██╗██╔═══╝ ██║     ██╔══╝   ██╔██╗ ██║   ██║     ╚██╔╝
 * ██║     ███████╗██║  ██║██║     ███████╗███████╗██╔╝ ██╗██║   ██║      ██║
 * ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ API: Perplexity Search                                                                         ║
 * ║ Description: Enhanced search functionality with AI-powered insights for typing improvement      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { PerplexityAI } from "../lib/perplexity";
import { UserProfile, TypingMetrics, Analysis } from "@/types/typing";

interface SearchResult {
  title: string;
  snippet: string;
  url?: string;
  type: "documentation" | "exercise" | "insight" | "recommendation";
  confidence: number;
  metadata?: {
    difficulty: "beginner" | "intermediate" | "advanced";
    focusArea?: string[];
    estimatedTime?: number;
    prerequisites?: string[];
  };
}

interface PerplexityResponse {
  results: SearchResult[];
  analytics?: {
    processingTime: number;
    confidence: number;
    suggestedNextSteps?: string[];
  };
}

interface SearchContext {
  userProfile?: UserProfile;
  recentMetrics?: TypingMetrics;
  currentAnalysis?: Analysis;
  learningPath?: {
    currentLevel: number;
    completedLessons: string[];
    focusAreas: string[];
  };
}

interface RawSearchResult {
  title: string;
  snippet: string;
  url?: string;
  type?: string;
  metadata?: {
    difficulty?: "beginner" | "intermediate" | "advanced";
    focusArea?: string[];
    estimatedTime?: number;
    prerequisites?: string[];
  };
}

export async function perplexitySearch(
  query: string,
  context?: SearchContext
): Promise<PerplexityResponse> {
  try {
    console.log("🔍 Initiating Perplexity search with context:", {
      query,
      context: context ? "provided" : "none",
    });

    const perplexity = new PerplexityAI({
      apiKey: process.env.PERPLEXITY_API_KEY!,
      options: {
        temperature: 0.3,
        maxTokens: 2000,
        model: "sonar-pro",
      },
    });

    // Enhance query with user context if available
    const enhancedQuery = context
      ? enrichQueryWithContext(query, context)
      : query;

    const response = await perplexity.query({
      query: enhancedQuery,
      context: {
        project: "deeptype-transition",
        framework: "React + TypeScript + Vite",
        libraries: ["shadcn/ui", "tailwindcss", "radix-ui"],
        userContext: context
          ? {
              userLevel: context.userProfile?.level,
              currentWPM: context.recentMetrics?.wpm,
              focusAreas:
                context.currentAnalysis?.errorPatterns?.map((p) => p.pattern) ||
                [],
              learningProgress: context.learningPath?.currentLevel || 0,
            }
          : undefined,
      },
    });

    // Process and enhance results
    const enhancedResults = await enhanceResults(response.results, context);

    return {
      results: enhancedResults,
      analytics: {
        processingTime: Date.now() - performance.now(),
        confidence: calculateConfidence(enhancedResults),
        suggestedNextSteps: generateNextSteps(enhancedResults, context),
      },
    };
  } catch (error) {
    console.error("❌ Perplexity search error:", error);
    return {
      results: [],
      analytics: {
        processingTime: 0,
        confidence: 0,
      },
    };
  }
}

/**
 * Enrich search query with user context for more personalized results
 */
function enrichQueryWithContext(query: string, context: SearchContext): string {
  const { userProfile, recentMetrics, currentAnalysis } = context;

  const contextualInfo = [
    userProfile?.level && `User Level: ${userProfile.level}`,
    recentMetrics?.wpm && `Current WPM: ${recentMetrics.wpm}`,
    currentAnalysis?.errorPatterns?.[0]?.pattern &&
      `Focus Area: ${currentAnalysis.errorPatterns[0].pattern}`,
  ]
    .filter(Boolean)
    .join(", ");

  return `${query} (Context: ${contextualInfo})`;
}

/**
 * Enhance search results with additional metadata and recommendations
 */
async function enhanceResults(
  results: RawSearchResult[],
  context?: SearchContext
): Promise<SearchResult[]> {
  return results.map((result) => ({
    title: result.title,
    snippet: result.snippet,
    url: result.url,
    type: determineResultType(result),
    confidence: calculateResultConfidence(result),
    metadata: {
      difficulty: determineDifficulty(result, context),
      focusArea: extractFocusAreas(result),
      estimatedTime: estimateCompletionTime(result),
      prerequisites: identifyPrerequisites(result),
    },
  }));
}

/**
 * Determine the type of search result based on content analysis
 */
function determineResultType(result: RawSearchResult): SearchResult["type"] {
  if (result.url?.includes("docs")) return "documentation";
  if (result.title?.toLowerCase().includes("exercise")) return "exercise";
  if (result.snippet?.includes("recommend")) return "recommendation";
  return "insight";
}

/**
 * Calculate confidence score for a search result
 */
function calculateResultConfidence(result: RawSearchResult): number {
  // Implement confidence scoring based on result relevance
  return 0.85; // Placeholder
}

/**
 * Determine appropriate difficulty level for the user
 */
function determineDifficulty(
  result: RawSearchResult,
  context?: SearchContext
): "beginner" | "intermediate" | "advanced" {
  const userLevel = context?.userProfile?.level || 1;
  if (userLevel < 3) return "beginner";
  if (userLevel < 7) return "intermediate";
  return "advanced";
}

/**
 * Extract relevant focus areas from the result
 */
function extractFocusAreas(result: RawSearchResult): string[] {
  // Implement focus area extraction logic
  return ["accuracy", "speed", "technique"];
}

/**
 * Estimate time to complete an exercise or read documentation
 */
function estimateCompletionTime(result: RawSearchResult): number {
  // Implement completion time estimation logic
  return 15; // minutes
}

/**
 * Identify prerequisites for a learning resource
 */
function identifyPrerequisites(result: RawSearchResult): string[] {
  // Implement prerequisite identification logic
  return ["basic-typing", "home-row-position"];
}

/**
 * Calculate overall confidence score for search results
 */
function calculateConfidence(results: SearchResult[]): number {
  if (results.length === 0) return 0;
  return (
    results.reduce((sum, result) => sum + result.confidence, 0) / results.length
  );
}

/**
 * Generate suggested next steps based on search results and user context
 */
function generateNextSteps(
  results: SearchResult[],
  context?: SearchContext
): string[] {
  if (!context || results.length === 0) return [];

  const steps = [
    "Complete recommended exercises",
    "Review typing technique documentation",
    "Practice identified focus areas",
  ];

  const wpm = context.recentMetrics?.wpm;
  if (typeof wpm === "number" && wpm < 40) {
    steps.push("Focus on accuracy over speed");
  }

  if (context.currentAnalysis?.errorPatterns?.length) {
    const pattern = context.currentAnalysis.errorPatterns[0]?.pattern;
    if (pattern) {
      steps.push(`Work on reducing ${pattern} errors`);
    }
  }

  return steps;
}
