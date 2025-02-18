
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const AccessibleTypingTutor = () => {
  const [text, setText] = useState("");
  const [target, setTarget] = useState("Welcome to the accessible typing tutor. Press any key to begin.");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const startTutorial = (e: KeyboardEvent) => {
      if (target.includes("Press any key")) {
        setTarget("Type the following text: Hello world!");
        setText("");
      }
    };

    window.addEventListener("keydown", startTutorial);
    return () => window.removeEventListener("keydown", startTutorial);
  }, [target]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (target.includes("Press any key")) return;
    
    setText(prev => {
      const newText = prev + e.key;
      
      // Check for correct typing
      if (target.startsWith(newText)) {
        if (newText === target) {
          toast({
            title: "Success!",
            description: "Well done! You've completed the text correctly.",
            duration: 3000,
          });
        }
        return newText;
      }
      
      toast({
        title: "Incorrect key",
        description: `Expected "${target[prev.length]}" but got "${e.key}"`,
        variant: "destructive",
        duration: 2000,
      });
      
      return prev;
    });
  };

  const toggleVoiceControl = () => {
    setIsListening(prev => !prev);
    toast({
      title: isListening ? "Voice control disabled" : "Voice control enabled",
      description: isListening ? 
        "You can now use keyboard input" : 
        "You can now use voice commands",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center space-y-8 animate-fade-in">
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
          className="p-6 rounded-lg border border-border bg-black/50 backdrop-blur-lg"
          role="textbox"
          aria-label="Typing area"
          tabIndex={0}
          onKeyPress={handleKeyPress}
        >
          <p className="text-xl mb-4 text-secondary">Target text:</p>
          <p className="text-2xl mb-6 font-mono">{target}</p>
          
          <div className="h-px bg-border mb-6" role="separator" />
          
          <p className="text-xl mb-4 text-secondary">Your input:</p>
          <p className="text-2xl font-mono min-h-[2em]">{text || "Start typing..."}</p>
        </div>

        <div className="mt-8 text-center text-secondary animate-slide-up">
          <p>Press Tab to navigate, Space to select, and use arrow keys for navigation.</p>
          <p>All commands can be activated by voice or keyboard.</p>
        </div>
      </div>
    </div>
  );
};

export default AccessibleTypingTutor;
