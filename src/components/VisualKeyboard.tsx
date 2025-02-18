
import React from 'react';

interface KeyProps {
  label: string;
  width?: string;
  isPressed?: boolean;
  isSpecial?: boolean;
}

const Key = ({ label, width = "w-12", isPressed = false, isSpecial = false }: KeyProps) => (
  <div
    className={`
      h-12 ${width} rounded-lg border border-border/50 
      flex items-center justify-center
      transition-all duration-150
      ${isPressed 
        ? "bg-primary/20 text-primary border-primary shadow-[0_0_10px_rgba(250,250,250,0.2)]" 
        : "bg-black/50 text-secondary hover:bg-black/70"}
      ${isSpecial ? "text-xs" : "text-sm"}
      backdrop-blur-sm
    `}
  >
    {label}
  </div>
);

interface VisualKeyboardProps {
  pressedKey: string | null;
}

const VisualKeyboard: React.FC<VisualKeyboardProps> = ({ pressedKey }) => {
  const isKeyPressed = (key: string) => pressedKey?.toLowerCase() === key.toLowerCase();

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-black/30 rounded-xl backdrop-blur-sm border border-border/50">
      <div className="grid gap-1">
        {/* Function Key Row */}
        <div className="flex gap-1 mb-4">
          <Key label="esc" width="w-12" isPressed={isKeyPressed("Escape")} isSpecial />
          <div className="w-14" /> {/* Spacing */}
          <Key label="F1" width="w-10" isPressed={isKeyPressed("F1")} isSpecial />
          <Key label="F2" width="w-10" isPressed={isKeyPressed("F2")} isSpecial />
          <Key label="F3" width="w-10" isPressed={isKeyPressed("F3")} isSpecial />
          <Key label="F4" width="w-10" isPressed={isKeyPressed("F4")} isSpecial />
          <div className="w-7" /> {/* Spacing */}
          <Key label="F5" width="w-10" isPressed={isKeyPressed("F5")} isSpecial />
          <Key label="F6" width="w-10" isPressed={isKeyPressed("F6")} isSpecial />
          <Key label="F7" width="w-10" isPressed={isKeyPressed("F7")} isSpecial />
          <Key label="F8" width="w-10" isPressed={isKeyPressed("F8")} isSpecial />
          <div className="w-7" /> {/* Spacing */}
          <Key label="F9" width="w-10" isPressed={isKeyPressed("F9")} isSpecial />
          <Key label="F10" width="w-10" isPressed={isKeyPressed("F10")} isSpecial />
          <Key label="F11" width="w-10" isPressed={isKeyPressed("F11")} isSpecial />
          <Key label="F12" width="w-10" isPressed={isKeyPressed("F12")} isSpecial />
        </div>

        {/* Number Row */}
        <div className="flex gap-1">
          <Key label="`" isPressed={isKeyPressed("`")} />
          <Key label="1" isPressed={isKeyPressed("1")} />
          <Key label="2" isPressed={isKeyPressed("2")} />
          <Key label="3" isPressed={isKeyPressed("3")} />
          <Key label="4" isPressed={isKeyPressed("4")} />
          <Key label="5" isPressed={isKeyPressed("5")} />
          <Key label="6" isPressed={isKeyPressed("6")} />
          <Key label="7" isPressed={isKeyPressed("7")} />
          <Key label="8" isPressed={isKeyPressed("8")} />
          <Key label="9" isPressed={isKeyPressed("9")} />
          <Key label="0" isPressed={isKeyPressed("0")} />
          <Key label="-" isPressed={isKeyPressed("-")} />
          <Key label="=" isPressed={isKeyPressed("=")} />
          <Key label="delete" width="w-16" isPressed={isKeyPressed("Backspace")} isSpecial />
        </div>

        {/* QWERTY Row */}
        <div className="flex gap-1">
          <Key label="tab" width="w-16" isPressed={isKeyPressed("Tab")} isSpecial />
          <Key label="Q" isPressed={isKeyPressed("q")} />
          <Key label="W" isPressed={isKeyPressed("w")} />
          <Key label="E" isPressed={isKeyPressed("e")} />
          <Key label="R" isPressed={isKeyPressed("r")} />
          <Key label="T" isPressed={isKeyPressed("t")} />
          <Key label="Y" isPressed={isKeyPressed("y")} />
          <Key label="U" isPressed={isKeyPressed("u")} />
          <Key label="I" isPressed={isKeyPressed("i")} />
          <Key label="O" isPressed={isKeyPressed("o")} />
          <Key label="P" isPressed={isKeyPressed("p")} />
          <Key label="[" isPressed={isKeyPressed("[")} />
          <Key label="]" isPressed={isKeyPressed("]")} />
          <Key label="\" isPressed={isKeyPressed("\\")} />
        </div>

        {/* ASDF Row */}
        <div className="flex gap-1">
          <Key label="caps lock" width="w-20" isPressed={isKeyPressed("CapsLock")} isSpecial />
          <Key label="A" isPressed={isKeyPressed("a")} />
          <Key label="S" isPressed={isKeyPressed("s")} />
          <Key label="D" isPressed={isKeyPressed("d")} />
          <Key label="F" isPressed={isKeyPressed("f")} />
          <Key label="G" isPressed={isKeyPressed("g")} />
          <Key label="H" isPressed={isKeyPressed("h")} />
          <Key label="J" isPressed={isKeyPressed("j")} />
          <Key label="K" isPressed={isKeyPressed("k")} />
          <Key label="L" isPressed={isKeyPressed("l")} />
          <Key label=";" isPressed={isKeyPressed(";")} />
          <Key label="'" isPressed={isKeyPressed("'")} />
          <Key label="return" width="w-20" isPressed={isKeyPressed("Enter")} isSpecial />
        </div>

        {/* ZXCV Row */}
        <div className="flex gap-1">
          <Key label="shift" width="w-28" isPressed={isKeyPressed("Shift")} isSpecial />
          <Key label="Z" isPressed={isKeyPressed("z")} />
          <Key label="X" isPressed={isKeyPressed("x")} />
          <Key label="C" isPressed={isKeyPressed("c")} />
          <Key label="V" isPressed={isKeyPressed("v")} />
          <Key label="B" isPressed={isKeyPressed("b")} />
          <Key label="N" isPressed={isKeyPressed("n")} />
          <Key label="M" isPressed={isKeyPressed("m")} />
          <Key label="," isPressed={isKeyPressed(",")} />
          <Key label="." isPressed={isKeyPressed(".")} />
          <Key label="/" isPressed={isKeyPressed("/")} />
          <Key label="shift" width="w-28" isPressed={isKeyPressed("Shift")} isSpecial />
        </div>

        {/* Space Row */}
        <div className="flex gap-1">
          <Key label="fn" width="w-12" isSpecial />
          <Key label="control" width="w-14" isPressed={isKeyPressed("Control")} isSpecial />
          <Key label="option" width="w-14" isPressed={isKeyPressed("Alt")} isSpecial />
          <Key label="command" width="w-16" isPressed={isKeyPressed("Meta")} isSpecial />
          <Key label="" width="w-64" isPressed={isKeyPressed(" ")} /> {/* Spacebar */}
          <Key label="command" width="w-16" isPressed={isKeyPressed("Meta")} isSpecial />
          <Key label="option" width="w-14" isPressed={isKeyPressed("Alt")} isSpecial />
          <div className="flex gap-1">
            <Key label="←" width="w-10" isPressed={isKeyPressed("ArrowLeft")} />
            <div className="flex flex-col gap-1">
              <Key label="↑" width="w-10" isPressed={isKeyPressed("ArrowUp")} />
              <Key label="↓" width="w-10" isPressed={isKeyPressed("ArrowDown")} />
            </div>
            <Key label="→" width="w-10" isPressed={isKeyPressed("ArrowRight")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualKeyboard;
