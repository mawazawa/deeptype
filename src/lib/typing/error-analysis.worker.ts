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

import { TypingSessionData, Analysis } from '../../types/typing';

/**
 * Error pattern categories for classification
 */
const ERROR_PATTERNS = {
  TRANSPOSITION: 'transposition',
  SUBSTITUTION: 'substitution',
  INSERTION: 'insertion',
  OMISSION: 'omission',
  REPETITION: 'repetition',
  CAPITALIZATION: 'capitalization',
  TIMING: 'timing'
} as const;

/**
 * Analyzes typing errors to identify patterns and provide insights
 */
class ErrorAnalysisWorker {
  private sessionData: TypingSessionData;
  private analysis: Analysis;

  constructor() {
    this.initializeAnalysis();
    self.addEventListener('message', this.handleMessage.bind(this));
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
      aiRecommendations: []
    };
  }

  /**
   * Handle incoming messages from the main thread
   */
  private handleMessage(event: MessageEvent): void {
    console.log('Worker received message:', { type: event.data.type });

    switch (event.data.type) {
      case 'ANALYZE_SESSION':
        this.sessionData = event.data.payload;
        this.analyzeSession();
        break;
      default:
        console.error('Unknown message type:', event.data.type);
    }
  }

  /**
   * Main analysis pipeline for typing session data
   */
  private analyzeSession(): void {
    console.log('Starting session analysis...');

    try {
      this.calculateBaseMetrics();
      this.identifyErrorPatterns();
      this.analyzeSpeedTrends();
      this.generateRecommendations();

      self.postMessage({
        type: 'ANALYSIS_COMPLETE',
        payload: this.analysis
      });
    } catch (error) {
      console.error('Error during analysis:', error);
      self.postMessage({
        type: 'ANALYSIS_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Calculate basic typing metrics (WPM, accuracy)
   */
  private calculateBaseMetrics(): void {
    console.log('Calculating base metrics...');

    const { metrics } = this.sessionData;
    const totalChars = this.sessionData.context.targetText.length;
    const errorCount = this.sessionData.errors.length;

    this.analysis.wpm = metrics.wpm;
    this.analysis.accuracy = ((totalChars - errorCount) / totalChars) * 100;
  }

  /**
   * Identify patterns in typing errors
   */
  private identifyErrorPatterns(): void {
    console.log('Identifying error patterns...');

    const patterns = new Map<string, number>();

    this.sessionData.errors.forEach(error => {
      const pattern = this.classifyError(error.expected, error.actual);
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    });

    this.analysis.errorPatterns = Array.from(patterns.entries())
      .map(([pattern, frequency]) => ({
        pattern,
        frequency,
        suggestion: this.getSuggestionForPattern(pattern)
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Classify type of error based on expected and actual input
   */
  private classifyError(expected: string, actual: string): string {
    if (actual === expected.toLowerCase() || actual === expected.toUpperCase()) {
      return ERROR_PATTERNS.CAPITALIZATION;
    }

    if (actual.length > expected.length) {
      return ERROR_PATTERNS.INSERTION;
    }

    if (actual.length < expected.length) {
      return ERROR_PATTERNS.OMISSION;
    }

    if (actual === expected[0].repeat(expected.length)) {
      return ERROR_PATTERNS.REPETITION;
    }

    if (actual === expected.split('').reverse().join('')) {
      return ERROR_PATTERNS.TRANSPOSITION;
    }

    return ERROR_PATTERNS.SUBSTITUTION;
  }

  /**
   * Analyze typing speed trends over time
   */
  private analyzeSpeedTrends(): void {
    console.log('Analyzing speed trends...');

    const timeWindows = this.splitIntoTimeWindows(60000); // 1-minute windows

    this.analysis.speedTrends = timeWindows.map(window => ({
      timestamp: new Date(window.startTime).toISOString(),
      wpm: this.calculateWPMForWindow(window)
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
          press => press.timestamp >= time && press.timestamp < time + windowSize
        )
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
    return Math.round((chars / 5) / minutes);
  }

  /**
   * Generate personalized recommendations based on analysis
   */
  private generateRecommendations(): void {
    console.log('Generating recommendations...');

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
        'Work on maintaining consistent typing speed throughout practice sessions'
      );
      focusAreas.push('speed_consistency');
    }

    // Check accuracy threshold
    if (this.analysis.accuracy < 95) {
      recommendations.push(
        'Prioritize accuracy over speed - slow down and focus on correct finger placement'
      );
      focusAreas.push('accuracy');
    }

    this.analysis.aiRecommendations = recommendations;
    this.analysis.recommendedFocus = focusAreas;
  }

  /**
   * Calculate variance in typing speed
   */
  private calculateSpeedVariance(): number {
    const speeds = this.analysis.speedTrends.map(trend => trend.wpm);
    const mean = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;

    const squaredDiffs = speeds.map(speed => Math.pow(speed - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / speeds.length;

    return Math.sqrt(variance);
  }

  /**
   * Get improvement suggestion for specific error pattern
   */
  private getSuggestionForPattern(pattern: string): string {
    const suggestions: Record<string, string> = {
      [ERROR_PATTERNS.TRANSPOSITION]: 'practice slower, deliberate key strikes',
      [ERROR_PATTERNS.SUBSTITUTION]: 'focus on finger placement and key mapping',
      [ERROR_PATTERNS.INSERTION]: 'work on key release timing',
      [ERROR_PATTERNS.OMISSION]: 'improve finger strength and key activation',
      [ERROR_PATTERNS.REPETITION]: 'practice key release timing',
      [ERROR_PATTERNS.CAPITALIZATION]: 'focus on shift key coordination',
      [ERROR_PATTERNS.TIMING]: 'maintain steady rhythm while typing'
    };

    return suggestions[pattern] || 'focus on overall accuracy';
  }
}

// Initialize worker
new ErrorAnalysisWorker();

// Export for type checking
export type { ErrorAnalysisWorker };