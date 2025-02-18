/*
 *  █████╗ ██╗    ████████╗██╗   ██╗████████╗ ██████╗ ██████╗
 * ██╔══██╗██║    ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗
 * ███████║██║       ██║   ██║   ██║   ██║   ██║   ██║██████╔╝
 * ██╔══██║██║       ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗
 * ██║  ██║██║       ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║
 * ╚═╝  ╚═╝╚═╝       ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Service: AI Typing Tutor                                                                       ║
 * ║ Description: Core service for AI-powered typing instruction and feedback                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { IAIAdapter } from '../adapters/base.adapter';
import {
  Lesson,
  Analysis,
  TutorFeedback,
  FeedbackRequest,
  TypingSessionData,
  UserProfile
} from '../types/typing';
import {
  DEFAULT_AI_CONFIG,
  LESSON_CONFIG,
  ANALYSIS_CONFIG,
  FEEDBACK_CONFIG
} from '../config/ai.config';

/**
 * Service interface for AI-powered typing tutor
 */
export interface IAITutorService {
  generateLesson(userProfile: UserProfile): Promise<Lesson>;
  analyzePerformance(sessionData: TypingSessionData): Promise<Analysis>;
  provideFeedback(request: FeedbackRequest): Promise<TutorFeedback>;
}

/**
 * Implementation of AI-powered typing tutor service
 */
export class AITutorService implements IAITutorService {
  private adapter: IAIAdapter;
  private worker: Worker;

  constructor(adapter: IAIAdapter) {
    this.adapter = adapter;
    this.initializeService();
  }

  /**
   * Initialize the service and its dependencies
   */
  private async initializeService(): Promise<void> {
    console.log('Initializing AI Tutor Service...');

    try {
      // Initialize AI adapter
      await this.adapter.initialize(DEFAULT_AI_CONFIG);

      // Initialize error analysis worker
      this.worker = new Worker(
        new URL('../lib/typing/error-analysis.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onerror = (error) => {
        console.error('Error in analysis worker:', error);
      };

      console.log('AI Tutor Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Tutor Service:', error);
      throw new Error('Service initialization failed');
    }
  }

  /**
   * Generate a personalized typing lesson
   */
  public async generateLesson(userProfile: UserProfile): Promise<Lesson> {
    console.log('Generating lesson for user:', userProfile.id);

    try {
      // Determine appropriate difficulty level
      const difficulty = this.calculateDifficulty(userProfile);

      // Get focus areas based on user's weak points
      const focusAreas = this.determineFocusAreas(userProfile);

      // Generate lesson using AI adapter
      const lesson = await this.adapter.generateLesson(
        userProfile.level,
        focusAreas,
        {
          difficulty,
          contentType: this.selectContentType(userProfile),
          duration: this.calculateLessonDuration(userProfile),
          includeExercises: true,
          adaptivePacing: true,
          thematicContent: this.getThematicContent(userProfile)
        }
      );

      console.log('Lesson generated successfully:', { lessonId: lesson.id });
      return lesson;
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      return this.getFallbackLesson(userProfile);
    }
  }

  /**
   * Analyze typing performance using web worker
   */
  public async analyzePerformance(sessionData: TypingSessionData): Promise<Analysis> {
    console.log('Analyzing performance for session:', sessionData.context.lessonId);

    return new Promise((resolve, reject) => {
      try {
        // Set up worker message handling
        this.worker.onmessage = (event) => {
          if (event.data.type === 'ANALYSIS_COMPLETE') {
            console.log('Analysis completed successfully');
            resolve(event.data.payload);
          } else if (event.data.type === 'ANALYSIS_ERROR') {
            console.error('Analysis failed:', event.data.error);
            reject(new Error(event.data.error));
          }
        };

        // Send session data to worker for analysis
        this.worker.postMessage({
          type: 'ANALYZE_SESSION',
          payload: sessionData
        });
      } catch (error) {
        console.error('Error initiating analysis:', error);
        reject(error);
      }
    });
  }

  /**
   * Provide real-time feedback during typing practice
   */
  public async provideFeedback(request: FeedbackRequest): Promise<TutorFeedback> {
    console.log('Generating feedback for user level:', request.userLevel);

    try {
      // Get AI-powered feedback
      const feedback = await this.adapter.provideFeedback(request);

      // Enhance feedback with additional context
      return this.enhanceFeedback(feedback, request);
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      return this.getFallbackFeedback(request);
    }
  }

  /**
   * Calculate appropriate difficulty level based on user profile
   */
  private calculateDifficulty(profile: UserProfile): 'beginner' | 'intermediate' | 'advanced' {
    const { level, accuracy, wpm } = profile;

    if (level < 30 || accuracy < ANALYSIS_CONFIG.accuracy.needsImprovement) {
      return 'beginner';
    } else if (level < 70 || wpm < ANALYSIS_CONFIG.wpm.intermediate.target) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * Determine focus areas based on user's performance history
   */
  private determineFocusAreas(profile: UserProfile): string[] {
    const focusAreas: string[] = [];

    // Add areas based on weak keys
    if (profile.weakKeys.length > 0) {
      focusAreas.push('key_accuracy');
    }

    // Add areas based on recent mistakes
    if (profile.recentMistakes.length > ANALYSIS_CONFIG.errorPatterns.significantThreshold) {
      focusAreas.push('error_patterns');
    }

    // Add speed-related focus if WPM is below target
    if (profile.wpm < ANALYSIS_CONFIG.wpm[this.calculateDifficulty(profile)].target) {
      focusAreas.push('speed');
    }

    return focusAreas.length > 0 ? focusAreas : ['general_improvement'];
  }

  /**
   * Select appropriate content type based on user profile
   */
  private selectContentType(profile: UserProfile): 'code' | 'text' | 'mixed' {
    // Default to text for beginners
    if (profile.level < 30) {
      return 'text';
    }

    // Use code content for advanced users
    if (profile.level > 70) {
      return 'code';
    }

    // Mix content types for intermediate users
    return 'mixed';
  }

  /**
   * Calculate appropriate lesson duration based on user level
   */
  private calculateLessonDuration(profile: UserProfile): number {
    const baseDuration = 300; // 5 minutes
    const levelFactor = Math.min(2, 1 + (profile.level / 100));
    return Math.round(baseDuration * levelFactor);
  }

  /**
   * Get thematic content based on user preferences
   */
  private getThematicContent(profile: UserProfile): string[] {
    return profile.focusAreas.length > 0
      ? profile.focusAreas
      : LESSON_CONFIG.contentTypes.text.categories;
  }

  /**
   * Enhance AI feedback with additional context and suggestions
   */
  private enhanceFeedback(
    feedback: TutorFeedback,
    request: FeedbackRequest
  ): TutorFeedback {
    return {
      ...feedback,
      suggestions: [
        ...feedback.suggestions,
        ...this.generateAdditionalSuggestions(request)
      ],
      metadata: {
        ...feedback.metadata,
        confidence: this.calculateConfidence(feedback, request),
        focusAreas: this.refineFocusAreas(feedback, request)
      }
    };
  }

  /**
   * Generate additional suggestions based on request context
   */
  private generateAdditionalSuggestions(request: FeedbackRequest): string[] {
    const suggestions: string[] = [];

    if (request.recentMistakes.length > 0) {
      suggestions.push(
        'Practice these characters slowly: ' +
        Array.from(new Set(request.recentMistakes.map(m => m.expected))).join(', ')
      );
    }

    if (request.context?.previousAttempts && request.context.previousAttempts > 2) {
      suggestions.push(
        'Consider taking a short break to refresh your focus'
      );
    }

    return suggestions;
  }

  /**
   * Calculate confidence score for feedback
   */
  private calculateConfidence(
    feedback: TutorFeedback,
    request: FeedbackRequest
  ): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on error pattern recognition
    if (feedback.corrections.length > 0) {
      confidence += 0.1;
    }

    // Adjust based on context availability
    if (request.context) {
      confidence += 0.1;
    }

    return Math.min(1, confidence);
  }

  /**
   * Refine focus areas based on feedback and request context
   */
  private refineFocusAreas(
    feedback: TutorFeedback,
    request: FeedbackRequest
  ): string[] {
    const areas = new Set<string>();

    // Add areas from feedback
    feedback.metadata?.focusAreas?.forEach(area => areas.add(area));

    // Add areas based on recent mistakes
    if (request.recentMistakes.length > ANALYSIS_CONFIG.errorPatterns.significantThreshold) {
      areas.add('error_patterns');
    }

    return Array.from(areas);
  }

  /**
   * Get fallback lesson when AI generation fails
   */
  private getFallbackLesson(profile: UserProfile): Lesson {
    console.log('Using fallback lesson for user:', profile.id);

    return {
      id: `fallback-${Date.now()}`,
      content: 'The quick brown fox jumps over the lazy dog. ' +
               'Pack my box with five dozen liquor jugs. ' +
               'How vexingly quick daft zebras jump!',
      level: profile.level,
      focusKeys: [],
      estimatedDuration: 300,
      metadata: {
        category: 'general',
        difficulty: 'intermediate',
        tags: ['fallback', 'pangram']
      }
    };
  }

  /**
   * Get fallback feedback when AI generation fails
   */
  private getFallbackFeedback(request: FeedbackRequest): TutorFeedback {
    console.log('Using fallback feedback for user level:', request.userLevel);

    return {
      message: 'Keep practicing to improve your typing skills!',
      corrections: request.recentMistakes.map(mistake => ({
        actual: mistake.actual,
        expected: mistake.expected,
        suggestion: 'Focus on accuracy over speed'
      })),
      suggestions: [
        'Take your time and focus on accuracy',
        'Practice regularly to build muscle memory',
        'Pay attention to proper finger placement'
      ],
      metadata: {
        confidence: 0.5,
        focusAreas: ['accuracy'],
      }
    };
  }
}