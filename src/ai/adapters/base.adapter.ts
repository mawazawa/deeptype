/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Interface: AI Adapter Base                                                                     ║
 * ║ Description: Base interface for AI model adapters (Gemini, GPT-4, etc.)                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  streamCallback?: (text: string) => void;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

export interface AIAdapter {
  /**
   * Initialize the AI adapter with configuration
   * @param config The AI model configuration
   */
  initialize(config: AIConfig): Promise<void>;

  /**
   * Generate content based on a prompt
   * @param prompt The input prompt
   * @returns The generated content
   */
  generateContent(prompt: string): Promise<string>;

  /**
   * Stream content generation
   * @param prompt The input prompt
   * @param onToken Callback for each token
   */
  streamContent(prompt: string, onToken: (token: string) => void): Promise<void>;

  /**
   * Get the model's configuration
   */
  getConfig(): AIConfig;

  /**
   * Get usage statistics
   */
  getUsage(): Promise<{
    tokensUsed: number;
    requestsMade: number;
    lastRequestTime: Date;
  }>;
}