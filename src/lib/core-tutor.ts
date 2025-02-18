/*
 * ██████╗ ██████╗ ██████╗ ███████╗    ████████╗██╗   ██╗████████╗ ██████╗ ██████╗
 * ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ╚══██╔══╝██║   ██║╚══██╔══╝██╔═══██╗██╔══██╗
 * ██║     ██║   ██║██████╔╝█████╗         ██║   ██║   ██║   ██║   ██║   ██║██████╔╝
 * ██║     ██║   ██║██╔══██╗██╔══╝         ██║   ██║   ██║   ██║   ██║   ██║██╔══██╗
 * ╚██████╗╚██████╔╝██║  ██║███████╗       ██║   ╚██████╔╝   ██║   ╚██████╔╝██║  ██║
 *  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝       ╚═╝    ╚═════╝    ╚═╝    ╚═════╝ ╚═╝  ╚═╝
 *
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║ Core Tutor: Streamlined typing analysis and reward system                                      ║
 * ║ Description: Essential features for immediate feedback and engagement                          ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { create } from "canvas-confetti";

// Create confetti instance
const confetti = create(undefined, { resize: true });

interface CoreAnalysis {
  wpm: number;
  accuracy: number;
  errors: Array<{
    actual: string;
    expected: string;
    suggestion: string;
  }>;
  encouragement: string;
  nextSteps: string[];
}

interface RewardEvent {
  type: "perfect" | "speedup" | "streak" | "milestone";
  message: string;
  points: number;
}

export class CoreTutor {
  private model: any; // Gemini model
  private streakCount: number = 0;
  private lastWPM: number = 0;
  private perfectCount: number = 0;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  /**
   * Analyze typing performance and provide immediate feedback
   */
  async analyze(
    currentText: string,
    targetText: string
  ): Promise<CoreAnalysis> {
    const prompt = `
      As a typing tutor, analyze this typing attempt:
      Target: "${targetText}"
      Current: "${currentText}"

      Provide:
      1. WPM and accuracy calculation
      2. Key error corrections
      3. One encouraging message
      4. Two specific next steps
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      // Parse the response (simplified for core functionality)
      const analysis = this.parseAnalysis(response);

      // Trigger rewards based on performance
      await this.checkAndTriggerRewards(analysis);

      return analysis;
    } catch (error) {
      console.error("Analysis error:", error);
      throw new Error("Failed to analyze typing performance");
    }
  }

  /**
   * Parse Gemini's response into structured analysis
   */
  private parseAnalysis(response: string): CoreAnalysis {
    // Simple regex-based parsing for core metrics
    const wpmMatch = response.match(/WPM:?\s*(\d+)/i);
    const accuracyMatch = response.match(/accuracy:?\s*(\d+)/i);
    const errors = Array.from(
      response.matchAll(/Error:?\s*"([^"]+)"\s*->\s*"([^"]+)"/g)
    ).map(([_, actual, expected]) => ({
      actual,
      expected,
      suggestion: "Fix this error to improve accuracy",
    }));

    return {
      wpm: wpmMatch ? parseInt(wpmMatch[1]) : 0,
      accuracy: accuracyMatch ? parseInt(accuracyMatch[1]) : 0,
      errors,
      encouragement:
        response.match(/encouraging message:?\s*"([^"]+)"/i)?.[1] ||
        "Keep practicing!",
      nextSteps: [
        response.match(/next step 1:?\s*"([^"]+)"/i)?.[1] ||
          "Focus on accuracy",
        response.match(/next step 2:?\s*"([^"]+)"/i)?.[1] ||
          "Maintain steady rhythm",
      ],
    };
  }

  /**
   * Check performance and trigger appropriate rewards
   */
  private async checkAndTriggerRewards(analysis: CoreAnalysis): Promise<void> {
    const rewards: RewardEvent[] = [];

    // Perfect typing reward
    if (analysis.accuracy === 100) {
      this.perfectCount++;
      rewards.push({
        type: "perfect",
        message: "Perfect Typing! 🎯",
        points: 100 * this.perfectCount, // Increasing rewards for consecutive perfects
      });
    } else {
      this.perfectCount = 0;
    }

    // Speed improvement reward
    if (analysis.wpm > this.lastWPM * 1.1) {
      // 10% improvement
      rewards.push({
        type: "speedup",
        message: "Speed Boost! ⚡",
        points: 50,
      });
    }
    this.lastWPM = analysis.wpm;

    // Streak reward
    if (analysis.accuracy > 90) {
      this.streakCount++;
      if (this.streakCount % 5 === 0) {
        // Every 5 successful attempts
        rewards.push({
          type: "streak",
          message: `${this.streakCount} Streak! 🔥`,
          points: this.streakCount * 10,
        });
      }
    } else {
      this.streakCount = 0;
    }

    // Trigger visual rewards
    rewards.forEach((reward) => this.triggerReward(reward));
  }

  /**
   * Trigger visual and audio feedback for rewards
   */
  private triggerReward(reward: RewardEvent): void {
    // Visual feedback with confetti
    const confettiConfig = {
      perfect: {
        particleCount: 100,
        spread: 70,
        colors: ["#FFD700", "#FFA500"],
      },
      speedup: {
        particleCount: 50,
        spread: 45,
        colors: ["#00FF00", "#32CD32"],
      },
      streak: {
        particleCount: 75,
        spread: 60,
        colors: ["#FF69B4", "#FF1493"],
      },
      milestone: {
        particleCount: 150,
        spread: 90,
        colors: ["#4169E1", "#0000FF"],
      },
    };

    const config = confettiConfig[reward.type];
    confetti(config);

    // Display reward message
    console.log(`🎉 ${reward.message} (+${reward.points} points)`);
  }
}
