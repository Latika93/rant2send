"use client";

import { useState, useEffect } from "react";

const STEPS = [
  { icon: "🔥", text: "Analyzing your rant..." },
  { icon: "🧠", text: "Translating into corporate diplomacy..." },
  { icon: "💼", text: "Preparing sendable message..." },
];

export function Loader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s >= STEPS.length - 1 ? s : s + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const current = STEPS[Math.min(step, STEPS.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              i === step ? "bg-amber-500 scale-125 dark:bg-amber-400" : i < step ? "bg-amber-300 dark:bg-amber-600" : "bg-gray-200 dark:bg-gray-600"
            }`}
          />
        ))}
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <span className="text-lg">{current.icon}</span>
        {current.text}
      </p>
    </div>
  );
}
