import { SpeechSynthesis, SpeechRecognition } from 'web-speech-api';

export interface AccessibilityConfig {
  speechRate: number;
  voiceURI: string;
  volume: number;
  pitch: number;
}

export class AccessibilityCore {
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition;

  constructor(private config: AccessibilityConfig) {
    this.synthesis = window.speechSynthesis;
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.initializeVoiceCommands();
  }

  private initializeVoiceCommands() {
    // Log for debugging
    console.info('Initializing voice commands with config:', this.config);

    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript;

      // Process voice commands
      this.handleVoiceCommand(command);
    };
  }

  private handleVoiceCommand(command: string) {
    // Log for analysis
    console.info('Processing voice command:', command);

    // Implement command handling
    const normalizedCommand = command.toLowerCase().trim();

    switch (normalizedCommand) {
      case 'start lesson':
        // Handle start lesson command
        break;
      case 'repeat':
        // Handle repeat command
        break;
      default:
        this.speak('Command not recognized. Please try again.');
    }
  }

  public speak(text: string, priority: boolean = false) {
    // Log for analysis
    console.info('Speaking text:', { text, priority });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.config.speechRate;
    utterance.volume = this.config.volume;
    utterance.pitch = this.config.pitch;

    if (priority) {
      this.synthesis.cancel(); // Cancel any ongoing speech
    }

    this.synthesis.speak(utterance);
  }

  // Add more accessibility features here
}