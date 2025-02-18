
export interface MistakePattern {
  character: string;
  count: number;
  expectedChar: string;
}

export interface TypingAnalysis {
  commonMistakes: MistakePattern[];
  problemKeys: string[];
  averageWPM: number;
  consistencyScore: number;
}

export const analyzeTypingPatterns = (mistakes: Array<{ actual: string; expected: string }>, recentWPMs: number[]): TypingAnalysis => {
  const mistakeMap = new Map<string, MistakePattern>();
  
  mistakes.forEach(({ actual, expected }) => {
    const key = `${actual}-${expected}`;
    if (!mistakeMap.has(key)) {
      mistakeMap.set(key, { character: actual, count: 0, expectedChar: expected });
    }
    const pattern = mistakeMap.get(key)!;
    pattern.count++;
  });

  const commonMistakes = Array.from(mistakeMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const problemKeys = commonMistakes.map(m => m.expectedChar);
  
  const averageWPM = recentWPMs.length > 0 
    ? recentWPMs.reduce((a, b) => a + b, 0) / recentWPMs.length 
    : 0;

  const consistencyScore = calculateConsistencyScore(recentWPMs);

  return {
    commonMistakes,
    problemKeys,
    averageWPM,
    consistencyScore
  };
};

const calculateConsistencyScore = (wpmHistory: number[]): number => {
  if (wpmHistory.length < 2) return 100;
  
  const variations = wpmHistory.slice(1).map((wpm, i) => 
    Math.abs(wpm - wpmHistory[i]) / wpmHistory[i]
  );
  
  const averageVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
  return Math.round((1 - averageVariation) * 100);
};

export const generateAdaptiveLessons = (analysis: TypingAnalysis, currentLevel: string): string[] => {
  const baseText = "the quick brown fox jumps over the lazy dog";
  const problemKeys = analysis.problemKeys;
  
  const lessonTemplates = {
    beginner: [
      baseText,
      ...problemKeys.map(key => `${key.repeat(3)} ${baseText}`),
      baseText.split('').sort(() => Math.random() - 0.5).join('')
    ],
    intermediate: [
      ...problemKeys.map(key => `The ${key} appears frequently in this ${key}sentence about ${key}typing.`),
      baseText.split(' ').sort(() => Math.random() - 0.5).join(' ')
    ],
    advanced: [
      ...problemKeys.map(key => `Programming requires ${key} usage in ${key}various ${key}contexts.`),
      "function handleTyping(event) { console.log(event.key); }"
    ]
  };

  return lessonTemplates[currentLevel as keyof typeof lessonTemplates] || lessonTemplates.beginner;
};
