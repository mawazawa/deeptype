/*
 * ██████╗ ██████╗ ██████╗ ███████╗    ██████╗  █████╗ ███╗   ██╗███████╗██╗
 * ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔══██╗██╔══██╗████╗  ██║██╔════╝██║
 * ██║     ██║   ██║██████╔╝█████╗      ██████╔╝███████║██╔██╗ ██║█████╗  ██║
 * ██║     ██║   ██║██╔══██╗██╔══╝      ██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║
 * ╚██████╗╚██████╔╝██║  ██║███████╗    ██║     ██║  ██║██║ ╚████║███████╗███████╗
 *  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
 */

import React, { useState, useEffect, useCallback } from "react";
import { CoreTutor } from "@/lib/core-tutor";

// Initialize CoreTutor with your Gemini API key
const tutor = new CoreTutor(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export function CoreTutorPanel() {
  const [targetText, setTargetText] = useState(
    "The quick brown fox jumps over the lazy dog"
  );
  const [currentText, setCurrentText] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze typing performance
  const analyzeTyping = useCallback(async () => {
    if (!currentText) return;

    setIsAnalyzing(true);
    try {
      const result = await tutor.analyze(currentText, targetText);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis error:", error);
    }
    setIsAnalyzing(false);
  }, [currentText, targetText]);

  // Debounced analysis
  useEffect(() => {
    const timer = setTimeout(analyzeTyping, 500);
    return () => clearTimeout(timer);
  }, [currentText, analyzeTyping]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Target Text */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Target Text</h2>
        <p className="p-4 bg-muted rounded-lg font-mono">{targetText}</p>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Type Here</h2>
        <textarea
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          className="w-full h-32 p-4 bg-background border rounded-lg font-mono resize-none focus:ring-2 focus:ring-primary"
          placeholder="Start typing..."
        />
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{analysis.wpm}</div>
              <div className="text-sm text-muted-foreground">WPM</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{analysis.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>

          {/* Errors */}
          {analysis.errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Errors</h3>
              <div className="space-y-2">
                {analysis.errors.map((error: any, index: number) => (
                  <div key={index} className="p-3 bg-destructive/10 rounded-lg">
                    <span className="font-mono">
                      "{error.actual}" → "{error.expected}"
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Encouragement */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-lg font-medium">{analysis.encouragement}</p>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <h3 className="font-semibold">Next Steps</h3>
            <ul className="list-disc list-inside space-y-1">
              {analysis.nextSteps.map((step: string, index: number) => (
                <li key={index} className="text-muted-foreground">
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="text-center text-muted-foreground">
          Analyzing your typing...
        </div>
      )}
    </div>
  );
}
