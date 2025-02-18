/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: AI Core                                                                                ║
 * ║ Description: Core AI module providing real-time tutoring capabilities using Gemini 2.0 Flash   ║
 * ║              and OpenAI, with streaming responses and adaptive learning features.              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerateContentResult,
  GenerateContentStreamResult
} from '@google/generative-ai';
import { getConfig, Config } from './config';

export interface AIConfig {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro' | 'gemini-2.0-flash';
  temperature: number;
  maxTokens: number;
  streamCallback?: (text: string) => void;
}

export interface TutorResponse {
  feedback: string;
  nextLesson?: string;
  adaptiveHints?: string[];
  confidenceScore?: number;
}

export interface TypingAnalysis {
  errorPatterns: Array<{
    pattern: string;
    frequency: number;
    suggestion: string;
  }>;
  speedTrends: Array<{
    timestamp: string;
    wpm: number;
  }>;
  recommendedFocus: string[];
}

export class AICore {
  private openai: OpenAI;
  private genAI: GoogleGenerativeAI;
  private geminiModel: GenerativeModel;
  private supabase: SupabaseClient;
  private config: Config;
  private aiConfig: AIConfig;

  constructor(supabase: SupabaseClient, aiConfig: AIConfig) {
    this.config = getConfig();
    this.aiConfig = aiConfig;
    this.openai = new OpenAI({ apiKey: this.config.openaiApiKey });
    this.genAI = new GoogleGenerativeAI(this.config.googleAiApiKey);
    this.geminiModel = this.genAI.getGenerativeModel({
      model: aiConfig.model.startsWith('gemini') ? aiConfig.model : 'gemini-pro'
    });
    this.supabase = supabase;

    // Log initialization for debugging
    console.info('Initializing AI Core with config:', {
      model: aiConfig.model,
      temperature: aiConfig.temperature,
      maxTokens: aiConfig.maxTokens,
      hasStreamCallback: !!aiConfig.streamCallback,
      enableRealTimeAnalysis: this.config.enableRealTimeAnalysis,
      enableVoiceCommands: this.config.enableVoiceCommands
    });
  }

  async generateLessonContent(
    userLevel: number,
    previousMistakes: string[],
    learningStyle: string
  ): Promise<string> {
    if (!this.config.enableRealTimeAnalysis) {
      console.warn('Real-time analysis is disabled. Using fallback content generation.');
      return this.generateFallbackContent(userLevel);
    }

    console.info('Generating adaptive lesson content:', {
      level: userLevel,
      mistakeCount: previousMistakes.length,
      style: learningStyle
    });

    try {
      if (this.config.aiModel.startsWith('gemini')) {
        const prompt = `Generate a typing lesson for a user at level ${userLevel}.
                       Previous mistakes: ${previousMistakes.join(', ')}.
                       Learning style: ${learningStyle}`;

        if (this.aiConfig.streamCallback) {
          const streamResult = await this.geminiModel.generateContentStream(prompt);
          let fullContent = '';

          for await (const chunk of streamResult.stream) {
            const chunkText = chunk.text();
            fullContent += chunkText;
            this.aiConfig.streamCallback(chunkText);
          }

          return fullContent;
        } else {
          const result = await this.geminiModel.generateContent(prompt);
          return result.response.text();
        }
      } else {
        const response = await this.openai.chat.completions.create({
          model: this.config.aiModel,
          messages: [
            {
              role: 'system',
              content: 'You are an expert typing tutor focused on accessibility.'
            },
            {
              role: 'user',
              content: `Generate a typing lesson for a user at level ${userLevel}.
                       Previous mistakes: ${previousMistakes.join(', ')}.
                       Learning style: ${learningStyle}`
            }
          ],
          temperature: this.config.aiTemperature,
          max_tokens: this.config.aiMaxTokens,
          stream: !!this.aiConfig.streamCallback
        });

        if (this.aiConfig.streamCallback && response.hasOwnProperty('on')) {
          const stream = response as any;
          let fullContent = '';

          await new Promise((resolve, reject) => {
            stream.on('data', (chunk: any) => {
              const content = chunk.choices[0]?.delta?.content || '';
              fullContent += content;
              this.aiConfig.streamCallback?.(content);
            });

            stream.on('end', resolve);
            stream.on('error', reject);
          });

          return fullContent;
        } else {
          return (response as OpenAI.Chat.Completions.ChatCompletion).choices[0]?.message?.content || '';
        }
      }
    } catch (error) {
      console.error('Error generating lesson content:', error);
      return this.generateFallbackContent(userLevel);
    }
  }

  private generateFallbackContent(userLevel: number): string {
    const basicLessons = [
      'Practice typing home row keys: asdf jkl;',
      'Type common words: the, and, that, have',
      'Practice numbers and symbols: 1234567890',
      'Focus on capital letters and punctuation',
      'Type complete sentences with proper form'
    ];

    return basicLessons[Math.min(userLevel - 1, basicLessons.length - 1)];
  }

  async provideTutoring(
    currentText: string,
    targetText: string,
    recentMistakes: Array<{ actual: string; expected: string }>,
    userLevel: number
  ): Promise<TutorResponse> {
    if (!this.config.enableRealTimeAnalysis) {
      return {
        feedback: 'Real-time analysis is currently disabled.',
        confidenceScore: 0.5
      };
    }

    console.info('Providing real-time tutoring feedback:', {
      textLength: currentText.length,
      targetLength: targetText.length,
      mistakeCount: recentMistakes.length,
      level: userLevel
    });

    try {
      const prompt = `As a typing tutor, analyze:
                     Current text: "${currentText}"
                     Target text: "${targetText}"
                     Recent mistakes: ${JSON.stringify(recentMistakes)}
                     User level: ${userLevel}

                     Provide feedback in JSON format with:
                     - feedback: Main feedback message
                     - nextLesson: Suggested next lesson content
                     - adaptiveHints: Array of specific hints
                     - confidenceScore: Number between 0-1`;

      if (this.aiConfig.streamCallback) {
        const result = await this.geminiModel.generateContentStream(prompt);
        let fullResponse = '';

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          this.aiConfig.streamCallback(chunkText);
        }

        return JSON.parse(fullResponse);
      } else {
        const result = await this.geminiModel.generateContent(prompt);
        return JSON.parse(result.response.text());
      }
    } catch (error) {
      console.error('Error providing tutoring:', error);
      return {
        feedback: "I'm having trouble analyzing your typing. Let's continue with the current lesson.",
        confidenceScore: 0.5
      };
    }
  }

  async analyzeTypingPatterns(
    recentMistakes: Array<{ actual: string; expected: string }>,
    speedHistory: number[]
  ): Promise<TypingAnalysis> {
    if (!this.config.enableRealTimeAnalysis) {
      return {
        errorPatterns: [],
        speedTrends: [],
        recommendedFocus: ['Real-time analysis is currently disabled.']
      };
    }

    console.info('Analyzing typing patterns:', {
      mistakeCount: recentMistakes.length,
      speedDataPoints: speedHistory.length
    });

    try {
      const prompt = `Analyze typing patterns:
                     Mistakes: ${JSON.stringify(recentMistakes)}
                     Speed history (WPM): ${speedHistory.join(', ')}

                     Provide analysis in JSON format with:
                     - errorPatterns: Array of {pattern, frequency, suggestion}
                     - speedTrends: Array of {timestamp, wpm}
                     - recommendedFocus: Array of focus areas`;

      const result = await this.geminiModel.generateContent(prompt);
      const analysis: TypingAnalysis = JSON.parse(result.response.text());

      // Store analysis in Supabase for long-term pattern recognition
      if (this.config.enablePerformanceTracking) {
        await this.supabase
          .from('typing_analysis')
          .insert([{
            error_patterns: analysis.errorPatterns,
            speed_trends: analysis.speedTrends,
            recommended_focus: analysis.recommendedFocus,
            created_at: new Date().toISOString()
          }]);
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing typing patterns:', error);
      return {
        errorPatterns: [],
        speedTrends: [],
        recommendedFocus: ['Focus on accuracy and consistent speed']
      };
    }
  }

  // Utility method to update AI configuration
  updateConfig(newConfig: Partial<AIConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.info('Updated AI configuration:', {
      aiModel: this.config.aiModel,
      aiTemperature: this.config.aiTemperature,
      aiMaxTokens: this.config.aiMaxTokens,
      enableRealTimeAnalysis: this.config.enableRealTimeAnalysis
    });
  }
}