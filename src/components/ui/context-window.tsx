import React, { useState, useCallback, useRef, useEffect } from "react";
import { Command } from "cmdk";
import { Search, X, ExternalLink, Code, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHotkeys } from "@/hooks/use-hotkeys";

interface ContextWindowProps {
  className?: string;
}

export function ContextWindow({ className }: ContextWindowProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle with ⌘K
  useHotkeys("meta+k", (e) => {
    e.preventDefault();
    setOpen((open) => !open);
  });

  // Close with escape
  useHotkeys("escape", () => {
    if (open) setOpen(false);
  });

  const searchPerplexity = useCallback(async (query: string) => {
    if (!query) return;

    setLoading(true);
    try {
      // Replace with your actual Perplexity API endpoint
      const response = await fetch(
        `/api/perplexity-search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error("Perplexity search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        searchPerplexity(search);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, searchPerplexity]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-0 top-[10%] mx-auto max-w-2xl overflow-hidden rounded-xl bg-background shadow-lg border border-border">
        <Command
          className={cn(
            "flex h-full w-full flex-col overflow-hidden",
            className
          )}
          loop
        >
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="Search documentation, APIs, or ask questions..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="ml-2 p-1 rounded-md hover:bg-accent"
              >
                <X className="h-4 w-4 opacity-50" />
              </button>
            )}
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm">
              {loading ? "Searching..." : "No results found."}
            </Command.Empty>
            {results.map((result, index) => (
              <Command.Item
                key={index}
                value={result.title}
                className="flex items-center px-4 py-2 hover:bg-accent cursor-pointer"
                onSelect={() => {
                  // Handle result selection
                  if (result.url) {
                    window.open(result.url, "_blank");
                  }
                }}
              >
                {result.type === "documentation" ? (
                  <BookOpen className="mr-2 h-4 w-4" />
                ) : (
                  <Code className="mr-2 h-4 w-4" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{result.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {result.description}
                  </span>
                </div>
                {result.url && (
                  <ExternalLink className="ml-auto h-4 w-4 opacity-50" />
                )}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
