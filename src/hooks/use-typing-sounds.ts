/*
 * ███████╗ ██████╗ ██╗   ██╗███╗   ██╗██████╗ ███████╗
 * ██╔════╝██╔═══██╗██║   ██║████╗  ██║██╔══██╗██╔════╝
 * ███████╗██║   ██║██║   ██║██╔██╗ ██║██║  ██║███████╗
 * ╚════██║██║   ██║██║   ██║██║╚██╗██║██║  ██║╚════██║
 * ███████║╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝███████║
 * ╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚══════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Hook: useTypingSounds                                                                          ║
 * ║ Description: Custom hook for managing typing sound effects and audio feedback                  ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useCallback } from "react";
import useSound from "use-sound";

interface UseTypingSoundsOptions {
  volume?: number;
  enabled?: boolean;
}

export function useTypingSounds({
  volume = 0.5,
  enabled = true,
}: UseTypingSoundsOptions = {}) {
  const [playKeyPress] = useSound("/sounds/key-press.mp3", {
    volume: volume * 0.4,
    sprite: {
      normal: [0, 100],
      error: [150, 150],
      backspace: [300, 100],
    },
  });

  const [playAchievement] = useSound("/sounds/achievement.mp3", {
    volume: volume * 0.6,
    sprite: {
      levelUp: [0, 1200],
      milestone: [1300, 800],
      perfect: [2200, 1500],
    },
  });

  const [playFeedback] = useSound("/sounds/feedback.mp3", {
    volume: volume * 0.5,
    sprite: {
      encouragement: [0, 600],
      correction: [700, 400],
      hint: [1200, 300],
    },
  });

  const handleKeyPress = useCallback(
    (type: "normal" | "error" | "backspace") => {
      if (!enabled) return;
      playKeyPress({ id: type });
    },
    [enabled, playKeyPress]
  );

  const handleAchievement = useCallback(
    (type: "levelUp" | "milestone" | "perfect") => {
      if (!enabled) return;
      playAchievement({ id: type });
    },
    [enabled, playAchievement]
  );

  const handleFeedback = useCallback(
    (type: "encouragement" | "correction" | "hint") => {
      if (!enabled) return;
      playFeedback({ id: type });
    },
    [enabled, playFeedback]
  );

  return {
    handleKeyPress,
    handleAchievement,
    handleFeedback,
  };
}
