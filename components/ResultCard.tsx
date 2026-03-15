"use client";

import { useState } from "react";
import { TONE_EMOJI, type ToneValue } from "./ToneSelector";

interface ResultCardProps {
  text: string;
  tone: ToneValue;
}

export function ResultCard({ text, tone }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const emoji = TONE_EMOJI[tone];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" aria-hidden>{emoji}</span>
      </div>
      <div className="border-l-2 border-gray-200 dark:border-gray-600 pl-3 py-1 mb-4">
        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
          {text}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
      >
        {copied ? "Copied!" : "Copy message"}
      </button>
    </div>
  );
}
