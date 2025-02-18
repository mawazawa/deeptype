/*
 * ██╗  ██╗ █████╗ ██████╗ ████████╗██╗ ██████╗███████╗
 * ██║  ██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔════╝██╔════╝
 * ███████║███████║██████╔╝   ██║   ██║██║     ███████╗
 * ██╔══██║██╔══██║██╔═══╝    ██║   ██║██║     ╚════██║
 * ██║  ██║██║  ██║██║        ██║   ██║╚██████╗███████║
 * ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝        ╚═╝   ╚═╝ ╚═════╝╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Hook: Haptic Feedback                                                                          ║
 * ║ Description: Custom hook for managing haptic feedback in the typing tutor                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { HapticPattern } from '@/types/typing';

interface HapticConfig {
  enabled: boolean;
  intensity: number;
  customPatterns?: Record<string, HapticPattern>;
}

/**
 * Default haptic patterns
 */
const DEFAULT_PATTERNS: Record<string, HapticPattern> = {
  keyPress: {
    intensity: 0.5,
    duration: 50,
    pattern: [1],
    description: 'Standard key press feedback'
  },
  error: {
    intensity: 1.0,
    duration: 100,
    pattern: [1, 0, 1, 0, 1],
    description: 'Error feedback pattern'
  },
  success: {
    intensity: 0.7,
    duration: 150,
    pattern: [1, 0, 1],
    description: 'Success feedback pattern'
  },
  warning: {
    intensity: 0.8,
    duration: 75,
    pattern: [1, 0, 1],
    description: 'Warning feedback pattern'
  }
};

/**
 * Default configuration
 */
const DEFAULT_CONFIG: HapticConfig = {
  enabled: true,
  intensity: 1.0
};

/**
 * Custom hook for managing haptic feedback
 */
export function useHapticFeedback(config: Partial<HapticConfig> = {}) {
  // Merge default config with provided config
  const hapticConfig = { ...DEFAULT_CONFIG, ...config };

  // State for tracking support and patterns
  const [isSupported, setIsSupported] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Refs for tracking state and timing
  const lastTriggerTime = useRef<number>(0);
  const patterns = useRef<Record<string, HapticPattern>>({
    ...DEFAULT_PATTERNS,
    ...hapticConfig.customPatterns
  });

  /**
   * Initialize haptic feedback system
   */
  useEffect(() => {
    checkHapticSupport().then(supported => {
      setIsSupported(supported);
      setIsReady(true);

      if (supported) {
        console.log('Haptic feedback is supported');
      } else {
        console.warn('Haptic feedback is not supported on this device');
      }
    });
  }, []);

  /**
   * Check if haptic feedback is supported
   */
  const checkHapticSupport = async (): Promise<boolean> => {
    // Check for vibration API support
    if ('vibrate' in navigator) {
      try {
        // Test vibration
        await navigator.vibrate(0);
        return true;
      } catch (error) {
        console.error('Error testing vibration:', error);
        return false;
      }
    }
    return false;
  };

  /**
   * Trigger haptic feedback with a specific pattern
   */
  const triggerHapticFeedback = useCallback(async (
    pattern: HapticPattern,
    options: { force?: boolean; minInterval?: number } = {}
  ) => {
    if (!hapticConfig.enabled || !isSupported) return;

    const now = Date.now();
    const minInterval = options.minInterval || 50; // Default minimum interval

    // Check if enough time has passed since last trigger
    if (!options.force && now - lastTriggerTime.current < minInterval) {
      return;
    }

    try {
      // Apply intensity scaling
      const scaledPattern = pattern.pattern.map(value =>
        value === 0 ? 0 : Math.round(value * pattern.duration * hapticConfig.intensity)
      );

      // Trigger vibration
      await navigator.vibrate(scaledPattern);
      lastTriggerTime.current = now;

      console.log('Triggered haptic feedback:', {
        pattern: pattern.description,
        duration: pattern.duration,
        intensity: hapticConfig.intensity
      });
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
    }
  }, [hapticConfig.enabled, hapticConfig.intensity, isSupported]);

  /**
   * Add a custom haptic pattern
   */
  const addPattern = useCallback((
    id: string,
    pattern: HapticPattern
  ) => {
    patterns.current[id] = pattern;
    console.log(`Added custom haptic pattern: ${id}`, pattern);
  }, []);

  /**
   * Remove a custom haptic pattern
   */
  const removePattern = useCallback((id: string) => {
    if (id in DEFAULT_PATTERNS) {
      console.warn(`Cannot remove default pattern: ${id}`);
      return;
    }

    delete patterns.current[id];
    console.log(`Removed custom haptic pattern: ${id}`);
  }, []);

  /**
   * Get a specific haptic pattern
   */
  const getPattern = useCallback((id: string): HapticPattern | undefined => {
    return patterns.current[id];
  }, []);

  /**
   * Trigger a predefined haptic pattern
   */
  const triggerPattern = useCallback(async (
    patternId: string,
    options?: { force?: boolean; minInterval?: number }
  ) => {
    const pattern = getPattern(patternId);
    if (pattern) {
      await triggerHapticFeedback(pattern, options);
    } else {
      console.warn(`Haptic pattern not found: ${patternId}`);
    }
  }, [triggerHapticFeedback, getPattern]);

  /**
   * Create a composite haptic pattern from multiple patterns
   */
  const createCompositePattern = useCallback((
    patternIds: string[],
    spacing: number = 100
  ): HapticPattern => {
    const compositePattern: number[] = [];
    let totalDuration = 0;
    let description = 'Composite pattern: ';

    patternIds.forEach((id, index) => {
      const pattern = getPattern(id);
      if (pattern) {
        // Add spacing if not first pattern
        if (index > 0) {
          compositePattern.push(0);
          totalDuration += spacing;
        }

        // Add pattern
        compositePattern.push(...pattern.pattern);
        totalDuration += pattern.duration;
        description += `${pattern.description}, `;
      }
    });

    return {
      intensity: Math.max(...patternIds.map(id => getPattern(id)?.intensity || 0)),
      duration: totalDuration,
      pattern: compositePattern,
      description: description.slice(0, -2)
    };
  }, [getPattern]);

  return {
    isSupported,
    isReady,
    triggerHapticFeedback,
    triggerPattern,
    addPattern,
    removePattern,
    getPattern,
    createCompositePattern,
    patterns: patterns.current
  };
}