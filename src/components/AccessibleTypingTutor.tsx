import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Volume2, VolumeX, Trophy } from "lucide-react";
import VisualKeyboard from "./VisualKeyboard";
import PerformanceChart from "./PerformanceChart";
import { analyzeTypingPatterns, generateAdaptiveLessons, type TypingAnalysis } from "@/utils/typingAnalytics";

const LESSON_SETS = {
  beginner: [
    "Hello world!",
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect.",
    "Type with confidence and accuracy.",
    "Keep your fingers on the home row keys.",
  ],
  intermediate: [
    "JavaScript is a popular programming language.",
    "React helps build interactive user interfaces.",
    "Programming requires attention to detail.",
    "Learning to type faster improves productivity.",
    "Good developers write clean, readable code.",
  ],
  advanced: [
    "The function takes a callback as an argument and executes it asynchronously.",
    "Object-oriented programming emphasizes code reusability and maintainability.",
    "TypeScript adds static typing to JavaScript for better development experience.",
    "Version control systems help teams collaborate on code effectively.",
    "Regular expressions are powerful tools for pattern matching in strings.",
  ],
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface TypingHistory {
  id: string;
  user_id: string;
  created_at: string;
  words_per_minute: number;
  accuracy_percentage: number;
  lesson_level: string;
}

const AccessibleTypingTutor = () => {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("Press any key to begin");
  const [isListening, setIsListening] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTutorEnabled, setIsTutorEnabled] = useState(true);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [lessonIndex, setLessonIndex] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<{ averageWpm: number; averageAccuracy: number } | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<Array<{
    date: string;
    wpm: number;
    accuracy: number;
  }>>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mistakes, setMistakes] = useState<Array<{ actual: string; expected: string }>>([]);
  const [recentWPMs, setRecentWPMs] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<TypingAnalysis | null>(null);
  const [streak, setStreak] = useState(0);

  const { toast } = useToast();
  const announcer = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voices = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserStats(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserStats(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserStats = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('words_per_minute, accuracy_percentage')
      .eq('id', userId)
      .single();

    if (!error && profile) {
      setStats({
        averageWpm: profile.words_per_minute || 0,
        averageAccuracy: profile.accuracy_percentage || 0
      });
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      voices.current = window.speechSynthesis.getVoices();
      const preferredVoice = voices.current.findIndex(
        voice => voice.name.includes('Natural') || voice.name.includes('Premium')
      );
      if (preferredVoice !== -1) {
        setVoiceIndex(preferredVoice);
      }
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const announce = (message: string) => {
    if (announcer.current) {
      announcer.current.textContent = message;
    }

    if (window.speechSynthesis && !isMuted) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      if (voices.current.length > 0) {
        utterance.voice = voices.current[voiceIndex];
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const getNextLesson = () => {
    const currentLessons = LESSON_SETS[currentLevel];
    if (lessonIndex >= currentLessons.length - 1) {
      if (currentLevel === 'beginner') {
        setCurrentLevel('intermediate');
        setLessonIndex(0);
        return LESSON_SETS.intermediate[0];
      } else if (currentLevel === 'intermediate') {
        setCurrentLevel('advanced');
        setLessonIndex(0);
        return LESSON_SETS.advanced[0];
      } else {
        setLessonIndex(0);
        return currentLessons[0];
      }
    } else {
      setLessonIndex(prev => prev + 1);
      return currentLessons[lessonIndex + 1];
    }
  };

  const calculateResults = useCallback(async () => {
    if (!startTime || !user) return;
    
    const endTime = Date.now();
    const timeInMinutes = (endTime - startTime) / 1000 / 60;
    const wordsTyped = target.split(' ').length;
    const wpm = Math.round(wordsTyped / timeInMinutes);
    const accuracy = Math.round(((target.length - errorCount) / target.length) * 100);

    setRecentWPMs(prev => [...prev.slice(-9), wpm]);
    const newAnalysis = analyzeTypingPatterns(mistakes, [...recentWPMs, wpm]);
    setAnalysis(newAnalysis);

    if (accuracy > 90) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    const adaptiveLessons = generateAdaptiveLessons(newAnalysis, currentLevel);
    
    announce(`Lesson completed! Your speed was ${wpm} words per minute with ${accuracy}% accuracy.`);

    if (isTutorEnabled) {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('gemini-tutor', {
          body: {
            text,
            target,
            wpm,
            accuracy
          },
        });

        if (error) throw error;
        setFeedback(data.feedback);
        announce(data.feedback);
      } catch (error) {
        console.error('Error getting AI feedback:', error);
        toast({
          title: "Error getting AI feedback",
          description: "Could not get AI feedback at this time",
          variant: "destructive",
        });
      }
    }

    if (user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            words_per_minute: wpm,
            accuracy_percentage: accuracy,
            last_lesson_date: new Date().toISOString()
          })
          .eq('id', user.id);

        const { error: historyError } = await supabase
          .from('typing_history')
          .insert({
            user_id: user.id,
            words_per_minute: wpm,
            accuracy_percentage: accuracy,
            lesson_level: currentLevel
          });

        if (profileError || historyError) {
          throw profileError || historyError;
        }

        setPerformanceHistory(prev => [...prev, {
          date: new Date().toISOString(),
          wpm,
          accuracy
        }]);

        await fetchUserStats(user.id);
      } catch (error) {
        console.error('Error saving results:', error);
        toast({
          title: "Error saving results",
          description: "Your progress couldn't be saved. Please try again.",
          variant: "destructive",
        });
      }
    }

    toast({
      title: "Lesson completed!",
      description: `Speed: ${wpm} WPM | Accuracy: ${accuracy}%`,
      duration: 5000,
    });

    setStartTime(null);
    setErrorCount(0);
    setText("");
    setTarget(getNextLesson());
    setIsLoading(false);
  }, [startTime, target, errorCount, text, toast, isTutorEnabled, user, currentLevel, mistakes, recentWPMs]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (showWelcome) {
      setShowWelcome(false);
      setTarget(LESSON_SETS.beginner[0]);
      setText("");
      return;
    }
    
    if (!startTime) {
      setStartTime(Date.now());
      announce("Starting timer. Begin typing.");
    }
    
    if (target.startsWith(value)) {
      setText(value);
      if (value === target) {
        calculateResults();
      }
    } else {
      setErrorCount(prev => prev + 1);
      const expectedChar = target[text.length];
      const lastChar = value[value.length - 1];
      setMistakes(prev => [...prev, { actual: lastChar, expected: expectedChar }]);
      announce(`Incorrect. Expected ${expectedChar}, got ${lastChar}`);
      toast({
        title: "Incorrect key",
        description: `Expected "${expectedChar}" but got "${lastChar}"`,
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showWelcome) {
        setShowWelcome(false);
        setTarget(LESSON_SETS.beginner[0]);
        setText("");
      }
      setPressedKey(e.key);
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showWelcome]);

  const toggleVoiceControl = () => {
    setIsListening(prev => !prev);
    const message = isListening ? "Voice control disabled" : "Voice control enabled";
    announce(message);
  };

  useEffect(() => {
    if (!isListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      announce("Speech recognition is not supported in this browser");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      announce("Voice recognition started");
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ')
        .toLowerCase();

      console.log("Voice command detected:", transcript);

      if (transcript.includes('start')) {
        if (target.includes("Press any key")) {
          setTarget("Hello world!");
          setText("");
          setStartTime(Date.now());
          announce("Starting new lesson");
        }
      } else if (transcript.includes('stop') || transcript.includes('end')) {
        setIsListening(false);
        announce("Voice control disabled");
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      announce("Voice recognition error. Please try again.");
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    };
  }, [isListening, target]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [target]);

  useEffect(() => {
    const fetchPerformanceHistory = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('typing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setPerformanceHistory(data.map((record: TypingHistory) => ({
          date: record.created_at,
          wpm: record.words_per_minute,
          accuracy: record.accuracy_percentage
        })));
      }
    };

    fetchPerformanceHistory();
  }, [user]);

  const getNextExpectedKey = () => {
    if (!target || text.length >= target.length) return null;
    return target[text.length];
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center space-y-8 animate-fade-in">
      <div 
        ref={announcer}
        className="sr-only" 
        role="status" 
        aria-live="polite"
      />
      {showWelcome && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold mb-8">Welcome to the Typing Tutor</h1>
            <p className="text-xl text-secondary animate-pulse">Press any key to begin</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setIsListening(prev => !prev)}
              className={`p-3 rounded-lg transition-all duration-300 ${
                isListening ? "bg-primary/20 text-primary" : "bg-secondary/10"
              }`}
            >
              {isListening ? "🎤 Listening..." : "🎤"}
            </button>
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="p-3 rounded-lg bg-secondary/10"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          {user && stats && (
            <div className="text-sm text-secondary">
              Average: {stats.averageWpm} WPM | {stats.averageAccuracy}% accuracy
            </div>
          )}
          {streak > 0 && (
            <div className="flex items-center gap-2 text-primary animate-scale-in">
              <Trophy className="h-5 w-5" />
              <span>Streak: {streak}</span>
            </div>
          )}
          {analysis && (
            <div className="text-sm text-secondary">
              Consistency: {analysis.consistencyScore}%
            </div>
          )}
        </div>
        
        <div className="space-y-8 p-8 rounded-lg border border-border/50 bg-black/30 backdrop-blur-sm">
          <div className="relative">
            <p className="text-4xl font-mono text-secondary mb-4 transition-all duration-300">
              {target}
            </p>
            <div className="h-px bg-border/50 my-8" />
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleInput}
                className="w-full bg-transparent text-4xl font-mono focus:outline-none focus:ring-0 transition-all duration-300"
                style={{
                  caretColor: 'currentcolor',
                  animation: 'cursor-blink 1s step-end infinite'
                }}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
              <div 
                className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/50 origin-left transition-transform duration-300"
                style={{
                  transform: `scaleX(${text.length / target.length})`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl mt-8">
        <VisualKeyboard 
          pressedKey={pressedKey} 
          nextKey={getNextExpectedKey()} 
        />
      </div>

      {user && performanceHistory.length > 0 && (
        <div className="w-full max-w-6xl">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <PerformanceChart data={performanceHistory} />
        </div>
      )}

      {analysis && (
        <div className="w-full max-w-2xl p-4 rounded-lg border border-border/50 bg-black/30 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-4">Typing Analysis</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Common Mistakes</h4>
              <ul className="space-y-2">
                {analysis.commonMistakes.map((mistake, i) => (
                  <li key={i} className="text-sm text-secondary">
                    Typed "{mistake.character}" instead of "{mistake.expectedChar}" ({mistake.count}x)
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Problem Keys</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.problemKeys.map((key, i) => (
                  <span key={i} className="px-2 py-1 rounded-md bg-destructive/20 text-destructive text-sm">
                    {key}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {feedback && isTutorEnabled && (
        <div 
          className="p-4 rounded-lg border border-primary/50 bg-primary/5"
          role="alert"
          aria-live="polite"
        >
          <h2 className="text-lg font-semibold mb-2">AI Feedback</h2>
          <p className="text-secondary">{feedback}</p>
        </div>
      )}

      {isLoading && isTutorEnabled && (
        <div 
          className="text-center text-secondary animate-pulse"
          role="alert"
          aria-live="polite"
        >
          Getting AI feedback...
        </div>
      )}

      <div 
        id="typing-instructions"
        className="mt-8 text-center text-secondary animate-slide-up"
      >
        <p>Press Tab to navigate, Space to select, and use arrow keys for navigation.</p>
        <p>Voice commands: Say "start" to begin, "stop" to disable voice control.</p>
      </div>
    </div>
  );
};

export default AccessibleTypingTutor;
