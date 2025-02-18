/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: TypingTutor Page                                                                    ║
 * ║ Description: Main typing tutor page with real-time feedback and AI-powered tutoring           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAI } from '@/hooks/useAI';
import { useSupabase } from '@/hooks/useSupabase';
import { AccessibilityCore } from '@/lib/accessibility-core';
import VisualKeyboard from '@/components/VisualKeyboard';
import { useToast } from '@/components/ui/use-toast';
import { calculateWPM, calculateAccuracy } from '@/lib/ai-utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Spinner } from '@/components/ui/spinner';
import { geminiTutor } from '@/lib/gemini-tutor';

interface TypingStats {
  wpm: number;
  accuracy: number;
  mistakes: Array<{ actual: string; expected: string }>;
  timestamp: string;
}

const TypingTutor: React.FC = () => {
  // State management
  const [currentText, setCurrentText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [level, setLevel] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [nextKey, setNextKey] = useState<string | null>(null);
  const [stats, setStats] = useState<TypingStats[]>([]);
  const [mistakes, setMistakes] = useState<Array<{ actual: string; expected: string }>>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    corrections: Array<{ mistake: string; suggestion: string; explanation: string }>;
    nextSteps: string[];
  } | null>(null);
  const [problemAreas, setProblemAreas] = useState<string[]>([]);
  const [consistency, setConsistency] = useState(100);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const accessibilityRef = useRef<AccessibilityCore | null>(null);

  // Hooks
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const { generateLesson, getTutoring, analyzePatterns, isLoading } = useAI({
    enableStreaming: true,
    onStreamUpdate: (text) => {
      console.info('AI Stream Update:', text);
    },
  });

  // Initialize accessibility features
  useEffect(() => {
    if (!accessibilityRef.current) {
      accessibilityRef.current = new AccessibilityCore({
        speechRate: 1,
        voiceURI: '',
        volume: 1,
        pitch: 1,
        hapticFeedback: true,
        autoCorrect: true,
        errorTolerance: 3,
        commandDelay: 1000,
      });
    }

    return () => {
      if (accessibilityRef.current) {
        accessibilityRef.current.stopListening();
      }
    };
  }, []);

  // Load initial lesson
  useEffect(() => {
    const loadLesson = async () => {
      try {
        const lesson = await geminiTutor.generateLesson(
          level,
          mistakes,
          stats.map(s => ({ wpm: s.wpm, accuracy: s.accuracy }))
        );
        setTargetText(lesson);
        setNextKey(lesson[0]?.toLowerCase() || null);
      } catch (error) {
        console.error('Failed to load lesson:', error);
        toast({
          title: 'Error',
          description: 'Failed to load lesson. Please try again.',
          variant: 'destructive',
        });
      }
    };

    loadLesson();
  }, [level, mistakes, stats, toast]);

  // Calculate current statistics
  const currentStats = useCallback(() => {
    if (!startTime) return { wpm: 0, accuracy: 100 };

    const timeElapsed = (Date.now() - startTime) / 1000;
    const wpm = calculateWPM(currentText.length, timeElapsed);
    const accuracy = calculateAccuracy(mistakes, currentText.length);

    return { wpm, accuracy };
  }, [startTime, currentText.length, mistakes]);

  // Handle keyboard input
  const handleKeyDown = useCallback(async (e: KeyboardEvent) => {
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    setPressedKey(e.key);

    if (!startTime) {
      setStartTime(Date.now());
    }

    const expectedChar = targetText[currentText.length];
    if (e.key === expectedChar) {
      setCurrentText(prev => prev + e.key);
      setNextKey(targetText[currentText.length + 1]?.toLowerCase() || null);

      // Get real-time feedback every 5 characters
      if ((currentText.length + 1) % 5 === 0) {
        try {
          const { wpm, accuracy } = currentStats();
          const tutorFeedback = await geminiTutor.provideFeedback(
            currentText + e.key,
            targetText,
            {
              wpm,
              accuracy,
              consistency,
              problemAreas,
              recentMistakes: mistakes
            }
          );

          setFeedback({
            message: tutorFeedback.feedback,
            corrections: tutorFeedback.corrections,
            nextSteps: tutorFeedback.nextSteps
          });

          // Update problem areas based on AI analysis
          if (tutorFeedback.corrections.length > 0) {
            setProblemAreas(prev => [
              ...new Set([
                ...prev,
                ...tutorFeedback.corrections.map(c => c.mistake)
              ])
            ]);
          }
        } catch (error) {
          console.error('Error getting real-time feedback:', error);
        }
      }
    } else {
      setMistakes(prev => [...prev, { actual: e.key, expected: expectedChar }]);
      accessibilityRef.current?.provideFeedback('Incorrect key', { haptic: true });

      // Update consistency score
      setConsistency(prev => Math.max(0, prev - 2));
    }
  }, [isStarted, startTime, targetText, currentText, currentStats, mistakes, consistency, problemAreas]);

  const handleKeyUp = useCallback(() => {
    setPressedKey(null);
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Update stats when lesson is completed
  useEffect(() => {
    if (currentText.length === targetText.length && targetText.length > 0) {
      const { wpm, accuracy } = currentStats();
      setStats(prev => [...prev, {
        wpm,
        accuracy,
        mistakes,
        timestamp: new Date().toISOString()
      }]);

      // Save progress to Supabase
      const saveProgress = async () => {
        try {
          const { error } = await supabase
            .from('typing_progress')
            .insert([{
              wpm,
              accuracy,
              mistakes: JSON.stringify(mistakes),
              level,
              completed_at: new Date().toISOString()
            }]);

          if (error) throw error;

          // Get comprehensive feedback from Gemini
          const tutorFeedback = await geminiTutor.provideFeedback(
            currentText,
            targetText,
            {
              wpm,
              accuracy,
              consistency,
              problemAreas,
              recentMistakes: mistakes
            }
          );

          setFeedback({
            message: tutorFeedback.feedback,
            corrections: tutorFeedback.corrections,
            nextSteps: tutorFeedback.nextSteps
          });

          toast({
            title: 'Lesson Complete!',
            description: `WPM: ${wpm} | Accuracy: ${accuracy}%\n${tutorFeedback.feedback}`,
          });

          // Advance level if performance is good
          if (wpm >= 30 && accuracy >= 90 && tutorFeedback.confidenceScore > 0.8) {
            setLevel(prev => prev + 1);
          }
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      };

      saveProgress();
    }
  }, [currentText, targetText, currentStats, mistakes, level, stats, supabase, consistency, problemAreas]);

  // Cleanup Gemini tutor on unmount
  useEffect(() => {
    return () => {
      geminiTutor.cleanup();
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-background to-background/80">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">DeepType Tutor</CardTitle>
          <CardDescription>Level {level} - AI-Powered Typing Practice</CardDescription>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">WPM: {currentStats().wpm}</Badge>
            <Badge variant="outline">Accuracy: {currentStats().accuracy}%</Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Spinner size="lg" label="Loading lesson..." />
              </div>
            ) : (
              <>
                {/* Target Text Display */}
                <div className="relative rounded-lg bg-muted p-4 font-mono text-lg">
                  {targetText.split('').map((char, index) => (
                    <span
                      key={index}
                      className={`${
                        index < currentText.length
                          ? currentText[index] === targetText[index]
                            ? 'text-green-500'
                            : 'text-red-500'
                          : index === currentText.length
                          ? 'bg-primary/20 animate-pulse'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                {/* Progress Bar */}
                <Progress
                  value={(currentText.length / targetText.length) * 100}
                  className="h-2"
                />

                {/* Visual Keyboard */}
                <VisualKeyboard
                  pressedKey={pressedKey}
                  nextKey={nextKey}
                />

                {/* AI Feedback Panel */}
                {feedback && (
                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h3 className="text-lg font-semibold mb-2">AI Tutor Feedback</h3>
                    <p className="text-primary mb-4">{feedback.message}</p>

                    {feedback.corrections.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Corrections:</h4>
                        <ul className="space-y-2">
                          {feedback.corrections.map((correction, index) => (
                            <li key={index} className="text-sm">
                              <span className="text-destructive">{correction.mistake}</span>
                              {' → '}
                              <span className="text-green-500">{correction.suggestion}</span>
                              <p className="text-muted-foreground mt-1">{correction.explanation}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {feedback.nextSteps.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Next Steps:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {feedback.nextSteps.map((step, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentText('');
              setStartTime(null);
              setMistakes([]);
              inputRef.current?.focus();
            }}
          >
            Reset Lesson
          </Button>

          <Button
            variant="default"
            onClick={() => accessibilityRef.current?.startListening()}
          >
            Enable Voice Commands
          </Button>
        </CardFooter>
      </Card>

      {/* Performance Charts */}
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="wpm">
            <TabsList>
              <TabsTrigger value="wpm">WPM Over Time</TabsTrigger>
              <TabsTrigger value="accuracy">Accuracy Trends</TabsTrigger>
            </TabsList>
            <TabsContent value="wpm">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="accuracy">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TypingTutor;