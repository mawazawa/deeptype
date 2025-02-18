/*
 * ████████╗██╗   ██╗██████╗ ██╗███╗   ██╗ ██████╗      █████╗ ██╗
 * ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██║████╗  ██║██╔════╝     ██╔══██╗██║
 *    ██║    ╚████╔╝ ██████╔╝██║██╔██╗ ██║██║  ███╗    ███████║██║
 *    ██║     ╚██╔╝  ██╔═══╝ ██║██║╚██╗██║██║   ██║    ██╔══██║██║
 *    ██║      ██║   ██║     ██║██║ ╚████║╚██████╔╝    ██║  ██║██║
 *    ╚═╝      ╚═╝   ╚═╝     ╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚═╝  ╚═╝╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: AccessibilityCore                                                                      ║
 * ║ Description: Core accessibility module providing voice commands, haptic feedback, and          ║
 * ║              advanced error handling for an enhanced typing experience.                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechSynthesis: typeof SpeechSynthesis;
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    speechSynthesis: SpeechSynthesis;
  }
}

export interface AccessibilityConfig {
  speechRate: number;
  voiceURI: string;
  volume: number;
  pitch: number;
  hapticFeedback: boolean;
  autoCorrect: boolean;
  errorTolerance: number;
  commandDelay: number;
}

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  examples: string[];
}

export interface FeedbackOptions {
  visual?: boolean;
  audio?: boolean;
  haptic?: boolean;
  priority?: boolean;
}

export class AccessibilityCore {
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition;
  private commands: Map<string, VoiceCommand>;
  private lastCommand: string = '';
  private lastCommandTime: number = 0;
  private errorCount: number = 0;
  private isListening: boolean = false;

  constructor(private config: AccessibilityConfig) {
    // Initialize speech synthesis and recognition
    console.info('Initializing AccessibilityCore with config:', config);
    this.synthesis = window.speechSynthesis;
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.commands = new Map();

    // Initialize with default configuration
    this.config = {
      speechRate: 1,
      voiceURI: '',
      volume: 1,
      pitch: 1,
      hapticFeedback: true,
      autoCorrect: true,
      errorTolerance: 3,
      commandDelay: 1000,
      ...config
    };

    this.initializeVoiceCommands();
    this.setupErrorHandling();
  }

  private initializeVoiceCommands() {
    console.info('Setting up voice recognition system...');

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    // Register default commands
    this.registerCommand({
      command: 'start lesson',
      action: () => this.provideFeedback('Starting new lesson...', { audio: true, visual: true }),
      description: 'Starts a new typing lesson',
      examples: ['start lesson', 'begin lesson', 'new lesson']
    });

    this.registerCommand({
      command: 'pause',
      action: () => this.provideFeedback('Lesson paused. Say "resume" to continue.', { audio: true }),
      description: 'Pauses the current lesson',
      examples: ['pause', 'stop', 'wait']
    });

    this.registerCommand({
      command: 'resume',
      action: () => this.provideFeedback('Resuming lesson...', { audio: true }),
      description: 'Resumes the paused lesson',
      examples: ['resume', 'continue', 'go on']
    });

    this.registerCommand({
      command: 'repeat',
      action: () => this.provideFeedback('Repeating last instruction...', { audio: true }),
      description: 'Repeats the last instruction',
      examples: ['repeat', 'say again', 'what was that']
    });

    // Set up recognition handlers
    this.recognition.onstart = () => {
      console.info('Voice recognition started');
      this.isListening = true;
      this.provideFeedback('Voice control activated', { visual: true });
    };

    this.recognition.onend = () => {
      console.info('Voice recognition ended');
      this.isListening = false;
      if (this.errorCount < this.config.errorTolerance) {
        this.recognition.start();
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      this.handleError(event);
    };

    this.recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.toLowerCase().trim();

      console.info('Voice command received:', transcript);
      this.processCommand(transcript, result[0].confidence);
    };
  }

  private processCommand(transcript: string, confidence: number) {
    // Prevent command spam
    const now = Date.now();
    if (now - this.lastCommandTime < this.config.commandDelay) {
      return;
    }

    // Find best matching command
    let bestMatch: VoiceCommand | undefined;
    let bestConfidence = 0;

    this.commands.forEach((command, key) => {
      const similarity = this.calculateSimilarity(transcript, key);
      if (similarity > bestConfidence) {
        bestConfidence = similarity;
        bestMatch = command;
      }
    });

    if (bestMatch && bestConfidence > 0.8) {
      console.info('Executing command:', bestMatch.description);
      bestMatch.action();
      this.lastCommand = transcript;
      this.lastCommandTime = now;
      this.errorCount = 0;
    } else {
      this.provideFeedback('Command not recognized. Please try again.', { audio: true });
      this.errorCount++;
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Implement Levenshtein distance or similar algorithm
    // This is a simplified version
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    return s1.includes(s2) || s2.includes(s1) ? 1 : 0;
  }

  private setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      this.handleError(event);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event);
    });
  }

  private handleError(error: any) {
    this.errorCount++;
    console.error('Error in AccessibilityCore:', error);

    if (this.errorCount >= this.config.errorTolerance) {
      this.provideFeedback(
        'Voice control is having trouble. Switching to keyboard mode.',
        { audio: true, visual: true, priority: true }
      );
      this.recognition.stop();
    }
  }

  public registerCommand(command: VoiceCommand) {
    this.commands.set(command.command, command);
    console.info('Registered new command:', command.description);
  }

  public provideFeedback(message: string, options: FeedbackOptions = {}) {
    console.info('Providing feedback:', { message, options });

    // Visual feedback
    if (options.visual) {
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('accessibility-feedback', {
        detail: { message, type: 'visual' }
      }));
    }

    // Audio feedback
    if (options.audio !== false) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = this.config.speechRate;
      utterance.volume = this.config.volume;
      utterance.pitch = this.config.pitch;

      if (options.priority) {
        this.synthesis.cancel();
      }

      this.synthesis.speak(utterance);
    }

    // Haptic feedback
    if (options.haptic && this.config.hapticFeedback && navigator.vibrate) {
      navigator.vibrate(200);
    }
  }

  public startListening() {
    if (!this.isListening) {
      try {
        this.recognition.start();
        console.info('Voice recognition started');
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        this.handleError(error);
      }
    }
  }

  public stopListening() {
    if (this.isListening) {
      try {
        this.recognition.stop();
        console.info('Voice recognition stopped');
      } catch (error) {
        console.error('Error stopping voice recognition:', error);
        this.handleError(error);
      }
    }
  }

  public updateConfig(newConfig: Partial<AccessibilityConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.info('Updated accessibility configuration:', this.config);
  }
}