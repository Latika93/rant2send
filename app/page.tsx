"use client";

import { useState } from "react";
import { MessageInput } from "@/components/MessageInput";
import { ContextSelector, type ContextValue } from "@/components/ContextSelector";
import { ToneSelector, type ToneValue } from "@/components/ToneSelector";
import { ResultCard } from "@/components/ResultCard";
import { Loader } from "@/components/Loader";
import { EmotionBadge } from "@/components/EmotionBadge";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState<ContextValue>("colleague");
  const [tone, setTone] = useState<ToneValue>("polite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);

  async function handleConvert(softer = false) {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter a message.");
      return;
    }
    setError(null);
    if (!softer) {
      setSuggestions([]);
      setDetectedEmotion(null);
    }
    setLoading(true);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, context, tone, softer }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        if (data.detected_emotion) setDetectedEmotion(data.detected_emotion);
      } else {
        setError("Invalid response from server.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <div className="mx-auto max-w-2xl px-4 py-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Professional Message Translator
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Turn workplace frustration into professional diplomacy.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <MessageInput
              value={message}
              onChange={(v) => { setMessage(v); if (error) setError(null); }}
              disabled={loading}
              error={error ?? undefined}
            />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ContextSelector
                value={context}
                onChange={setContext}
                disabled={loading}
              />
              <ToneSelector value={tone} onChange={setTone} disabled={loading} />
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleConvert(false)}
                disabled={loading}
                className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:focus:ring-offset-gray-800"
              >
                ↓ Translate
              </button>
            </div>
          </section>

          {loading && (
            <section className="rounded-xl border border-amber-100 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧠</span>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Corporate Translator</h2>
              </div>
              <Loader />
            </section>
          )}

          {!loading && suggestions.length > 0 && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💼</span>
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">What you can actually send</h2>
              </div>
              {detectedEmotion && (
                <div className="mb-4">
                  <EmotionBadge emotion={detectedEmotion} />
                </div>
              )}
              <div className="space-y-4">
                {suggestions.map((text, i) => (
                  <ResultCard key={i} text={text} tone={tone} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleConvert(true)}
                className="mt-4 w-full rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-colors dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/50 dark:focus:ring-offset-gray-800"
              >
                🎲 Make it even nicer
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
