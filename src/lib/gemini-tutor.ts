/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: Gemini Tutor                                                                           ║
 * ║ Description: Real-time AI tutoring using Gemini 2.0 Flash with multimodal capabilities        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getConfig } from './config';

interface TutorConfig {
  enableStreaming?: boolean;
  enableVoice?: boolean;
  enableScreenShare?: boolean;
  onStreamUpdate?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface TutorFeedback {
  feedback: string;
  corrections: Array<{
    mistake: string;
    suggestion: string;
    explanation: string;
  }>;
  nextSteps: string[];
  confidenceScore: number;
}

interface PerformanceMetrics {
  wpm: number;
  accuracy: number;
  consistency: number;
  problemAreas: string[];
  recentMistakes: Array<{ actual: string; expected: string }>;
}

// Add ImageCapture type definition
declare global {
  class ImageCapture {
    constructor(track: MediaStreamTrack);
    grabFrame(): Promise<ImageBitmap>;
  }
}

export class GeminiTutor {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: TutorConfig;
  private screenCapture: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor(config: TutorConfig = {}) {
    const { googleAiApiKey } = getConfig();
    this.genAI = new GoogleGenerativeAI(googleAiApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
    this.config = config;

    // Initialize screen capture if enabled
    if (config.enableScreenShare) {
      this.initializeScreenCapture();
    }
  }

  private async initializeScreenCapture() {
    try {
      this.screenCapture = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
        },
        audio: false,
      });

      this.mediaRecorder = new MediaRecorder(this.screenCapture, {
        mimeType: 'video/webm;codecs=vp9',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Capture every second
    } catch (error) {
      console.error('Failed to initialize screen capture:', error);
      this.config.onError?.(error as Error);
    }
  }

  private async getScreenshot(): Promise<string | null> {
    if (!this.screenCapture) return null;

    const videoTrack = this.screenCapture.getVideoTracks()[0];
    const imageCapture = new ImageCapture(videoTrack);

    try {
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const context = canvas.getContext('2d');
      if (!context) return null;

      context.drawImage(bitmap, 0, 0);
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return null;
    }
  }

  public async provideFeedback(
    currentText: string,
    targetText: string,
    metrics: PerformanceMetrics
  ): Promise<TutorFeedback> {
    try {
      const screenshot = this.config.enableScreenShare ? await this.getScreenshot() : null;

      const prompt = `
        As a typing tutor, analyze:
        Current text: "${currentText}"
        Target text: "${targetText}"

        Performance Metrics:
        - WPM: ${metrics.wpm}
        - Accuracy: ${metrics.accuracy}%
        - Consistency: ${metrics.consistency}%
        - Recent Mistakes: ${JSON.stringify(metrics.recentMistakes)}
        - Problem Areas: ${metrics.problemAreas.join(', ')}

        ${screenshot ? 'I am also providing a screenshot of the user\'s typing interface for context.' : ''}

        Please provide:
        1. Specific feedback on typing technique and errors
        2. Detailed corrections for recent mistakes
        3. Actionable next steps for improvement
        4. A confidence score for this assessment

        Format the response as a JSON object with the following structure:
        {
          "feedback": "main feedback message",
          "corrections": [{"mistake": "...", "suggestion": "...", "explanation": "..."}],
          "nextSteps": ["step1", "step2", "..."],
          "confidenceScore": 0.95
        }
      `;

      const result = await this.model.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              ...(screenshot ? [{ inlineData: { data: screenshot, mimeType: "image/jpeg" } }] : []),
            ],
          },
        ],
      });

      const response = await result.response;
      const text = response.text();

      // Stream the response if streaming is enabled
      if (this.config.enableStreaming && this.config.onStreamUpdate) {
        this.config.onStreamUpdate(text);
      }

      try {
        const parsedResponse = JSON.parse(text) as TutorFeedback;
        return parsedResponse;
      } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        return {
          feedback: text,
          corrections: [],
          nextSteps: [],
          confidenceScore: 0.5,
        };
      }
    } catch (error) {
      console.error('Error getting AI feedback:', error);
      this.config.onError?.(error as Error);
      return {
        feedback: "I'm having trouble analyzing your typing at the moment. Please continue practicing.",
        corrections: [],
        nextSteps: ["Focus on accuracy", "Maintain a steady rhythm"],
        confidenceScore: 0,
      };
    }
  }

  public async generateLesson(
    level: number,
    recentMistakes: Array<{ actual: string; expected: string }>,
    performanceHistory: Array<{ wpm: number; accuracy: number }>
  ): Promise<string> {
    try {
      const prompt = `
        Generate a typing lesson appropriate for:
        - Skill Level: ${level}/10
        - Recent Mistakes: ${JSON.stringify(recentMistakes)}
        - Performance History: ${JSON.stringify(performanceHistory)}

        Create a lesson that:
        1. Focuses on problem areas
        2. Gradually increases difficulty
        3. Includes common programming terms
        4. Maintains engagement

        The lesson should be 2-3 sentences long and include a mix of:
        - Common words
        - Problem characters
        - Programming concepts
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating lesson:', error);
      this.config.onError?.(error as Error);
      return "The quick brown fox jumps over the lazy dog. Practice makes perfect.";
    }
  }

  public cleanup() {
    if (this.screenCapture) {
      this.screenCapture.getTracks().forEach(track => track.stop());
      this.screenCapture = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }

    this.recordedChunks = [];
  }
}

// Export a singleton instance for global use
export const geminiTutor = new GeminiTutor({
  enableStreaming: true,
  enableScreenShare: true,
  enableVoice: true,
  onStreamUpdate: (text) => console.info('AI Stream Update:', text),
  onError: (error) => console.error('AI Error:', error),
});