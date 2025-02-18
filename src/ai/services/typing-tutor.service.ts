/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Service: AI Typing Tutor                                                                       ║
 * ║ Description: Core AI service for generating lessons, analyzing performance, and giving feedback ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { AIAdapter } from '../adapters/base.adapter';
import { UserProfile, Lesson, TypingSession, Analysis, TutorFeedback, FeedbackRequest } from '../../types/typing';
import { ErrorAnalysisWorker } from '../../lib/typing/error-analysis.worker';
import { getConfig } from '../../config/ai.config';

interface IAITutorService {
  generateLesson(user: UserProfile): Promise<Lesson>;
  analyzePerformance(session: TypingSession): Promise<Analysis>;
  provideFeedback(input: FeedbackRequest): Promise<TutorFeedback>;
}

export class AITutorService implements IAITutorService {
  private readonly worker: ErrorAnalysisWorker;
  private readonly config = getConfig();

  constructor(private adapter: AIAdapter) {
    this.worker = new ErrorAnalysisWorker();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    console.info('Initializing AI Tutor Service with config:', {
      model: this.config.model,
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });
  }

  async generateLesson(user: UserProfile): Promise<Lesson> {
    try {
      const prompt = this.buildLessonPrompt(user);
      const response = await this.adapter.generateContent(prompt);

      return this.parseLessonResponse(response, user.level);
    } catch (error) {
      console.error('Failed to generate lesson:', error);
      return this.getFallbackLesson(user.level);
    }
  }

  async analyzePerformance(session: TypingSession): Promise<Analysis> {
    try {
      // Offload heavy computation to web worker
      const analysis = await this.worker.analyze(session);

      // Enhance analysis with AI insights
      const aiInsights = await this.adapter.generateContent(
        this.buildAnalysisPrompt(session, analysis)
      );

      return {
        ...analysis,
        aiRecommendations: this.parseAIInsights(aiInsights),
      };
    } catch (error) {
      console.error('Failed to analyze performance:', error);
      return this.getFallbackAnalysis(session);
    }
  }

  async provideFeedback(input: FeedbackRequest): Promise<TutorFeedback> {
    try {
      const prompt = this.buildFeedbackPrompt(input);
      const response = await this.adapter.generateContent(prompt);

      return this.parseFeedbackResponse(response);
    } catch (error) {
      console.error('Failed to provide feedback:', error);
      return this.getFallbackFeedback(input);
    }
  }

  private buildLessonPrompt(user: UserProfile): string {
    return `Generate a typing lesson for:
Level: ${user.level}
Progress: ${user.accuracy}% accuracy, ${user.wpm} WPM
Weak keys: ${user.weakKeys.join(', ')}
Learning style: ${user.learningStyle}
Previous mistakes: ${JSON.stringify(user.recentMistakes)}
Focus areas: ${user.focusAreas.join(', ')}`;
  }

  private buildAnalysisPrompt(session: TypingSession, baseAnalysis: Analysis): string {
    return `Analyze typing performance:
Session data: ${JSON.stringify(session)}
Base analysis: ${JSON.stringify(baseAnalysis)}
Provide specific recommendations for improvement.`;
  }

  private buildFeedbackPrompt(input: FeedbackRequest): string {
    return `Provide typing feedback:
Current text: ${input.currentText}
Target text: ${input.targetText}
Recent mistakes: ${JSON.stringify(input.recentMistakes)}
User level: ${input.userLevel}
Learning style: ${input.learningStyle}`;
  }

  private parseLessonResponse(response: string, level: number): Lesson {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse lesson response:', error);
      return this.getFallbackLesson(level);
    }
  }

  private parseAIInsights(insights: string): string[] {
    try {
      return JSON.parse(insights);
    } catch (error) {
      console.error('Failed to parse AI insights:', error);
      return ['Focus on accuracy and consistent speed'];
    }
  }

  private parseFeedbackResponse(response: string): TutorFeedback {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse feedback response:', error);
      return {
        message: 'Keep practicing to improve your speed and accuracy.',
        corrections: [],
        suggestions: ['Take your time to type accurately'],
      };
    }
  }

  private getFallbackLesson(level: number): Lesson {
    const lessons = {
      1: 'The quick brown fox jumps over the lazy dog.',
      2: 'Pack my box with five dozen liquor jugs.',
      3: 'How vexingly quick daft zebras jump!',
      4: 'The five boxing wizards jump quickly.',
      5: 'Sphinx of black quartz, judge my vow.',
    };

    return {
      id: `fallback-${Date.now()}`,
      content: lessons[level as keyof typeof lessons] || lessons[1],
      level,
      focusKeys: [],
      estimatedDuration: 300,
    };
  }

  private getFallbackAnalysis(session: TypingSession): Analysis {
    return {
      wpm: session.wpm,
      accuracy: session.accuracy,
      errorPatterns: [],
      speedTrends: [],
      recommendedFocus: ['Practice for consistent speed and accuracy'],
      aiRecommendations: ['Continue practicing to build muscle memory'],
    };
  }

  private getFallbackFeedback(input: FeedbackRequest): TutorFeedback {
    return {
      message: 'Keep practicing to improve your typing skills.',
      corrections: input.recentMistakes.map(mistake => ({
        actual: mistake.actual,
        expected: mistake.expected,
        suggestion: 'Type carefully and accurately',
      })),
      suggestions: ['Focus on accuracy first, then speed will follow'],
    };
  }
}