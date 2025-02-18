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
 * ║ Description: Implementation of the Gemini 2.0 AI client for real-time typing feedback         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerationConfig,
  HarmCategory,
  HarmBlockThreshold,
  EnhancedGenerateContentResponse,
  GenerateContentStreamResult,
  Tool,
  FunctionDeclaration,
  SchemaType,
} from "@google/generative-ai";
import {
  TutorResponse,
  TutorFeedback,
  TutorInsights,
  TutorMetrics,
} from "@/types/tutor";
import { UserProfile, TypingMetrics, Analysis } from "@/types/typing";

interface GeminiTutorConfig {
  apiKey: string;
  options?: {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
    stopSequences?: string[];
  };
}

interface TutorContext {
  userProfile: UserProfile;
  currentMetrics: TypingMetrics;
  recentAnalysis?: Analysis;
  screenshot?: string; // Base64 encoded screenshot for visual analysis
}

interface GeminiFunctionCall {
  name: string;
  args: string;
}

interface GeminiResponse {
  functionCalls?: GeminiFunctionCall[];
  text: () => string;
}

export class GeminiTutor {
  private model: GenerativeModel;
  private config: GenerationConfig;
  private safetySettings: Array<{
    category: HarmCategory;
    threshold: HarmBlockThreshold;
  }>;

  constructor(config: GeminiTutorConfig) {
    const genAI = new GoogleGenerativeAI(config.apiKey);

    // Initialize with Gemini-Pro model
    this.model = genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: this.initSafetySettings(),
    });

    // Enhanced configuration for Gemini 2.0
    this.config = {
      temperature: config.options?.temperature ?? 0.7,
      topK: config.options?.topK ?? 40,
      topP: config.options?.topP ?? 0.95,
      maxOutputTokens: config.options?.maxOutputTokens ?? 1024,
      candidateCount: config.options?.candidateCount ?? 1,
      stopSequences: config.options?.stopSequences ?? [],
    };

    // Initialize safety settings
    this.safetySettings = this.initSafetySettings();
  }

  /**
   * Initialize safety settings for Gemini 2.0
   */
  private initSafetySettings() {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  /**
   * Define function calling schema for structured responses
   */
  private getFunctionSchema(): FunctionDeclaration {
    return {
      name: "provideTutorFeedback",
      description: "Provide structured feedback for typing practice",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          feedback: {
            type: SchemaType.OBJECT,
            properties: {
              message: { type: SchemaType.STRING },
              encouragement: { type: SchemaType.STRING },
              corrections: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    error: { type: SchemaType.STRING },
                    suggestion: { type: SchemaType.STRING },
                    severity: {
                      type: SchemaType.STRING,
                      enum: ["low", "medium", "high"],
                    },
                  },
                },
              },
              focusArea: { type: SchemaType.STRING },
            },
          },
          insights: {
            type: SchemaType.OBJECT,
            properties: {
              recommendations: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
              patterns: {
                type: SchemaType.OBJECT,
                properties: {
                  strengths: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                  },
                  weaknesses: {
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING },
                  },
                },
              },
              nextSteps: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
            },
          },
          metrics: {
            type: SchemaType.OBJECT,
            properties: {
              confidence: { type: SchemaType.NUMBER },
              improvement: { type: SchemaType.NUMBER },
              focusAreas: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING },
              },
              accuracy: { type: SchemaType.NUMBER },
              speed: { type: SchemaType.NUMBER },
              consistency: { type: SchemaType.NUMBER },
            },
          },
        },
      },
    };
  }

  /**
   * Constructs the prompt for the Gemini model with enhanced context
   */
  private constructPrompt(
    currentText: string,
    targetText: string,
    context: TutorContext
  ): string {
    const prompt = `
      As an expert typing tutor, analyze the following typing attempt and provide detailed feedback:

      Target Text: "${targetText}"
      Current Text: "${currentText}"

      User Context:
      - Level: ${context.userProfile.level}
      - Current WPM: ${context.currentMetrics.wpm}
      - Focus Areas: ${context.userProfile.focusAreas.join(", ")}
      ${
        context.recentAnalysis
          ? `- Recent Analysis: ${JSON.stringify(context.recentAnalysis, null, 2)}`
          : ""
      }

      Provide comprehensive feedback including:
      1. Detailed error analysis and patterns
      2. Specific corrections with context
      3. Personalized recommendations based on user level and history
      4. Performance metrics with improvement tracking
      5. Encouraging feedback and next steps
      6. Visual pattern analysis (if screenshot provided)

      Use the provideTutorFeedback function to structure your response.
    `;

    return prompt;
  }

  /**
   * Gets one-time feedback with enhanced error handling and retries
   */
  async getFeedback(
    currentText: string,
    targetText: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const prompt = this.constructPrompt(currentText, targetText, context);

        const result = await this.model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: this.config,
          safetySettings: this.safetySettings,
          tools: this.getTools(),
        });

        const response = result.response as unknown as GeminiResponse;

        if (response.functionCalls && response.functionCalls.length > 0) {
          const functionCall = response.functionCalls[0];
          if (functionCall.name === "provideTutorFeedback") {
            const parsedArgs = JSON.parse(functionCall.args);
            return {
              ...parsedArgs,
              timestamp: Date.now(),
              sessionId: Math.random().toString(36).substring(7),
            };
          }
        }

        const text = response.text();
        if (!text) {
          throw new Error("Empty response from Gemini");
        }

        return this.parseResponse(text);
      } catch (error) {
        attempt++;
        if (attempt === maxRetries) {
          console.error("Gemini API error after retries:", error);
          throw error;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    throw new Error("Failed to get feedback after retries");
  }

  /**
   * Streams real-time feedback with enhanced error handling
   */
  async *streamFeedback(
    currentText: string,
    targetText: string,
    context: TutorContext
  ): AsyncGenerator<TutorResponse> {
    try {
      const prompt = this.constructPrompt(currentText, targetText, context);

      const result = await this.model.generateContentStream({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: this.config,
        safetySettings: this.safetySettings,
        tools: this.getTools(),
      });

      let accumulatedText = "";

      for await (const chunk of result.stream) {
        const chunkResponse = chunk as unknown as GeminiResponse;
        const text = chunkResponse.text();
        if (text) {
          accumulatedText += text;
          try {
            if (
              chunkResponse.functionCalls &&
              chunkResponse.functionCalls.length > 0
            ) {
              const functionCall = chunkResponse.functionCalls[0];
              if (functionCall.name === "provideTutorFeedback") {
                const parsedArgs = JSON.parse(functionCall.args);
                yield {
                  ...parsedArgs,
                  timestamp: Date.now(),
                  sessionId: Math.random().toString(36).substring(7),
                };
                continue;
              }
            }

            const response = this.parseResponse(accumulatedText);
            yield response;
          } catch {
            continue;
          }
        }
      }
    } catch (error) {
      console.error("Gemini streaming error:", error);
      throw error;
    }
  }

  /**
   * Parses the Gemini response with enhanced error handling
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

  private getTools(): Tool[] {
    return [
      {
        functionDeclarations: [this.getFunctionSchema()],
      },
    ];
  }
}
