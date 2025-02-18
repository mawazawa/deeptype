import { Configuration, OpenAIApi } from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AIConfig {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'gemini-pro';
  temperature: number;
  maxTokens: number;
}

export class AICore {
  private openai: OpenAIApi;
  private supabase: SupabaseClient;

  constructor(
    openaiApiKey: string,
    supabase: SupabaseClient,
    private config: AIConfig
  ) {
    this.openai = new OpenAIApi(new Configuration({ apiKey: openaiApiKey }));
    this.supabase = supabase;
  }

  async generateLessonContent(
    userLevel: number,
    previousMistakes: string[],
    learningStyle: string
  ): Promise<string> {
    // Implement adaptive lesson generation
    const prompt = `Generate a typing lesson for a user at level ${userLevel}...`;

    // Log for analysis
    console.info('Generating lesson content:', {
      level: userLevel,
      mistakes: previousMistakes,
      style: learningStyle
    });

    const response = await this.openai.createChatCompletion({
      model: this.config.model as 'gpt-4' | 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return response.data.choices[0].message?.content || '';
  }

  // Add more AI-powered features here
}