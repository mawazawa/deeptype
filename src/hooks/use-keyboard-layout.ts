/*
 * ██╗  ██╗███████╗██╗   ██╗██████╗  ██████╗  █████╗ ██████╗ ██████╗
 * ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
 * █████╔╝ █████╗   ╚████╔╝ ██████╔╝██║   ██║███████║██████╔╝██║  ██║
 * ██╔═██╗ ██╔══╝    ╚██╔╝  ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
 * ██║  ██╗███████╗   ██║   ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
 * ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Hook: Keyboard Layout                                                                          ║
 * ║ Description: Custom hook for managing keyboard layouts and key metadata                        ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useMemo } from 'react';
import { KeyMetadata, FingerPosition } from '@/types/typing';

type KeyboardLayout = 'qwerty' | 'dvorak' | 'colemak';

/**
 * Keyboard layout data
 */
const LAYOUTS: Record<KeyboardLayout, string[][]> = {
  qwerty: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
  ],
  dvorak: [
    ['\'', ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l'],
    ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's'],
    [';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z']
  ],
  colemak: [
    ['q', 'w', 'f', 'p', 'g', 'j', 'l', 'u', 'y', ';'],
    ['a', 'r', 's', 't', 'd', 'h', 'n', 'e', 'i', 'o'],
    ['z', 'x', 'c', 'v', 'b', 'k', 'm', ',', '.', '/']
  ]
};

/**
 * Finger position mappings for each key
 */
const FINGER_POSITIONS: Record<string, FingerPosition> = {
  // Left hand
  'q': 'left-pinky',
  'a': 'left-pinky',
  'z': 'left-pinky',
  'w': 'left-ring',
  's': 'left-ring',
  'x': 'left-ring',
  'e': 'left-middle',
  'd': 'left-middle',
  'c': 'left-middle',
  'r': 'left-index',
  'f': 'left-index',
  'v': 'left-index',
  't': 'left-index',
  'g': 'left-index',
  'b': 'left-index',

  // Right hand
  'y': 'right-index',
  'h': 'right-index',
  'n': 'right-index',
  'u': 'right-index',
  'j': 'right-index',
  'm': 'right-index',
  'i': 'right-middle',
  'k': 'right-middle',
  ',': 'right-middle',
  'o': 'right-ring',
  'l': 'right-ring',
  '.': 'right-ring',
  'p': 'right-pinky',
  ';': 'right-pinky',
  '/': 'right-pinky'
};

/**
 * Sound profiles for different key types
 */
const SOUND_PROFILES: Record<string, string> = {
  default: 'key-press-1',
  space: 'key-press-2',
  enter: 'key-press-3',
  backspace: 'key-press-4',
  shift: 'key-press-5',
  error: 'key-error'
};

/**
 * Haptic patterns for different key types
 */
const HAPTIC_PATTERNS: Record<string, { intensity: number; duration: number; pattern: number[] }> = {
  default: {
    intensity: 0.5,
    duration: 50,
    pattern: [1]
  },
  space: {
    intensity: 0.7,
    duration: 70,
    pattern: [1, 0, 1]
  },
  error: {
    intensity: 1.0,
    duration: 100,
    pattern: [1, 0, 1, 0, 1]
  }
};

/**
 * Letter frequency data for English text
 */
const LETTER_FREQUENCIES: Record<string, number> = {
  'e': 12.7, 't': 9.1, 'a': 8.2, 'o': 7.5, 'i': 7.0,
  'n': 6.7, 's': 6.3, 'h': 6.1, 'r': 6.0, 'd': 4.3,
  'l': 4.0, 'c': 2.8, 'u': 2.8, 'm': 2.4, 'w': 2.4,
  'f': 2.2, 'g': 2.0, 'y': 2.0, 'p': 1.9, 'b': 1.5,
  'v': 1.0, 'k': 0.8, 'j': 0.15, 'x': 0.15, 'q': 0.10,
  'z': 0.07, ',': 1.0, '.': 1.0, ';': 0.5, '/': 0.3
};

/**
 * Custom hook for managing keyboard layouts
 */
export function useKeyboardLayout(layout: KeyboardLayout = 'qwerty') {
  /**
   * Get metadata for a specific key
   */
  const getKeyMetadata = (key: string): KeyMetadata | null => {
    const normalizedKey = key.toLowerCase();

    if (!FINGER_POSITIONS[normalizedKey]) {
      console.warn(`No finger position mapping found for key: ${key}`);
      return null;
    }

    return {
      character: normalizedKey,
      finger: FINGER_POSITIONS[normalizedKey],
      frequencyScore: LETTER_FREQUENCIES[normalizedKey] || 0,
      soundProfile: SOUND_PROFILES[normalizedKey] || SOUND_PROFILES.default,
      hapticPattern: {
        ...HAPTIC_PATTERNS.default,
        description: `Haptic feedback for ${normalizedKey} key`
      }
    };
  };

  /**
   * Get all keys for the current layout
   */
  const getAllKeys = useMemo(() => {
    return LAYOUTS[layout].flat();
  }, [layout]);

  /**
   * Get neighboring keys for a given key
   */
  const getNeighboringKeys = (key: string): string[] => {
    const neighbors: string[] = [];
    const keyboardRows = LAYOUTS[layout];

    for (let rowIndex = 0; rowIndex < keyboardRows.length; rowIndex++) {
      const row = keyboardRows[rowIndex];
      const keyIndex = row.indexOf(key.toLowerCase());

      if (keyIndex !== -1) {
        // Add horizontal neighbors
        if (keyIndex > 0) neighbors.push(row[keyIndex - 1]);
        if (keyIndex < row.length - 1) neighbors.push(row[keyIndex + 1]);

        // Add vertical neighbors
        if (rowIndex > 0) neighbors.push(keyboardRows[rowIndex - 1][keyIndex]);
        if (rowIndex < keyboardRows.length - 1) neighbors.push(keyboardRows[rowIndex + 1][keyIndex]);
      }
    }

    return neighbors;
  };

  /**
   * Get keys assigned to a specific finger
   */
  const getKeysForFinger = (finger: FingerPosition): string[] => {
    return Object.entries(FINGER_POSITIONS)
      .filter(([_, pos]) => pos === finger)
      .map(([key]) => key);
  };

  /**
   * Calculate difficulty score for a key transition
   */
  const getTransitionDifficulty = (fromKey: string, toKey: string): number => {
    const from = getKeyMetadata(fromKey);
    const to = getKeyMetadata(toKey);

    if (!from || !to) return 1;

    // Base difficulty
    let difficulty = 1;

    // Increase difficulty for same finger
    if (from.finger === to.finger) {
      difficulty *= 2;
    }

    // Increase difficulty for pinky fingers
    if (from.finger.includes('pinky') || to.finger.includes('pinky')) {
      difficulty *= 1.5;
    }

    // Decrease difficulty for alternating hands
    if (from.finger.startsWith('left') !== to.finger.startsWith('left')) {
      difficulty *= 0.8;
    }

    return difficulty;
  };

  return {
    keyboardData: LAYOUTS[layout],
    getKeyMetadata,
    getAllKeys,
    getNeighboringKeys,
    getKeysForFinger,
    getTransitionDifficulty,
    fingerPositions: FINGER_POSITIONS,
    soundProfiles: SOUND_PROFILES,
    hapticPatterns: HAPTIC_PATTERNS,
    letterFrequencies: LETTER_FREQUENCIES
  };
}