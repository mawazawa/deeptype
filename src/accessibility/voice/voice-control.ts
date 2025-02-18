/*
 * ██╗   ██╗ ██████╗ ██╗ ██████╗███████╗
 * ██║   ██║██╔═══██╗██║██╔════╝██╔════╝
 * ██║   ██║██║   ██║██║██║     █████╗
 * ╚██╗ ██╔╝██║   ██║██║██║     ██╔══╝
 *  ╚████╔╝ ╚██████╔╝██║╚██████╗███████╗
 *   ╚═══╝   ╚═════╝ ╚═╝ ╚═════╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Module: Voice Control                                                                          ║
 * ║ Description: Voice command system for hands-free typing practice                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

interface VoiceCommand {
  command: string;
  aliases?: string[];
  description: string;
  category: 'navigation' | 'typing' | 'system' | 'practice';
  action: () => Promise<void>;
}

interface VoiceControlConfig {
  language: string;
  confidence: number;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

type CommandHandler = (command: string, confidence: number) => Promise<void>;

/**
 * Default configuration
 */
const DEFAULT_CONFIG: VoiceControlConfig = {
  language: 'en-US',
  confidence: 0.8,
  continuous: true,
  interimResults: false,
  maxAlternatives: 3
};

/**
 * Voice commands for typing practice
 */
export class VoiceControl {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesisUtterance | null = null;
  private commands: Map<string, VoiceCommand> = new Map();
  private isListening: boolean = false;
  private commandHandlers: Set<CommandHandler> = new Set();
  private config: VoiceControlConfig;

  constructor(config: Partial<VoiceControlConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initialize();
  }

  /**
   * Initialize voice control system
   */
  private initialize(): void {
    console.log('Initializing voice control system...');

    try {
      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new (window as any).webkitSpeechRecognition();
        this.configureRecognition();
      } else if ('SpeechRecognition' in window) {
        this.recognition = new (window as any).SpeechRecognition();
        this.configureRecognition();
      } else {
        throw new Error('Speech recognition not supported');
      }

      // Initialize speech synthesis
      this.synthesis = new SpeechSynthesisUtterance();
      this.configureSynthesis();

      // Register default commands
      this.registerDefaultCommands();

      console.log('Voice control system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize voice control:', error);
    }
  }

  /**
   * Configure speech recognition
   */
  private configureRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
    this.recognition.lang = this.config.language;

    // Set up event handlers
    this.recognition.onstart = () => {
      console.log('Voice recognition started');
      this.isListening = true;
    };

    this.recognition.onend = () => {
      console.log('Voice recognition ended');
      this.isListening = false;

      // Restart if continuous mode
      if (this.config.continuous) {
        this.recognition?.start();
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
    };

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event);
    };
  }

  /**
   * Configure speech synthesis
   */
  private configureSynthesis(): void {
    if (!this.synthesis) return;

    this.synthesis.lang = this.config.language;
    this.synthesis.rate = 1.0;
    this.synthesis.pitch = 1.0;
    this.synthesis.volume = 1.0;
  }

  /**
   * Register default voice commands
   */
  private registerDefaultCommands(): void {
    // Navigation commands
    this.registerCommand({
      command: 'start practice',
      aliases: ['begin practice', 'start typing'],
      description: 'Start a typing practice session',
      category: 'practice',
      action: async () => {
        await this.speak('Starting typing practice session');
        // Trigger practice start
      }
    });

    this.registerCommand({
      command: 'stop practice',
      aliases: ['end practice', 'finish typing'],
      description: 'End the current practice session',
      category: 'practice',
      action: async () => {
        await this.speak('Ending practice session');
        // Trigger practice end
      }
    });

    // System commands
    this.registerCommand({
      command: 'pause listening',
      aliases: ['stop listening'],
      description: 'Pause voice recognition',
      category: 'system',
      action: async () => {
        await this.stopListening();
        await this.speak('Voice recognition paused');
      }
    });

    this.registerCommand({
      command: 'resume listening',
      aliases: ['start listening'],
      description: 'Resume voice recognition',
      category: 'system',
      action: async () => {
        await this.startListening();
        await this.speak('Voice recognition resumed');
      }
    });
  }

  /**
   * Handle speech recognition results
   */
  private async handleRecognitionResult(event: SpeechRecognitionEvent): Promise<void> {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.toLowerCase().trim();
    const confidence = result[0].confidence;

    console.log('Recognized:', transcript, `(${confidence})`);

    if (confidence < this.config.confidence) {
      console.log('Recognition confidence too low');
      return;
    }

    // Check for registered commands
    for (const [commandText, command] of this.commands) {
      if (
        transcript === commandText ||
        command.aliases?.some(alias => transcript === alias)
      ) {
        try {
          await command.action();
          // Notify command handlers
          await this.notifyCommandHandlers(commandText, confidence);
          return;
        } catch (error) {
          console.error('Error executing command:', error);
          await this.speak('Error executing command');
        }
      }
    }

    console.log('No matching command found');
  }

  /**
   * Register a new voice command
   */
  public registerCommand(command: VoiceCommand): void {
    this.commands.set(command.command.toLowerCase(), command);
    console.log('Registered command:', command.command);
  }

  /**
   * Unregister a voice command
   */
  public unregisterCommand(commandText: string): void {
    this.commands.delete(commandText.toLowerCase());
    console.log('Unregistered command:', commandText);
  }

  /**
   * Start listening for voice commands
   */
  public async startListening(): Promise<void> {
    if (this.isListening) return;

    try {
      await this.recognition?.start();
      console.log('Started listening for voice commands');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      throw error;
    }
  }

  /**
   * Stop listening for voice commands
   */
  public async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      await this.recognition?.stop();
      console.log('Stopped listening for voice commands');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      throw error;
    }
  }

  /**
   * Speak text using speech synthesis
   */
  public async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not initialized'));
        return;
      }

      this.synthesis.text = text;
      this.synthesis.onend = () => resolve();
      this.synthesis.onerror = (error) => reject(error);

      window.speechSynthesis.speak(this.synthesis);
    });
  }

  /**
   * Add command handler
   */
  public addCommandHandler(handler: CommandHandler): void {
    this.commandHandlers.add(handler);
  }

  /**
   * Remove command handler
   */
  public removeCommandHandler(handler: CommandHandler): void {
    this.commandHandlers.delete(handler);
  }

  /**
   * Notify command handlers
   */
  private async notifyCommandHandlers(
    command: string,
    confidence: number
  ): Promise<void> {
    const promises = Array.from(this.commandHandlers).map(handler =>
      handler(command, confidence)
    );
    await Promise.all(promises);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<VoiceControlConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.configureRecognition();
    this.configureSynthesis();
  }

  /**
   * Get registered commands
   */
  public getCommands(): VoiceCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get current configuration
   */
  public getConfig(): VoiceControlConfig {
    return { ...this.config };
  }

  /**
   * Check if system is currently listening
   */
  public isActive(): boolean {
    return this.isListening;
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stopListening();
    this.commands.clear();
    this.commandHandlers.clear();
    this.recognition = null;
    this.synthesis = null;
  }
}