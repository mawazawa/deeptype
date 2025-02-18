/// <reference lib="webworker" />

/*
 * ███████╗██████╗ ██████╗  ██████╗ ██████╗     ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗██████╗
 * ██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗    ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗
 * █████╗  ██████╔╝██████╔╝██║   ██║██████╔╝    ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ █████╗  ██████╔╝
 * ██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██╗    ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗
 * ███████╗██║  ██║██║  ██║╚██████╔╝██║  ██║    ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗███████╗██║  ██║
 * ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝     ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Worker: Error Analysis                                                                         ║
 * ║ Description: Web worker for analyzing typing errors and patterns                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { TypingSessionData, Analysis, KeyMetadata } from "../../types/typing";

declare const self: DedicatedWorkerGlobalScope;

/**
 * Error pattern categories for classification with severity weights
 */
const ERROR_PATTERNS = {
  TRANSPOSITION: { name: "transposition", weight: 0.8 },
  SUBSTITUTION: { name: "substitution", weight: 1.0 },
  INSERTION: { name: "insertion", weight: 0.9 },
  OMISSION: { name: "omission", weight: 0.9 },
  REPETITION: { name: "repetition", weight: 0.7 },
  CAPITALIZATION: { name: "capitalization", weight: 0.5 },
  TIMING: { name: "timing", weight: 0.3 },
} as const;

/**
 * Analyzes typing errors to identify patterns and provide insights
 */
class ErrorAnalysisWorker {
  private sessionData!: TypingSessionData;
  private analysis!: Analysis;
  private keyMetadata!: Map<string, KeyMetadata>;
  private errorWeights!: Map<string, number>;

  constructor() {
    this.initializeAnalysis();
    this.initializeKeyMetadata();
    this.initializeErrorWeights();
    self.addEventListener("message", this.handleMessage.bind(this));

    console.log("🔍 Error Analysis Worker initialized");
  }

  /**
   * Initialize analysis object with default values
   */
  private initializeAnalysis(): void {
    this.analysis = {
      wpm: 0,
      accuracy: 0,
      errorPatterns: [],
      speedTrends: [],
      recommendedFocus: [],
      aiRecommendations: [],
    };
  }

  /**
   * Initialize key metadata for enhanced error analysis
   */
  private initializeKeyMetadata(): void {
    this.keyMetadata = new Map();
    // Initialize with QWERTY layout frequencies
    const frequencyMap = {
      e: 12.7,
      t: 9.1,
      a: 8.2,
      o: 7.5,
      i: 7.0,
      n: 6.7,
      s: 6.3,
      h: 6.1,
      r: 6.0,
      d: 4.3,
    };

    Object.entries(frequencyMap).forEach(([char, freq]) => {
      this.keyMetadata.set(char, {
        character: char,
        frequencyScore: freq,
        finger: this.getFingerForKey(char),
        soundProfile: "standard",
        hapticPattern: {
          intensity: 1.0,
          duration: 50,
          pattern: [0, 50],
          description: "Standard key press",
        },
      });
    });
  }

  /**
   * Initialize error weights for weighted accuracy calculation
   */
  private initializeErrorWeights(): void {
    this.errorWeights = new Map(
      Object.entries(ERROR_PATTERNS).map(([key, value]) => [key, value.weight])
    );
  }

  /**
   * Handle incoming messages from the main thread
   */
  private handleMessage(event: MessageEvent): void {
    console.log("📨 Worker received message:", { type: event.data.type });

    switch (event.data.type) {
      case "ANALYZE_SESSION":
        this.sessionData = event.data.payload;
        this.analyzeSession();
        break;
      default:
        console.error("❌ Unknown message type:", event.data.type);
    }
  }

  /**
   * Main analysis pipeline for typing session data
   */
  private analyzeSession(): void {
    console.log("🔄 Starting session analysis...");

    try {
      this.calculateBaseMetrics();
      this.identifyErrorPatterns();
      this.analyzeSpeedTrends();
      this.generateRecommendations();

      console.log("✅ Analysis complete:", this.analysis);

      self.postMessage({
        type: "ANALYSIS_COMPLETE",
        payload: this.analysis,
      });
    } catch (error: unknown) {
      console.error("❌ Error during analysis:", error);
      self.postMessage({
        type: "ANALYSIS_ERROR",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Calculate basic typing metrics (WPM, accuracy) with weighted error consideration
   */
  private calculateBaseMetrics(): void {
    console.log("📊 Calculating base metrics...");

    const { metrics, errors, context } = this.sessionData;
    const totalChars = context.targetText.length;

    // Calculate weighted error count
    const weightedErrorCount = errors.reduce((acc, error) => {
      const pattern = this.classifyError(error.expected, error.actual);
      const weight = this.errorWeights.get(pattern) || 1.0;
      return acc + weight;
    }, 0);

    // Calculate weighted accuracy
    this.analysis.wpm = metrics.wpm;
    this.analysis.accuracy =
      ((totalChars - weightedErrorCount) / totalChars) * 100;

    console.log("📈 Metrics calculated:", {
      wpm: this.analysis.wpm,
      accuracy: this.analysis.accuracy,
      weightedErrorCount,
    });
  }

  /**
   * Identify patterns in typing errors with enhanced pattern detection
   */
  private identifyErrorPatterns(): void {
    console.log("🔍 Identifying error patterns...");

    const patterns = new Map<
      string,
      {
        count: number;
        contexts: string[];
        impact: number;
      }
    >();

    this.sessionData.errors.forEach((error) => {
      const pattern = this.classifyError(error.expected, error.actual);
      const context = this.getErrorContext(error);
      const impact = this.calculateErrorImpact(error);

      const existing = patterns.get(pattern) || {
        count: 0,
        contexts: [],
        impact: 0,
      };
      patterns.set(pattern, {
        count: existing.count + 1,
        contexts: [...new Set([...existing.contexts, context])],
        impact: existing.impact + impact,
      });
    });

    this.analysis.errorPatterns = Array.from(patterns.entries())
      .map(([pattern, { count, contexts, impact }]) => ({
        pattern,
        frequency: count,
        suggestion: this.getSuggestionForPattern(pattern, contexts),
        impact: impact / count, // Average impact per error
      }))
      .sort((a, b) => b.impact - a.impact);

    console.log("📋 Error patterns identified:", this.analysis.errorPatterns);
  }

  /**
   * Get the surrounding context of an error for better pattern analysis
   */
  private getErrorContext(error: (typeof this.sessionData.errors)[0]): string {
    const text = this.sessionData.context.targetText;
    const start = Math.max(0, error.position - 2);
    const end = Math.min(text.length, error.position + 3);
    return text.slice(start, end);
  }

  /**
   * Calculate the impact of an error based on various factors
   */
  private calculateErrorImpact(
    error: (typeof this.sessionData.errors)[0]
  ): number {
    const factors = {
      frequency: this.keyMetadata.get(error.expected)?.frequencyScore || 5.0,
      position: Math.abs(
        error.position - this.sessionData.context.targetText.length / 2
      ),
      timing: error.timestamp - this.sessionData.keyPresses[0].timestamp,
    };

    return (
      factors.frequency * 0.4 +
      (1 - factors.position / this.sessionData.context.targetText.length) *
        0.3 +
      Math.min(factors.timing / 1000, 1) * 0.3
    );
  }

  /**
   * Get finger position for a given key
   */
  private getFingerForKey(key: string): KeyMetadata["finger"] {
    const keyMap: Record<string, KeyMetadata["finger"]> = {
      q: "left-pinky",
      a: "left-pinky",
      z: "left-pinky",
      w: "left-ring",
      s: "left-ring",
      x: "left-ring",
      e: "left-middle",
      d: "left-middle",
      c: "left-middle",
      r: "left-index",
      f: "left-index",
      v: "left-index",
      t: "left-index",
      g: "left-index",
      b: "left-index",
      y: "right-index",
      h: "right-index",
      n: "right-index",
      u: "right-index",
      j: "right-index",
      m: "right-index",
      i: "right-middle",
      k: "right-middle",
      ",": "right-middle",
      o: "right-ring",
      l: "right-ring",
      ".": "right-ring",
      p: "right-pinky",
      ";": "right-pinky",
      "/": "right-pinky",
    };

    return keyMap[key.toLowerCase()] || "right-index";
  }

  /**
   * Analyze typing speed trends over time
   */
  private analyzeSpeedTrends(): void {
    console.log("Analyzing speed trends...");

    const timeWindows = this.splitIntoTimeWindows(60000); // 1-minute windows

    this.analysis.speedTrends = timeWindows.map((window) => ({
      timestamp: new Date(window.startTime).toISOString(),
      wpm: this.calculateWPMForWindow(window),
    }));
  }

  /**
   * Split session data into time windows for trend analysis
   */
  private splitIntoTimeWindows(windowSize: number): Array<{
    startTime: number;
    keyPresses: typeof this.sessionData.keyPresses;
  }> {
    const windows: Array<{
      startTime: number;
      keyPresses: typeof this.sessionData.keyPresses;
    }> = [];

    const { keyPresses } = this.sessionData;
    if (keyPresses.length === 0) return windows;

    const startTime = keyPresses[0].timestamp;
    const endTime = keyPresses[keyPresses.length - 1].timestamp;

    for (let time = startTime; time < endTime; time += windowSize) {
      windows.push({
        startTime: time,
        keyPresses: keyPresses.filter(
          (press) =>
            press.timestamp >= time && press.timestamp < time + windowSize
        ),
      });
    }

    return windows;
  }

  /**
   * Calculate WPM for a specific time window
   */
  private calculateWPMForWindow(window: {
    startTime: number;
    keyPresses: typeof this.sessionData.keyPresses;
  }): number {
    const chars = window.keyPresses.length;
    const minutes = 1; // Fixed 1-minute windows
    return Math.round(chars / 5 / minutes);
  }

  /**
   * Generate personalized recommendations based on analysis
   */
  private generateRecommendations(): void {
    console.log("Generating recommendations...");

    const recommendations: string[] = [];
    const focusAreas: string[] = [];

    // Analyze error patterns
    if (this.analysis.errorPatterns.length > 0) {
      const mostCommonError = this.analysis.errorPatterns[0];
      recommendations.push(
        `Focus on reducing ${mostCommonError.pattern} errors by ${mostCommonError.suggestion}`
      );
      focusAreas.push(mostCommonError.pattern);
    }

    // Analyze speed consistency
    const speedVariance = this.calculateSpeedVariance();
    if (speedVariance > 10) {
      recommendations.push(
        "Work on maintaining consistent typing speed throughout practice sessions"
      );
      focusAreas.push("speed_consistency");
    }

    // Check accuracy threshold
    if (this.analysis.accuracy < 95) {
      recommendations.push(
        "Prioritize accuracy over speed - slow down and focus on correct finger placement"
      );
      focusAreas.push("accuracy");
    }

    this.analysis.aiRecommendations = recommendations;
    this.analysis.recommendedFocus = focusAreas;
  }

  /**
   * Calculate variance in typing speed
   */
  private calculateSpeedVariance(): number {
    const speeds = this.analysis.speedTrends.map((trend) => trend.wpm);
    const mean = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;

    const squaredDiffs = speeds.map((speed) => Math.pow(speed - mean, 2));
    const variance =
      squaredDiffs.reduce((sum, diff) => sum + diff, 0) / speeds.length;

    return Math.sqrt(variance);
  }

  /**
   * Get improvement suggestion for specific error pattern
   */
  private getSuggestionForPattern(pattern: string, contexts: string[]): string {
    const suggestions: Record<string, string> = {
      [ERROR_PATTERNS.TRANSPOSITION.name]:
        "practice slower, deliberate key strikes",
      [ERROR_PATTERNS.SUBSTITUTION.name]:
        "focus on finger placement and key mapping",
      [ERROR_PATTERNS.INSERTION.name]: "work on key release timing",
      [ERROR_PATTERNS.OMISSION.name]:
        "improve finger strength and key activation",
      [ERROR_PATTERNS.REPETITION.name]: "practice key release timing",
      [ERROR_PATTERNS.CAPITALIZATION.name]: "focus on shift key coordination",
      [ERROR_PATTERNS.TIMING.name]: "maintain steady rhythm while typing",
    };

    return suggestions[pattern] || "focus on overall accuracy";
  }

  /**
   * Classify type of error based on expected and actual input
   */
  private classifyError(expected: string, actual: string): string {
    if (
      actual === expected.toLowerCase() ||
      actual === expected.toUpperCase()
    ) {
      return ERROR_PATTERNS.CAPITALIZATION.name;
    }

    if (actual.length > expected.length) {
      return ERROR_PATTERNS.INSERTION.name;
    }

    if (actual.length < expected.length) {
      return ERROR_PATTERNS.OMISSION.name;
    }

    if (actual === expected[0].repeat(expected.length)) {
      return ERROR_PATTERNS.REPETITION.name;
    }

    if (actual === expected.split("").reverse().join("")) {
      return ERROR_PATTERNS.TRANSPOSITION.name;
    }

    return ERROR_PATTERNS.SUBSTITUTION.name;
  }
}

// Initialize worker
new ErrorAnalysisWorker();

// Export for type checking
export type { ErrorAnalysisWorker };
