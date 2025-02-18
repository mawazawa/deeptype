/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: Configuration                                                                          ║
 * ║ Description: Environment configuration loader and validator for DeepType                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { z } from 'zod';

// Configuration schema for type-safe environment variables
const configSchema = z.object({
  // AI Configuration
  openaiApiKey: z.string().min(1, 'OpenAI API key is required'),
  googleAiApiKey: z.string().min(1, 'Google AI API key is required'),
  aiModel: z.enum(['gpt-4', 'gpt-3.5-turbo', 'gemini-pro', 'gemini-2.0-flash']),
  aiTemperature: z.number().min(0).max(1),
  aiMaxTokens: z.number().positive(),

  // Supabase Configuration
  supabaseUrl: z.string().url('Invalid Supabase URL'),
  supabaseAnonKey: z.string().min(1, 'Supabase anonymous key is required'),

  // Feature Flags
  enableVoiceCommands: z.boolean(),
  enableHapticFeedback: z.boolean(),
  enableRealTimeAnalysis: z.boolean(),

  // Analytics Configuration
  enablePerformanceTracking: z.boolean(),
  enableErrorTracking: z.boolean(),
  analyticsSampleRate: z.number().min(0).max(100),
});

// Type inference from schema
export type Config = z.infer<typeof configSchema>;

// Configuration loader with validation
export function loadConfig(): Config {
  try {
    // Load and validate configuration
    const config = configSchema.parse({
      openaiApiKey: process.env.OPENAI_API_KEY,
      googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
      aiModel: process.env.AI_MODEL || 'gemini-pro',
      aiTemperature: Number(process.env.AI_TEMPERATURE || 0.7),
      aiMaxTokens: Number(process.env.AI_MAX_TOKENS || 2048),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      enableVoiceCommands: process.env.ENABLE_VOICE_COMMANDS === 'true',
      enableHapticFeedback: process.env.ENABLE_HAPTIC_FEEDBACK === 'true',
      enableRealTimeAnalysis: process.env.ENABLE_REAL_TIME_ANALYSIS === 'true',
      enablePerformanceTracking: process.env.ENABLE_PERFORMANCE_TRACKING === 'true',
      enableErrorTracking: process.env.ENABLE_ERROR_TRACKING === 'true',
      analyticsSampleRate: Number(process.env.ANALYTICS_SAMPLE_RATE || 100),
    });

    // Log configuration for debugging (excluding sensitive values)
    console.info('Configuration loaded:', {
      aiModel: config.aiModel,
      aiTemperature: config.aiTemperature,
      aiMaxTokens: config.aiMaxTokens,
      enableVoiceCommands: config.enableVoiceCommands,
      enableHapticFeedback: config.enableHapticFeedback,
      enableRealTimeAnalysis: config.enableRealTimeAnalysis,
      enablePerformanceTracking: config.enablePerformanceTracking,
      enableErrorTracking: config.enableErrorTracking,
      analyticsSampleRate: config.analyticsSampleRate,
    });

    return config;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw new Error('Failed to load configuration. Check your environment variables.');
  }
}

// Singleton instance for configuration
let config: Config | null = null;

// Get configuration, initializing if necessary
export function getConfig(): Config {
  if (!config) {
    config = loadConfig();
  }
  return config;
}

// Reset configuration (useful for testing)
export function resetConfig(): void {
  config = null;
}

// Validate specific configuration subset
export function validateConfig<T extends Partial<Config>>(
  partialConfig: T,
  schema: z.ZodType<T>
): T {
  return schema.parse(partialConfig);
}