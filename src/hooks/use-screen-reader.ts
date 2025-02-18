/*
 * ███████╗ ██████╗██████╗ ███████╗███████╗███╗   ██╗
 * ██╔════╝██╔════╝██╔══██╗██╔════╝██╔════╝████╗  ██║
 * ███████╗██║     ██████╔╝█████╗  █████╗  ██╔██╗ ██║
 * ╚════██║██║     ██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║
 * ███████║╚██████╗██║  ██║███████╗███████╗██║ ╚████║
 * ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Hook: Screen Reader                                                                            ║
 * ║ Description: Custom hook for managing screen reader announcements                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface ScreenReaderConfig {
  enabled: boolean;
  volume: number;
  rate: number;
  pitch: number;
  voice?: string;
  language?: string;
}

interface AnnouncementOptions {
  priority?: 'high' | 'medium' | 'low';
  interrupt?: boolean;
  delay?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ScreenReaderConfig = {
  enabled: true,
  volume: 1.0,
  rate: 1.0,
  pitch: 1.0,
  language: 'en-US'
};

/**
 * Custom hook for managing screen reader announcements
 */
export function useScreenReader(config: Partial<ScreenReaderConfig> = {}) {
  // Merge default config with provided config
  const screenReaderConfig = { ...DEFAULT_CONFIG, ...config };

  // State for tracking support and status
  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Refs for managing announcements
  const synthesis = useRef<SpeechSynthesis | null>(null);
  const announcementQueue = useRef<Array<{
    text: string;
    options: AnnouncementOptions;
  }>>([]);
  const isProcessingQueue = useRef(false);

  /**
   * Initialize screen reader
   */
  useEffect(() => {
    checkScreenReaderSupport().then(supported => {
      setIsSupported(supported);
      if (supported) {
        synthesis.current = window.speechSynthesis;
        initializeVoice();
      }
      setIsReady(true);
    });

    return () => {
      if (synthesis.current) {
        synthesis.current.cancel();
      }
    };
  }, []);

  /**
   * Check if screen reader is supported
   */
  const checkScreenReaderSupport = async (): Promise<boolean> => {
    return 'speechSynthesis' in window;
  };

  /**
   * Initialize voice selection
   */
  const initializeVoice = () => {
    if (!synthesis.current) return;

    // Wait for voices to be loaded
    const handleVoicesChanged = () => {
      const voices = synthesis.current?.getVoices() || [];
      console.log('Available voices:', voices.length);

      // Select voice based on config
      const voice = voices.find(v =>
        v.name === screenReaderConfig.voice ||
        v.lang === screenReaderConfig.language
      ) || voices.find(v => v.default) || voices[0];

      if (voice) {
        setSelectedVoice(voice);
        console.log('Selected voice:', voice.name);
      } else {
        console.warn('No suitable voice found');
      }
    };

    synthesis.current.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged(); // Initial check
  };

  /**
   * Process the announcement queue
   */
  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || !synthesis.current || !selectedVoice) return;

    isProcessingQueue.current = true;

    while (announcementQueue.current.length > 0) {
      const announcement = announcementQueue.current[0];

      try {
        await speak(announcement.text, announcement.options);
        announcementQueue.current.shift();
      } catch (error) {
        console.error('Error processing announcement:', error);
        break;
      }
    }

    isProcessingQueue.current = false;
  }, [selectedVoice]);

  /**
   * Speak text using screen reader
   */
  const speak = (text: string, options: AnnouncementOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!synthesis.current || !selectedVoice) {
        reject(new Error('Screen reader not initialized'));
        return;
      }

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Configure utterance
      utterance.voice = selectedVoice;
      utterance.volume = screenReaderConfig.volume;
      utterance.rate = screenReaderConfig.rate;
      utterance.pitch = screenReaderConfig.pitch;

      // Handle events
      utterance.onend = () => {
        console.log('Finished speaking:', text);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(event);
      };

      // Speak
      if (options.interrupt) {
        synthesis.current.cancel();
      }

      if (options.delay) {
        setTimeout(() => {
          synthesis.current?.speak(utterance);
        }, options.delay);
      } else {
        synthesis.current.speak(utterance);
      }
    });
  };

  /**
   * Add announcement to queue
   */
  const announce = useCallback((
    text: string,
    options: AnnouncementOptions = {}
  ) => {
    if (!screenReaderConfig.enabled) return;

    // Add to queue based on priority
    if (options.priority === 'high') {
      announcementQueue.current.unshift({ text, options });
    } else {
      announcementQueue.current.push({ text, options });
    }

    // Process queue
    processQueue();
  }, [screenReaderConfig.enabled, processQueue]);

  /**
   * Announce key press
   */
  const announceKey = useCallback((key: string) => {
    const keyName = key === ' ' ? 'space' : key;
    announce(keyName, { priority: 'high', interrupt: true });
  }, [announce]);

  /**
   * Announce error
   */
  const announceError = useCallback((key: string) => {
    announce(`Incorrect key: ${key}`, { priority: 'high', interrupt: true });
  }, [announce]);

  /**
   * Update screen reader configuration
   */
  const updateConfig = useCallback((newConfig: Partial<ScreenReaderConfig>) => {
    Object.assign(screenReaderConfig, newConfig);

    if (newConfig.voice || newConfig.language) {
      initializeVoice();
    }
  }, []);

  /**
   * Clear announcement queue
   */
  const clearQueue = useCallback(() => {
    if (synthesis.current) {
      synthesis.current.cancel();
    }
    announcementQueue.current = [];
    isProcessingQueue.current = false;
  }, []);

  return {
    isSupported,
    isReady,
    announce,
    announceKey,
    announceError,
    updateConfig,
    clearQueue,
    selectedVoice
  };
}