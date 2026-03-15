"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { MessageInput } from "@/components/MessageInput";
import { ContextSelector, type ContextValue } from "@/components/ContextSelector";
import { ToneSelector, type ToneValue } from "@/components/ToneSelector";
import { ResultCard } from "@/components/ResultCard";
import { Loader } from "@/components/Loader";
import { EmotionBadge } from "@/components/EmotionBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CreditCounter } from "@/components/CreditCounter";
import { LoginModal } from "@/components/LoginModal";
import { SubscriptionModal } from "@/components/SubscriptionModal";

const GUEST_STORAGE_KEY = "guest_usage_count";
const GUEST_LIMIT = 2;

export default function Home() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [context, setContext] = useState<ContextValue>("colleague");
  const [tone, setTone] = useState<ToneValue>("polite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    setGuestCount(raw ? Math.min(parseInt(raw, 10) || 0, GUEST_LIMIT) : 0);
  }, []);

  useEffect(() => {
    if (session?.user && "credits" in session.user && typeof (session.user as { credits?: number }).credits === "number") {
      setCredits((session.user as { credits: number }).credits);
    } else if (status === "unauthenticated") {
      setCredits(null);
    }
  }, [session, status]);

  const isLoggedIn = !!session?.user;
  const guestRemaining = Math.max(0, GUEST_LIMIT - guestCount);
  const canUseAsGuest = guestRemaining > 0;

  async function handleConvert(softer = false) {
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter a message.");
      return;
    }
    if (!isLoggedIn && !canUseAsGuest) {
      setLoginModalOpen(true);
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
        credentials: "include",
        body: JSON.stringify({ message: trimmed, context, tone, softer }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "LOGIN_REQUIRED") {
          setLoginModalOpen(true);
          setError(null);
        } else if (data.error === "NO_CREDITS") {
          setSubscriptionModalOpen(true);
          setError(null);
        } else {
          setError(data.message ?? data.error ?? "Something went wrong.");
        }
        return;
      }

      if (Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        if (data.detected_emotion) setDetectedEmotion(data.detected_emotion);
        if (typeof data.remainingCredits === "number") setCredits(data.remainingCredits);
        if (!isLoggedIn && typeof window !== "undefined") {
          const next = Math.min(guestCount + 1, GUEST_LIMIT);
          localStorage.setItem(GUEST_STORAGE_KEY, String(next));
          setGuestCount(next);
        }
      } else {
        setError("Invalid response from server.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const userId = session?.user && "id" in session.user ? (session.user as { id: string }).id : null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
        <div className="mx-auto max-w-2xl px-4 py-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Rant2Send
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Turn workplace frustration into professional diplomacy.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {status !== "loading" && (
              <>
                {isLoggedIn ? (
                  <>
                    <CreditCounter credits={credits ?? 0} />
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <CreditCounter isGuest guestRemaining={guestRemaining} />
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/" })}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600"
                    >
                      Sign in
                    </button>
                  </>
                )}
                <ThemeToggle />
              </>
            )}
          </div>
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

      <LoginModal open={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
      {userId && (
        <SubscriptionModal
          open={subscriptionModalOpen}
          onClose={() => setSubscriptionModalOpen(false)}
          onSuccess={(newCredits) => setCredits(newCredits)}
          userId={userId}
        />
      )}
    </div>
  );
}
