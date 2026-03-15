"use client";

import { useState } from "react";

interface ResultCardProps {
  text: string;
  index: number;
}

export function ResultCard({ text, index }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-gray-800 whitespace-pre-wrap flex-1 text-sm leading-relaxed">
          {text}
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-500">Suggestion {index + 1}</p>
    </div>
  );
}
