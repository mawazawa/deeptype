
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AccessibleTypingTutor = () => {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("Welcome to the accessible typing tutor. Press any key to begin.");
  const [isListening, setIsListening] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTutorEnabled, setIsTutorEnabled] = useState(true);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const { toast } = useToast();
  const announcer = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voices = useRef<SpeechSynthesisVoice[]>([]);

  // Initialize speech synthesis voices
  useEffect(() => {
    const loadVoices = () => {
      voices.current = window.speechSynthesis.getVoices();
      // Try to find a natural sounding voice
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

    if (window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(message);
      if (voices.current.length > 0) {
        utterance.voice = voices.current[voiceIndex];
        utterance.rate = 1;
        utterance.pitch = 1;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const calculateResults = useCallback(async () => {
    if (!startTime) return;
    
    const endTime = Date.now();
    const timeInMinutes = (endTime - startTime) / 1000 / 60;
    const wordsTyped = target.split(' ').length;
    const wpm = Math.round(wordsTyped / timeInMinutes);
    const accuracy = Math.round(((target.length - errorCount) / target.length) * 100);

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

    // Save results if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          words_per_minute: wpm,
          accuracy_percentage: accuracy,
          last_lesson_date: new Date().toISOString()
        })
        .eq('id', session.user.id);

      if (error) {
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

    // Reset for next lesson
    setStartTime(null);
    setErrorCount(0);
    setText("");
    setTarget("The quick brown fox jumps over the lazy dog.");
    setIsLoading(false);
  }, [startTime, target, errorCount, text, toast, isTutorEnabled]);

  useEffect(() => {
    const startTutorial = (e: KeyboardEvent) => {
      if (target.includes("Press any key")) {
        setTarget("Hello world!");
        setText("");
        setStartTime(Date.now());
        announce("Lesson started. Type: Hello world!");
      }
    };

    window.addEventListener("keydown", startTutorial);
    return () => window.removeEventListener("keydown", startTutorial);
  }, [target]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (target.includes("Press any key")) return;
    
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
      announce(`Incorrect. Expected ${expectedChar}, got ${lastChar}`);
      toast({
        title: "Incorrect key",
        description: `Expected "${expectedChar}" but got "${lastChar}"`,
        variant: "destructive",
        duration: 2000,
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center space-y-8 animate-fade-in">
      <div 
        ref={announcer}
        className="sr-only" 
        role="status" 
        aria-live="polite"
      />

      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-2 text-center" aria-label="Accessible Typing Tutor">
          Accessible Typing Tutor
        </h1>
        
        <div className="flex gap-4 mb-8">
          <button
            onClick={toggleVoiceControl}
            className={`flex-1 p-4 rounded-lg transition-all duration-300 backdrop-blur-lg border ${
              isListening 
                ? "border-primary bg-primary/10 animate-pulse" 
                : "border-border bg-background/50"
            }`}
            aria-label={isListening ? "Voice control active (click to disable)" : "Enable voice control"}
          >
            {isListening ? "🎤 Listening..." : "🎤 Enable Voice Control"}
          </button>

          <button
            onClick={() => setIsTutorEnabled(prev => !prev)}
            className={`flex-1 p-4 rounded-lg transition-all duration-300 backdrop-blur-lg border ${
              isTutorEnabled 
                ? "border-primary bg-primary/10" 
                : "border-border bg-background/50"
            }`}
            aria-label={isTutorEnabled ? "AI Tutor enabled (click to disable)" : "Enable AI Tutor"}
          >
            {isTutorEnabled ? "🤖 AI Tutor Active" : "🤖 Enable AI Tutor"}
          </button>
        </div>

        <div 
          className="p-6 rounded-lg border border-border bg-black/50 backdrop-blur-lg mb-6"
          aria-label="Typing area"
          aria-describedby="typing-instructions"
        >
          <p className="text-xl mb-4 text-secondary">Target text:</p>
          <p className="text-2xl mb-6 font-mono" aria-live="polite">{target}</p>
          
          <div className="h-px bg-border mb-6" role="separator" />
          
          <p className="text-xl mb-4 text-secondary">Your input:</p>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={handleInput}
            className="w-full bg-transparent text-2xl font-mono min-h-[2em] focus:outline-none focus:ring-2 focus:ring-primary/50 rounded p-2"
            aria-label="Type here"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

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
    </div>
  );
};

export default AccessibleTypingTutor;
