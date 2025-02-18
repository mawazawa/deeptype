import { useCallback, useEffect, useRef } from "react";

interface FocusOptions {
  highlightDuration?: number;
  pulseEffect?: boolean;
  soundFeedback?: boolean;
}

export function useFocusManagement(options: FocusOptions = {}) {
  const {
    highlightDuration = 1000,
    pulseEffect = true,
    soundFeedback = true,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (soundFeedback) {
      audioRef.current = new Audio("/sounds/focus-change.mp3");
      audioRef.current.volume = 0.2;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [soundFeedback]);

  const handleFocus = useCallback(
    (element: HTMLElement) => {
      // Add subtle highlight effect
      element.style.transition = "box-shadow 0.2s ease";
      element.style.boxShadow = "0 0 0 2px hsl(var(--ring))";

      if (pulseEffect) {
        element.classList.add("pulse-focus");
      }

      if (soundFeedback && audioRef.current) {
        audioRef.current.play().catch(() => {
          // Silently handle autoplay restrictions
        });
      }

      // Remove highlight after duration
      setTimeout(() => {
        element.style.boxShadow = "";
        if (pulseEffect) {
          element.classList.remove("pulse-focus");
        }
      }, highlightDuration);
    },
    [highlightDuration, pulseEffect, soundFeedback]
  );

  const setFocus = useCallback(
    (elementOrSelector: HTMLElement | string) => {
      const element =
        typeof elementOrSelector === "string"
          ? (document.querySelector(elementOrSelector) as HTMLElement)
          : elementOrSelector;

      if (element) {
        element.focus();
        handleFocus(element);
      }
    },
    [handleFocus]
  );

  return {
    setFocus,
    handleFocus,
  };
}

// Add this to your globals.css:
/*
.pulse-focus {
  animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}
*/
