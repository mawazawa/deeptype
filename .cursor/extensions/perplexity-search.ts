/*
 * ██████╗ ███████╗██████╗ ██████╗ ██╗     ███████╗██╗  ██╗██╗████████╗██╗   ██╗
 * ██╔══██╗██╔════╝██╔══██╗██╔══██╗██║     ██╔════╝╚██╗██╔╝██║╚══██╔══╝╚██╗ ██╔╝
 * ██████╔╝█████╗  ██████╔╝██████╔╝██║     █████╗   ╚███╔╝ ██║   ██║    ╚████╔╝
 * ██╔═══╝ ██╔══╝  ██╔══██╗██╔═══╝ ██║     ██╔══╝   ██╔██╗ ██║   ██║     ╚██╔╝
 * ██║     ███████╗██║  ██║██║     ███████╗███████╗██╔╝ ██╗██║   ██║      ██║
 * ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝
 */

/**
 * @fileoverview Perplexity API integration for Cursor's composer
 * This module enhances Cursor's search functionality by integrating
 * Perplexity's API for more contextual and intelligent search results.
 */

import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

interface PerplexityConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface SearchContext {
  codebase: string;
  currentFile?: string;
  selection?: string;
  recentFiles?: string[];
  language?: string;
}

interface SearchResult {
  content: string;
  relevance: number;
  source?: string;
  context?: string;
}

export class PerplexitySearch {
  private client: OpenAI;
  private config: PerplexityConfig;

  constructor(config: PerplexityConfig) {
    this.config = {
      model: "sonar-pro",
      maxTokens: 1000,
      temperature: 0.3,
      ...config,
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: "https://api.perplexity.ai",
    });
  }

  async enhanceComposerSearch(
    query: string,
    context: SearchContext
  ): Promise<SearchResult[]> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are a code-aware AI assistant helping with the following codebase context:
            Project: ${context.codebase}
            Current File: ${context.currentFile || "N/A"}
            Language: ${context.language || "Unknown"}
            Recent Files: ${context.recentFiles?.join(", ") || "None"}

            Provide relevant code suggestions, documentation, and explanations.`,
        },
        {
          role: "user",
          content: `Search Query: ${query}
            ${context.selection ? `Selected Code: ${context.selection}` : ""}`,
        },
      ];

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stream: true,
      });

      const results: SearchResult[] = [];

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          results.push({
            content,
            relevance: 1,
            context: "Perplexity API Response",
            source: "perplexity-api",
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Perplexity search error:", error);
      return [
        {
          content: `Error: ${error.message}`,
          relevance: 0,
          context: "Error",
          source: "error",
        },
      ];
    }
  }

  async searchCodebase(
    query: string,
    files: string[]
  ): Promise<SearchResult[]> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are a code search expert. Analyze the following files and provide relevant matches for the query:
            Files: ${files.join(", ")}`,
        },
        {
          role: "user",
          content: query,
        },
      ];

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      return [
        {
          content: response.choices[0]?.message?.content || "",
          relevance: 1,
          context: "Code Search",
          source: "perplexity-api",
        },
      ];
    } catch (error) {
      console.error("Codebase search error:", error);
      return [
        {
          content: `Error: ${error.message}`,
          relevance: 0,
          context: "Error",
          source: "error",
        },
      ];
    }
  }
}

// Export a function to initialize the Perplexity search integration
export function initializePerplexitySearch(
  config: PerplexityConfig
): PerplexitySearch {
  return new PerplexitySearch(config);
}
