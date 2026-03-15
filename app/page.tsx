"use client";

import { useState } from "react";
import { MessageInput } from "@/components/MessageInput";
import { ContextSelector, type ContextValue } from "@/components/ContextSelector";
import { ToneSelector, type ToneValue } from "@/components/ToneSelector";
import { ResultCard } from "@/components/ResultCard";
import { Loader } from "@/components/Loader";

export default function Home() {
  const [message, setMessage] = useState("");
  const [context, setContext] = useState<ContextValue>("colleague");
  const [tone, setTone] = useState<ToneValue>("polite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function handleConvert() {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter a message.");
      return;
    }
    setError(null);
    setSuggestions([]);
    setLoading(true);

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, context, tone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
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
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Professional Message Translator
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Convert emotionally written workplace messages into professional corporate communication.
          </p>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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

          <div className="mt-6">
            <button
              type="button"
              onClick={handleConvert}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Convert
            </button>
          </div>

          {loading && <Loader />}

          {!loading && suggestions.length > 0 && (
            <div className="mt-8 space-y-4">
              <h2 className="text-sm font-medium text-gray-700">Professional suggestions</h2>
              <div className="space-y-3">
                {suggestions.map((text, i) => (
                  <ResultCard key={i} text={text} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
