
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AccessibleTypingTutor = () => {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("Welcome to the accessible typing tutor. Press any key to begin.");
  const [isListening, setIsListening] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const announcer = useRef<HTMLDivElement>(null);

  // Function to announce messages to screen readers
  const announce = (message: string) => {
    if (announcer.current) {
      announcer.current.textContent = message;
    }

    // Also speak the message if speech synthesis is available
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(message);
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

    // Get AI feedback
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
    setTarget("Type the following text: The quick brown fox jumps over the lazy dog.");
    setIsLoading(false);
  }, [startTime, target, errorCount, text, toast]);

  useEffect(() => {
    const startTutorial = (e: KeyboardEvent) => {
      if (target.includes("Press any key")) {
        setTarget("Type the following text: Hello world!");
        setText("");
        setStartTime(Date.now());
        announce("Lesson started. Type: Hello world!");
      }
    };

    window.addEventListener("keydown", startTutorial);
    return () => window.removeEventListener("keydown", startTutorial);
  }, [target]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (target.includes("Press any key")) return;
    
    if (!startTime) {
      setStartTime(Date.now());
      announce("Starting timer. Begin typing.");
    }
    
    setText(prev => {
      const newText = prev + e.key;
      
      // Check for correct typing
      if (target.startsWith(newText)) {
        if (newText === target) {
          calculateResults();
        }
        return newText;
      }
      
      setErrorCount(prev => prev + 1);
      const expectedChar = target[prev.length];
      announce(`Incorrect. Expected ${expectedChar}, got ${e.key}`);
      toast({
        title: "Incorrect key",
        description: `Expected "${expectedChar}" but got "${e.key}"`,
        variant: "destructive",
        duration: 2000,
      });
      
      return prev;
    });
  };

  const toggleVoiceControl = () => {
    setIsListening(prev => !prev);
    const message = isListening ? "Voice control disabled" : "Voice control enabled";
    announce(message);
    toast({
      title: message,
      description: isListening ? 
        "You can now use keyboard input" : 
        "You can now use voice commands",
      duration: 3000,
    });
  };

  // Start listening for voice commands when enabled
  useEffect(() => {
    if (!isListening) return;

    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      announce("Speech recognition is not supported in this browser");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      
      // Handle voice commands
      if (transcript.toLowerCase().includes('start')) {
        if (target.includes("Press any key")) {
          startTutorial(new KeyboardEvent('keydown'));
        }
      }
    };

    recognition.start();
    return () => recognition.stop();
  }, [isListening, target]);

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center space-y-8 animate-fade-in">
      {/* Screen reader announcer */}
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
        
        <button
          onClick={toggleVoiceControl}
          className={`w-full p-4 mb-8 rounded-lg transition-all duration-300 backdrop-blur-lg border ${
            isListening 
              ? "border-primary bg-primary/10 animate-pulse" 
              : "border-border bg-background/50"
          }`}
          aria-label={isListening ? "Voice control active (click to disable)" : "Enable voice control"}
        >
          {isListening ? "🎤 Listening..." : "🎤 Enable Voice Control"}
        </button>

        <div 
          className="p-6 rounded-lg border border-border bg-black/50 backdrop-blur-lg mb-6"
          role="textbox"
          aria-label="Typing area"
          tabIndex={0}
          onKeyPress={handleKeyPress}
          aria-describedby="typing-instructions"
        >
          <p className="text-xl mb-4 text-secondary">Target text:</p>
          <p className="text-2xl mb-6 font-mono" aria-live="polite">{target}</p>
          
          <div className="h-px bg-border mb-6" role="separator" />
          
          <p className="text-xl mb-4 text-secondary">Your input:</p>
          <p className="text-2xl font-mono min-h-[2em]" aria-live="polite">
            {text || "Start typing..."}
          </p>
        </div>

        {feedback && (
          <div 
            className="p-4 rounded-lg border border-primary/50 bg-primary/5"
            role="alert"
            aria-live="polite"
          >
            <h2 className="text-lg font-semibold mb-2">AI Feedback</h2>
            <p className="text-secondary">{feedback}</p>
          </div>
        )}

        {isLoading && (
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
          <p>All commands can be activated by voice or keyboard.</p>
        </div>
      </div>
    </div>
  );
};

export default AccessibleTypingTutor;
