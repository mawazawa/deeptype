/*
 * ██████╗ ███████╗███╗   ███╗██╗███╗   ██╗██╗     ██████╗██╗     ██╗███████╗███╗   ██╗████████╗
 * ██╔════╝ ██╔════╝████╗ ████║██║████╗  ██║██║    ██╔════╝██║     ██║██╔════╝████╗  ██║╚══██╔══╝
 * ██║  ███╗█████╗  ██╔████╔██║██║██╔██╗ ██║██║    ██║     ██║     ██║█████╗  ██╔██╗ ██║   ██║
 * ██║   ██║██╔══╝  ██║╚██╔╝██║██║██║╚██╗██║██║    ██║     ██║     ██║██╔══╝  ██║╚██╗██║   ██║
 * ╚██████╔╝███████╗██║ ╚═╝ ██║██║██║ ╚████║██║    ╚██████╗███████╗██║███████╗██║ ╚████║   ██║
 *  ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝     ╚═════╝╚══════╝╚═╝╚══════╝╚═╝  ╚═══╝   ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Client: Gemini AI Client                                                                       ║
 * ║ Description: Implementation of the Gemini AI client for real-time typing feedback              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";
import { TutorResponse, TutorFeedback, TutorInsights, TutorMetrics } from "@/types/tutor";
import { UserProfile, TypingMetrics, Analysis } from "@/types/typing";

interface GeminiTutorConfig {
  apiKey: string;
  options?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
  };
}

interface TutorContext {
  userProfile: UserProfile;
  currentMetrics: TypingMetrics;
  recentAnalysis?: Analysis;
}

export class GeminiTutor {
  private model: GenerativeModel;
  private config: GenerationConfig;

  constructor(config: GeminiTutorConfig) {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.config = {
      temperature: config.options?.temperature ?? 0.7,
      topK: config.options?.topK ?? 40,
      topP: config.options?.topP ?? 0.95,
      maxOutputTokens: config.options?.maxOutputTokens ?? 1024,
    };
  }

  /**
   * Constructs the prompt for the Gemini model
   */
  private constructPrompt(
    currentText: string,
    targetText: string,
    context: TutorContext
  ): string {
    return `
      As a typing tutor, analyze the following typing attempt:

      Target Text: "${targetText}"
      Current Text: "${currentText}"

      User Context:
      - Level: ${context.userProfile.level}
      - Current WPM: ${context.currentMetrics.wpm}
      - Focus Areas: ${context.userProfile.focusAreas.join(", ")}
      ${
        context.recentAnalysis
          ? `- Recent Analysis: ${JSON.stringify(context.recentAnalysis)}`
          : ""
      }

      Provide detailed feedback including:
      1. Analysis of errors and patterns
      2. Specific corrections with context
      3. Personalized recommendations
      4. Performance metrics
      5. Encouragement and next steps

      Format the response as a JSON object with the following structure:
      {
        "feedback": {
          "message": string,
          "encouragement": string,
          "corrections": Array<{ error: string, suggestion: string, severity: "low" | "medium" | "high" }>,
          "focusArea": string
        },
        "insights": {
          "recommendations": string[],
          "patterns": {
            "strengths": string[],
            "weaknesses": string[]
          },
          "nextSteps": string[]
        },
        "metrics": {
          "confidence": number,
          "improvement": number,
          "focusAreas": string[],
          "accuracy": number,
          "speed": number,
          "consistency": number
        }
      }
    `;
  }

  /**
   * Parses the Gemini response into a structured TutorResponse
   */
  private parseResponse(response: string): TutorResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        ...parsed,
        timestamp: Date.now(),
        sessionId: Math.random().toString(36).substring(7),
      };
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      throw new Error("Failed to parse tutor response");
    }
  }

  /**
   * Gets one-time feedback for the current typing attempt
   */
  async getFeedback(
    currentText: string,
    targetText: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    try {
      const prompt = this.constructPrompt(currentText, targetText, context);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      return this.parseResponse(text);
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  /**
   * Streams real-time feedback as the user types
   */
  async *streamFeedback(
    currentText: string,
    targetText: string,
    context: TutorContext
  ): AsyncGenerator<TutorResponse> {
    try {
      const prompt = this.constructPrompt(currentText, targetText, context);
      const result = await this.model.generateContentStream(prompt);

      let accumulatedText = "";

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          accumulatedText += text;
          try {
            // Try to parse the accumulated text as JSON
            const response = this.parseResponse(accumulatedText);
            yield response;
          } catch {
            // If parsing fails, continue accumulating text
            continue;
          }
        }
      }
    } catch (error) {
      console.error("Gemini streaming error:", error);
      throw error;
    }
  }
}
