/*
 * ██████╗ ███████╗██████╗ ██████╗ ██╗     ███████╗██╗  ██╗██╗████████╗██╗   ██╗
 * ██╔══██╗██╔════╝██╔══██╗██╔══██╗██║     ██╔════╝╚██╗██╔╝██║╚══██╔══╝╚██╗ ██╔╝
 * ██████╔╝█████╗  ██████╔╝██████╔╝██║     █████╗   ╚███╔╝ ██║   ██║    ╚████╔╝
 * ██╔═══╝ ██╔══╝  ██╔══██╗██╔═══╝ ██║     ██╔══╝   ██╔██╗ ██║   ██║     ╚██╔╝
 * ██║     ███████╗██║  ██║██║     ███████╗███████╗██╔╝ ██╗██║   ██║      ██║
 * ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Library: Perplexity AI Client                                                                  ║
 * ║ Description: Client for interacting with Perplexity's AI API                                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { OpenAI } from "openai";

interface PerplexityOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

interface PerplexityConfig {
  apiKey: string;
  options?: PerplexityOptions;
}

interface QueryContext {
  project?: string;
  framework?: string;
  libraries?: string[];
  userContext?: Record<string, unknown>;
}

interface QueryRequest {
  query: string;
  context?: QueryContext;
}

interface QueryResult {
  title: string;
  snippet: string;
  url?: string;
  type?: string;
  confidence?: number;
}

interface QueryResponse {
  results: QueryResult[];
  metadata?: {
    processingTime: number;
    modelUsed: string;
    tokensUsed: number;
  };
}

export class PerplexityAI {
  private client: OpenAI;
  private options: Required<PerplexityOptions>;

  constructor(config: PerplexityConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: "https://api.perplexity.ai",
    });

    this.options = {
      temperature: config.options?.temperature ?? 0.3,
      maxTokens: config.options?.maxTokens ?? 1000,
      model: config.options?.model ?? "sonar-pro",
    };
  }

  async query(request: QueryRequest): Promise<QueryResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.chat.completions.create({
        model: this.options.model,
        messages: this.constructMessages(request),
        max_tokens: this.options.maxTokens,
        temperature: this.options.temperature,
      });

      const results = this.parseResults(response);

      return {
        results,
        metadata: {
          processingTime: Date.now() - startTime,
          modelUsed: this.options.model,
          tokensUsed: response.usage?.total_tokens ?? 0,
        },
      };
    } catch (error) {
      console.error("Perplexity API error:", error);
      throw new Error("Failed to query Perplexity API");
    }
  }

  private constructMessages(request: QueryRequest): Array<{
    role: "system" | "user";
    content: string;
  }> {
    const contextStr = request.context
      ? JSON.stringify(request.context, null, 2)
      : "";

    return [
      {
        role: "system",
        content: `You are a helpful AI assistant with expertise in typing and programming.
          Context: ${contextStr}`,
      },
      {
        role: "user",
        content: request.query,
      },
    ];
  }

  private parseResults(
    response: OpenAI.Chat.Completions.ChatCompletion
  ): QueryResult[] {
    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    try {
      // Attempt to parse structured results
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          title: item.title ?? "Untitled",
          snippet: item.snippet ?? item.content ?? "",
          url: item.url,
          type: item.type ?? "general",
          confidence: item.confidence ?? 0.5,
        }));
      }
    } catch (e) {
      // If parsing fails, create a single result from the raw content
      return [
        {
          title: "AI Response",
          snippet: content,
          type: "general",
          confidence: 0.5,
        },
      ];
    }

    return [];
  }
}
