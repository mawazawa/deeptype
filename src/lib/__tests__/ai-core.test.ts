/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: AI Core Tests                                                                          ║
 * ║ Description: Test suite for AI core functionality                                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AICore, AIConfig } from '../ai-core'
import { createClient } from '@supabase/supabase-js'
import { getConfig } from '../config'

// Mock external dependencies
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      select: vi.fn().mockResolvedValue({ data: [], error: null })
    }))
  }))
}))

vi.mock('../config', () => ({
  getConfig: vi.fn(() => ({
    openaiApiKey: 'test-openai-key',
    googleAiApiKey: 'test-gemini-key',
    aiModel: 'gemini-pro',
    aiTemperature: 0.7,
    aiMaxTokens: 2048,
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-anon-key',
    enableRealTimeAnalysis: true,
    enableVoiceCommands: true,
    enableHapticFeedback: true,
    enablePerformanceTracking: true,
    enableErrorTracking: true,
    analyticsSampleRate: 100
  }))
}))

describe('AICore', () => {
  let ai: AICore
  let supabase: ReturnType<typeof createClient>
  let config: AIConfig
  let streamCallback: (text: string) => void

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()

    // Initialize test dependencies
    streamCallback = vi.fn()
    supabase = createClient('https://test.supabase.co', 'test-anon-key')
    config = {
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 2048,
      streamCallback
    }

    // Initialize AI core
    ai = new AICore(supabase, config)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('generateLessonContent', () => {
    it('should generate lesson content with Gemini', async () => {
      const mockContent = 'Practice typing: The quick brown fox jumps over the lazy dog'
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => mockContent }
        })
      })

      const content = await ai.generateLessonContent(1, [], 'standard')
      expect(content).toBe(mockContent)
    })

    it('should handle streaming responses', async () => {
      const mockChunks = ['Practice ', 'typing: ', 'Hello ', 'World']
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContentStream: vi.fn().mockResolvedValue({
          stream: {
            async *[Symbol.asyncIterator]() {
              for (const chunk of mockChunks) {
                yield { text: () => chunk }
              }
            }
          }
        })
      })

      const content = await ai.generateLessonContent(1, [], 'standard')
      expect(content).toBe(mockChunks.join(''))
      expect(streamCallback).toHaveBeenCalledTimes(mockChunks.length)
    })

    it('should fall back to basic content on error', async () => {
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
      })

      const content = await ai.generateLessonContent(1, [], 'standard')
      expect(content).toContain('Practice typing home row keys')
    })
  })

  describe('provideTutoring', () => {
    const mockResponse = {
      feedback: 'Good progress!',
      nextLesson: 'Try capital letters next',
      adaptiveHints: ['Focus on finger placement'],
      confidenceScore: 0.8
    }

    it('should provide tutoring feedback', async () => {
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => JSON.stringify(mockResponse) }
        })
      })

      const response = await ai.provideTutoring('hello', 'hello world', [], 1)
      expect(response).toEqual(mockResponse)
    })

    it('should handle streaming tutoring responses', async () => {
      const mockChunks = [
        '{"feedback": "Good',
        ' progress!",',
        '"confidenceScore": 0.8}'
      ]
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContentStream: vi.fn().mockResolvedValue({
          stream: {
            async *[Symbol.asyncIterator]() {
              for (const chunk of mockChunks) {
                yield { text: () => chunk }
              }
            }
          }
        })
      })

      const response = await ai.provideTutoring('hello', 'hello world', [], 1)
      expect(response).toHaveProperty('feedback', 'Good progress!')
      expect(response).toHaveProperty('confidenceScore', 0.8)
      expect(streamCallback).toHaveBeenCalledTimes(mockChunks.length)
    })

    it('should handle errors gracefully', async () => {
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
      })

      const response = await ai.provideTutoring('hello', 'hello world', [], 1)
      expect(response).toHaveProperty('feedback')
      expect(response.confidenceScore).toBe(0.5)
    })
  })

  describe('analyzeTypingPatterns', () => {
    const mockAnalysis = {
      errorPatterns: [
        {
          pattern: 'th -> ht',
          frequency: 3,
          suggestion: 'Practice "th" digraph'
        }
      ],
      speedTrends: [
        {
          timestamp: '2024-01-01T00:00:00Z',
          wpm: 45
        }
      ],
      recommendedFocus: ['Accuracy', 'Speed']
    }

    it('should analyze typing patterns', async () => {
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => JSON.stringify(mockAnalysis) }
        })
      })

      const analysis = await ai.analyzeTypingPatterns([], [45])
      expect(analysis).toEqual(mockAnalysis)
    })

    it('should store analysis in Supabase when tracking is enabled', async () => {
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => JSON.stringify(mockAnalysis) }
        })
      })

      await ai.analyzeTypingPatterns([], [45])
      expect(supabase.from).toHaveBeenCalledWith('typing_analysis')
      expect(supabase.from('typing_analysis').insert).toHaveBeenCalled()
    })

    it('should handle analysis errors gracefully', async () => {
      vi.spyOn(ai as any, 'geminiModel').mockImplementation({
        generateContent: vi.fn().mockRejectedValue(new Error('API Error'))
      })

      const analysis = await ai.analyzeTypingPatterns([], [45])
      expect(analysis.errorPatterns).toHaveLength(0)
      expect(analysis.recommendedFocus).toHaveLength(1)
    })
  })
})