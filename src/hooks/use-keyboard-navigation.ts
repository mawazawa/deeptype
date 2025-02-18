/*
 * ██╗  ██╗███████╗██╗   ██╗██████╗  ██████╗  █████╗ ██████╗ ██████╗
 * ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗
 * █████╔╝ █████╗   ╚████╔╝ ██████╔╝██║   ██║███████║██████╔╝██║  ██║
 * ██╔═██╗ ██╔══╝    ╚██╔╝  ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║
 * ██║  ██╗███████╗   ██║   ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝
 * ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Hook: useKeyboardNavigation                                                                    ║
 * ║ Description: Custom hook for managing keyboard shortcuts and navigation                         ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { useEffect, useCallback } from "react";
import { useTypingSounds } from "./use-typing-sounds";

interface UseKeyboardNavigationOptions {
  onNextExercise?: () => void;
  onPreviousExercise?: () => void;
  onToggleCoach?: () => void;
  onRestartLevel?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onNextExercise,
  onPreviousExercise,
  onToggleCoach,
  onRestartLevel,
  enabled = true,
}: UseKeyboardNavigationOptions = {}) {
  const { handleKeyPress } = useTypingSounds();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Only handle if no input element is focused
      if (document.activeElement?.tagName === "INPUT") return;

      const { key, ctrlKey, metaKey } = event;

      // Prevent default for our shortcuts
      const shouldPreventDefault = () => {
        event.preventDefault();
        handleKeyPress("normal");
      };

      // Navigation shortcuts
      switch (true) {
        case (ctrlKey || metaKey) && key === "ArrowRight":
          shouldPreventDefault();
          onNextExercise?.();
          break;
        case (ctrlKey || metaKey) && key === "ArrowLeft":
          shouldPreventDefault();
          onPreviousExercise?.();
          break;
        case (ctrlKey || metaKey) && key === "c":
          shouldPreventDefault();
          onToggleCoach?.();
          break;
        case (ctrlKey || metaKey) && key === "r":
          shouldPreventDefault();
          onRestartLevel?.();
          break;
      }
    },
    [
      enabled,
      handleKeyPress,
      onNextExercise,
      onPreviousExercise,
      onToggleCoach,
      onRestartLevel,
    ]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  return {
    shortcuts: {
      nextExercise: "⌘/Ctrl + →",
      previousExercise: "⌘/Ctrl + ←",
      toggleCoach: "⌘/Ctrl + C",
      restartLevel: "⌘/Ctrl + R",
    },
  };
}
