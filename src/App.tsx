/*
 * ██████╗ ███████╗███████╗██████╗ ████████╗██╗   ██╗██████╗ ███████╗
 * ██╔══██╗██╔════╝██╔════╝██╔══██╗╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝
 * ██║  ██║█████╗  █████╗  ██████╔╝   ██║    ╚████╔╝ ██████╔╝█████╗
 * ██║  ██║██╔══╝  ██╔══╝  ██╔═══╝    ██║     ╚██╔╝  ██╔═══╝ ██╔══╝
 * ██████╔╝███████╗███████╗██║        ██║      ██║   ██║     ███████╗
 * ╚═════╝ ╚══════╝╚══════╝╚═╝        ╚═╝      ╚═╝   ╚═╝     ╚══════╝
 */

import React from "react";

function App() {
  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/background-loop.gif"
        >
          <source src="/background-loop.mp4" type="video/mp4" />
          {/* Fallback to GIF if video fails */}
          <img
            src="/background-loop.gif"
            alt="Typing animation"
            className="w-full h-full object-cover"
          />
        </video>
      </div>

      {/* Content with backdrop blur */}
      <div className="relative z-10 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              DeepType
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-Powered Typing Practice
            </p>
          </header>

          <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Target Text</h2>
              <p className="p-4 bg-muted/50 rounded-lg font-mono backdrop-blur-md">
                The quick brown fox jumps over the lazy dog
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Type Here</h2>
              <textarea
                className="w-full h-32 p-4 bg-background/50 border rounded-lg font-mono resize-none focus:ring-2 focus:ring-primary backdrop-blur-md"
                placeholder="Start typing..."
              />
            </div>
          </div>

          <footer className="text-center text-sm text-muted-foreground mt-8">
            <p>Built with Gemini AI • Powered by React + Vite</p>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default App;
