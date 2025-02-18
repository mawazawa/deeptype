declare global {
  type HexColor = `#${string}`;
  type HSLString = `${number} ${number}% ${number}%`;

  interface ThemeColors {
    background: HSLString;
    foreground: HSLString;

    card: {
      DEFAULT: HSLString;
      foreground: HSLString;
    };

    popover: {
      DEFAULT: HSLString;
      foreground: HSLString;
    };

    primary: {
      DEFAULT: HSLString;
      foreground: HSLString;
    };

    secondary: {
      DEFAULT: HSLString;
      foreground: HSLString;
    };

    muted: {
      DEFAULT: HSLString;
      foreground: HSLString;
    };

    accent: {
      DEFAULT: HSLString;
      foreground: HSLString;
    };

    destructive: {
      DEFAULT: HSLString;
      foreground: HSLString;
    };

    border: HSLString;
    input: HSLString;
    ring: HSLString;
  }

  interface ThemeConfig {
    darkMode: string[];
    content: string[];
    theme: {
      extend: {
        colors: ThemeColors;
        borderRadius: {
          lg: string;
          md: string;
          sm: string;
        };
        keyframes: Record<string, Record<string, Record<string, string>>>;
        animation: Record<string, string>;
      };
    };
    plugins: any[];
  }
}

export {};