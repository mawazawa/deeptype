/*
 * ██████╗  █████╗ ███╗   ███╗██╗███████╗██╗ ██████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
 * ██╔════╝ ██╔══██╗████╗ ████║██║██╔════╝██║██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
 * ██║  ███╗███████║██╔████╔██║██║█████╗  ██║██║     ███████║   ██║   ██║██║   ██║██╔██╗ ██║
 * ██║   ██║██╔══██║██║╚██╔╝██║██║██╔══╝  ██║██║     ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
 * ╚██████╔╝██║  ██║██║ ╚═╝ ██║██║██║     ██║╚██████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
 *  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Hook: useGamification                                                                          ║
 * ║ Description: Advanced gamification hook with power-ups, combos, and special events             ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { create } from "canvas-confetti";
import { useRewards } from "./use-rewards";
import { useTypingSounds } from "./use-typing-sounds";
import {
  PowerUp,
  DailyChallenge,
  TypingEvent,
  powerUps,
  dailyChallenges,
  typingEvents,
  comboSystem,
  visualEffects,
  soundEffects,
} from "@/config/gamification";

// Create confetti instance
const confetti = create(undefined, { resize: true });

interface UseGamificationOptions {
  onPowerUpActivated?: (powerUp: PowerUp) => void;
  onChallengeCompleted?: (challenge: DailyChallenge) => void;
  onComboAchieved?: (combo: number, multiplier: number) => void;
}

export function useGamification({
  onPowerUpActivated,
  onChallengeCompleted,
  onComboAchieved,
}: UseGamificationOptions = {}) {
  // State
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);
  const [combo, setCombo] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [activeEvent, setActiveEvent] = useState<TypingEvent | null>(null);
  const [availableChallenges, setAvailableChallenges] = useState<
    DailyChallenge[]
  >([]);

  // Refs for timers
  const powerUpTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const comboDecayTimer = useRef<NodeJS.Timeout | null>(null);

  // Hooks
  const { addReward } = useRewards();
  const { handleKeyPress } = useTypingSounds();

  // Initialize daily challenges
  useEffect(() => {
    const resetDailyChallenges = () => {
      setAvailableChallenges(dailyChallenges);
    };

    resetDailyChallenges();
    // Reset challenges at midnight
    const now = new Date();
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );
    const timeToMidnight = tomorrow.getTime() - now.getTime();

    const timer = setTimeout(resetDailyChallenges, timeToMidnight);
    return () => clearTimeout(timer);
  }, []);

  // Activate power-up
  const activatePowerUp = useCallback(
    (powerUp: PowerUp) => {
      setActivePowerUps((prev) => [...prev, powerUp]);

      // Trigger visual effect
      confetti({
        particleCount: 50,
        spread: 90,
        colors: visualEffects.combo.colors,
        origin: { y: 0.7 },
      });

      // Set timer to deactivate
      powerUpTimers.current[powerUp.id] = setTimeout(() => {
        setActivePowerUps((prev) => prev.filter((p) => p.id !== powerUp.id));
      }, powerUp.duration * 1000);

      onPowerUpActivated?.(powerUp);
    },
    [onPowerUpActivated]
  );

  // Handle combo system
  const updateCombo = useCallback(
    (success: boolean) => {
      if (success) {
        setCombo((prev) => {
          const newCombo = prev + 1;
          const threshold = comboSystem.thresholds.find(
            (t) => t.streak === newCombo
          );

          if (threshold) {
            setCurrentMultiplier(threshold.multiplier);

            // Trigger combo visual effect
            const effect =
              newCombo >= 30 ? "large" : newCombo >= 15 ? "medium" : "small";
            confetti({
              ...visualEffects.combo.particles[effect],
              colors: visualEffects.combo.colors,
              origin: { y: 0.7 },
            });

            onComboAchieved?.(newCombo, threshold.multiplier);
          }

          return newCombo;
        });

        // Reset combo decay timer
        if (comboDecayTimer.current) {
          clearTimeout(comboDecayTimer.current);
        }
        comboDecayTimer.current = setTimeout(() => {
          setCombo(0);
          setCurrentMultiplier(1);
        }, 1000 / comboSystem.decayRate);
      } else {
        setCombo(0);
        setCurrentMultiplier(1);
      }
    },
    [onComboAchieved]
  );

  // Check challenge completion
  const checkChallengeCompletion = useCallback(
    (stats: {
      wpm: number;
      accuracy: number;
      perfect: boolean;
      combo: number;
    }) => {
      availableChallenges.forEach((challenge) => {
        let completed = false;

        switch (challenge.requirement.type) {
          case "wpm":
            completed = stats.wpm >= challenge.requirement.value;
            break;
          case "accuracy":
            completed = stats.accuracy >= challenge.requirement.value;
            break;
          case "perfect":
            completed = stats.perfect;
            break;
          case "combo":
            completed = stats.combo >= challenge.requirement.value;
            break;
        }

        if (completed) {
          // Remove challenge and grant reward
          setAvailableChallenges((prev) =>
            prev.filter((c) => c.id !== challenge.id)
          );

          // Add reward
          addReward({
            type: "achievement",
            points: challenge.reward.points,
            badge: challenge.reward.badge,
            message: `Challenge Completed: ${challenge.name}`,
            sound: "achievement",
          });

          // Grant power-up if available
          if (challenge.reward.powerUp) {
            activatePowerUp(challenge.reward.powerUp);
          }

          onChallengeCompleted?.(challenge);
        }
      });
    },
    [availableChallenges, addReward, activatePowerUp, onChallengeCompleted]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all power-up timers
      Object.values(powerUpTimers.current).forEach(clearTimeout);
      if (comboDecayTimer.current) {
        clearTimeout(comboDecayTimer.current);
      }
    };
  }, []);

  return {
    activePowerUps,
    combo,
    currentMultiplier,
    activeEvent,
    availableChallenges,
    activatePowerUp,
    updateCombo,
    checkChallengeCompletion,
  };
}
