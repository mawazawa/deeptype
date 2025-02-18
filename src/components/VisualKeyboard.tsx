/*
 * ████████╗██╗   ██╗████████╗ ██████╗ ██████╗     ██████╗ ██████╗  █████╗ ██╗███╗   ██╗
 * ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██████╔╝    ██████╔╝██████╔╝███████║██║██╔██╗ ██║
 *    ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║
 *    ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║    ██████╔╝██║  ██║██║  ██║██║██║ ╚████║
 *    ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Component: VisualKeyboard                                                                      ║
 * ║ Description: Interactive keyboard visualization with key highlighting and finger indicators     ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface KeyProps {
  label: string;
  width?: string;
  isPressed?: boolean;
  isNext?: boolean;
  isSpecial?: boolean;
  fingerIndex?: number; // 1-8 for fingers (1=left pinky, 4=left index, 5=right index, 8=right pinky)
}

// Finger mapping for each key
const FINGER_MAP: Record<string, number> = {
  '`': 1, '1': 1, '2': 2, '3': 3, '4': 4, '5': 4, '6': 5, '7': 5, '8': 6, '9': 7, '0': 8, '-': 8, '=': 8,
  'q': 1, 'w': 2, 'e': 3, 'r': 4, 't': 4, 'y': 5, 'u': 5, 'i': 6, 'o': 7, 'p': 8, '[': 8, ']': 8, '\\': 8,
  'a': 1, 's': 2, 'd': 3, 'f': 4, 'g': 4, 'h': 5, 'j': 5, 'k': 6, 'l': 7, ';': 8, "'": 8,
  'z': 1, 'x': 2, 'c': 3, 'v': 4, 'b': 4, 'n': 5, 'm': 5, ',': 6, '.': 7, '/': 8
};

const FINGER_COLORS = {
  1: 'rgb(255, 100, 100)', // Left pinky - Red
  2: 'rgb(255, 150, 50)',  // Left ring - Orange
  3: 'rgb(255, 200, 0)',   // Left middle - Yellow
  4: 'rgb(100, 255, 100)', // Left index - Green
  5: 'rgb(100, 200, 255)', // Right index - Light Blue
  6: 'rgb(150, 150, 255)', // Right middle - Blue
  7: 'rgb(200, 100, 255)', // Right ring - Purple
  8: 'rgb(255, 100, 255)'  // Right pinky - Pink
};

const Key = ({ label, width = "w-12", isPressed = false, isNext = false, isSpecial = false }: KeyProps) => {
  const fingerIndex = FINGER_MAP[label.toLowerCase()];
  const fingerColor = fingerIndex ? FINGER_COLORS[fingerIndex] : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isPressed}
      aria-label={`${label} key ${isNext ? '- next key to press' : ''} ${fingerIndex ? `- use ${fingerIndex <= 4 ? 'left' : 'right'} ${['pinky', 'ring', 'middle', 'index'][Math.min(3, (fingerIndex - 1) % 4)]} finger` : ''}`}
      className={cn(
        "relative h-12",
        width,
        "rounded-lg border border-border/50",
        "flex items-center justify-center",
        "transition-all duration-300",
        isPressed
          ? "bg-primary/20 text-primary border-primary shadow-[0_0_10px_rgba(250,250,250,0.2)]"
          : isNext
            ? "bg-green-500/10 text-green-400 border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.1)] animate-[pulse_3s_ease-in-out_infinite]"
            : "bg-black/50 text-secondary hover:bg-black/70",
        isSpecial ? "text-xs" : "text-sm",
        "backdrop-blur-sm",
        "focus:ring-2 focus:ring-primary focus:outline-none",
        "motion-safe:transition-all"
      )}
      style={{
        borderTopColor: fingerColor,
        borderTopWidth: fingerIndex ? '3px' : '1px'
      }}
      data-key={label.toLowerCase()}
      data-finger={fingerIndex}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          console.info(`Key ${label} activated via keyboard`);
        }
      }}
    >
      {label}
      {isNext && (
        <span className="sr-only">
          (Next key to press)
        </span>
      )}
      {fingerIndex && (
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-[10px] opacity-50"
          style={{ color: fingerColor }}
        >
          {fingerIndex <= 4 ? 'L' : 'R'}{(fingerIndex - 1) % 4 + 1}
        </div>
      )}
    </div>
  );
};

interface VisualKeyboardProps {
  pressedKey: string | null;
  nextKey?: string | null;
}

const VisualKeyboard: React.FC<VisualKeyboardProps> = ({ pressedKey, nextKey }) => {
  const isKeyPressed = (key: string) => pressedKey?.toLowerCase() === key.toLowerCase();
  const isNextKey = (key: string) => nextKey?.toLowerCase() === key.toLowerCase();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-black/30 rounded-xl backdrop-blur-sm border border-border/50">
      <div className="grid gap-1">
        {/* Function Key Row */}
        <div className="flex gap-1 mb-4">
          <Key label="esc" width="w-12" isPressed={isKeyPressed("Escape")} isNext={isNextKey("Escape")} isSpecial />
          <div className="w-14" /> {/* Spacing */}
          <Key label="F1" width="w-10" isPressed={isKeyPressed("F1")} isNext={isNextKey("F1")} isSpecial />
          <Key label="F2" width="w-10" isPressed={isKeyPressed("F2")} isNext={isNextKey("F2")} isSpecial />
          <Key label="F3" width="w-10" isPressed={isKeyPressed("F3")} isNext={isNextKey("F3")} isSpecial />
          <Key label="F4" width="w-10" isPressed={isKeyPressed("F4")} isNext={isNextKey("F4")} isSpecial />
          <div className="w-7" /> {/* Spacing */}
          <Key label="F5" width="w-10" isPressed={isKeyPressed("F5")} isNext={isNextKey("F5")} isSpecial />
          <Key label="F6" width="w-10" isPressed={isKeyPressed("F6")} isNext={isNextKey("F6")} isSpecial />
          <Key label="F7" width="w-10" isPressed={isKeyPressed("F7")} isNext={isNextKey("F7")} isSpecial />
          <Key label="F8" width="w-10" isPressed={isKeyPressed("F8")} isNext={isNextKey("F8")} isSpecial />
          <div className="w-7" /> {/* Spacing */}
          <Key label="F9" width="w-10" isPressed={isKeyPressed("F9")} isNext={isNextKey("F9")} isSpecial />
          <Key label="F10" width="w-10" isPressed={isKeyPressed("F10")} isNext={isNextKey("F10")} isSpecial />
          <Key label="F11" width="w-10" isPressed={isKeyPressed("F11")} isNext={isNextKey("F11")} isSpecial />
          <Key label="F12" width="w-10" isPressed={isKeyPressed("F12")} isNext={isNextKey("F12")} isSpecial />
        </div>

        {/* Number Row */}
        <div className="flex gap-1">
          <Key label="`" isPressed={isKeyPressed("`")} isNext={isNextKey("`")} />
          <Key label="1" isPressed={isKeyPressed("1")} isNext={isNextKey("1")} />
          <Key label="2" isPressed={isKeyPressed("2")} isNext={isNextKey("2")} />
          <Key label="3" isPressed={isKeyPressed("3")} isNext={isNextKey("3")} />
          <Key label="4" isPressed={isKeyPressed("4")} isNext={isNextKey("4")} />
          <Key label="5" isPressed={isKeyPressed("5")} isNext={isNextKey("5")} />
          <Key label="6" isPressed={isKeyPressed("6")} isNext={isNextKey("6")} />
          <Key label="7" isPressed={isKeyPressed("7")} isNext={isNextKey("7")} />
          <Key label="8" isPressed={isKeyPressed("8")} isNext={isNextKey("8")} />
          <Key label="9" isPressed={isKeyPressed("9")} isNext={isNextKey("9")} />
          <Key label="0" isPressed={isKeyPressed("0")} isNext={isNextKey("0")} />
          <Key label="-" isPressed={isKeyPressed("-")} isNext={isNextKey("-")} />
          <Key label="=" isPressed={isKeyPressed("=")} isNext={isNextKey("=")} />
          <Key label="delete" width="w-16" isPressed={isKeyPressed("Backspace")} isNext={isNextKey("Backspace")} isSpecial />
        </div>

        {/* QWERTY Row */}
        <div className="flex gap-1">
          <Key label="tab" width="w-16" isPressed={isKeyPressed("Tab")} isNext={isNextKey("Tab")} isSpecial />
          <Key label="Q" isPressed={isKeyPressed("q")} isNext={isNextKey("q")} />
          <Key label="W" isPressed={isKeyPressed("w")} isNext={isNextKey("w")} />
          <Key label="E" isPressed={isKeyPressed("e")} isNext={isNextKey("e")} />
          <Key label="R" isPressed={isKeyPressed("r")} isNext={isNextKey("r")} />
          <Key label="T" isPressed={isKeyPressed("t")} isNext={isNextKey("t")} />
          <Key label="Y" isPressed={isKeyPressed("y")} isNext={isNextKey("y")} />
          <Key label="U" isPressed={isKeyPressed("u")} isNext={isNextKey("u")} />
          <Key label="I" isPressed={isKeyPressed("i")} isNext={isNextKey("i")} />
          <Key label="O" isPressed={isKeyPressed("o")} isNext={isNextKey("o")} />
          <Key label="P" isPressed={isKeyPressed("p")} isNext={isNextKey("p")} />
          <Key label="[" isPressed={isKeyPressed("[")} isNext={isNextKey("[")} />
          <Key label="]" isPressed={isKeyPressed("]")} isNext={isNextKey("]")} />
          <Key label="\\" isPressed={isKeyPressed("\\")} isNext={isNextKey("\\")} />
        </div>

        {/* ASDF Row */}
        <div className="flex gap-1">
          <Key label="caps lock" width="w-20" isPressed={isKeyPressed("CapsLock")} isNext={isNextKey("CapsLock")} isSpecial />
          <Key label="A" isPressed={isKeyPressed("a")} isNext={isNextKey("a")} />
          <Key label="S" isPressed={isKeyPressed("s")} isNext={isNextKey("s")} />
          <Key label="D" isPressed={isKeyPressed("d")} isNext={isNextKey("d")} />
          <Key label="F" isPressed={isKeyPressed("f")} isNext={isNextKey("f")} />
          <Key label="G" isPressed={isKeyPressed("g")} isNext={isNextKey("g")} />
          <Key label="H" isPressed={isKeyPressed("h")} isNext={isNextKey("h")} />
          <Key label="J" isPressed={isKeyPressed("j")} isNext={isNextKey("j")} />
          <Key label="K" isPressed={isKeyPressed("k")} isNext={isNextKey("k")} />
          <Key label="L" isPressed={isKeyPressed("l")} isNext={isNextKey("l")} />
          <Key label=";" isPressed={isKeyPressed(";")} isNext={isNextKey(";")} />
          <Key label="'" isPressed={isKeyPressed("'")} isNext={isNextKey("'")} />
          <Key label="return" width="w-20" isPressed={isKeyPressed("Enter")} isNext={isNextKey("Enter")} isSpecial />
        </div>

        {/* ZXCV Row */}
        <div className="flex gap-1">
          <Key label="shift" width="w-28" isPressed={isKeyPressed("Shift")} isNext={isNextKey("Shift")} isSpecial />
          <Key label="Z" isPressed={isKeyPressed("z")} isNext={isNextKey("z")} />
          <Key label="X" isPressed={isKeyPressed("x")} isNext={isNextKey("x")} />
          <Key label="C" isPressed={isKeyPressed("c")} isNext={isNextKey("c")} />
          <Key label="V" isPressed={isKeyPressed("v")} isNext={isNextKey("v")} />
          <Key label="B" isPressed={isKeyPressed("b")} isNext={isNextKey("b")} />
          <Key label="N" isPressed={isKeyPressed("n")} isNext={isNextKey("n")} />
          <Key label="M" isPressed={isKeyPressed("m")} isNext={isNextKey("m")} />
          <Key label="," isPressed={isKeyPressed(",")} isNext={isNextKey(",")} />
          <Key label="." isPressed={isKeyPressed(".")} isNext={isNextKey(".")} />
          <Key label="/" isPressed={isKeyPressed("/")} isNext={isNextKey("/")} />
          <Key label="shift" width="w-28" isPressed={isKeyPressed("Shift")} isNext={isNextKey("Shift")} isSpecial />
        </div>

        {/* Space Row */}
        <div className="flex gap-1">
          <Key label="fn" width="w-12" isSpecial />
          <Key label="control" width="w-14" isPressed={isKeyPressed("Control")} isNext={isNextKey("Control")} isSpecial />
          <Key label="option" width="w-14" isPressed={isKeyPressed("Alt")} isNext={isNextKey("Alt")} isSpecial />
          <Key label="command" width="w-16" isPressed={isKeyPressed("Meta")} isNext={isNextKey("Meta")} isSpecial />
          <Key label="" width="w-64" isPressed={isKeyPressed(" ")} isNext={isNextKey(" ")} /> {/* Spacebar */}
          <Key label="command" width="w-16" isPressed={isKeyPressed("Meta")} isNext={isNextKey("Meta")} isSpecial />
          <Key label="option" width="w-14" isPressed={isKeyPressed("Alt")} isNext={isNextKey("Alt")} isSpecial />
          <div className="flex gap-1">
            <Key label="←" width="w-10" isPressed={isKeyPressed("ArrowLeft")} isNext={isNextKey("ArrowLeft")} />
            <div className="flex flex-col gap-1">
              <Key label="↑" width="w-10" isPressed={isKeyPressed("ArrowUp")} isNext={isNextKey("ArrowUp")} />
              <Key label="↓" width="w-10" isPressed={isKeyPressed("ArrowDown")} isNext={isNextKey("ArrowDown")} />
            </div>
            <Key label="→" width="w-10" isPressed={isKeyPressed("ArrowRight")} isNext={isNextKey("ArrowRight")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualKeyboard;
