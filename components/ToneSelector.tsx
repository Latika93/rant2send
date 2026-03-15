"use client";

export const TONE_OPTIONS = [
  { value: "polite", label: "Polite" },
  { value: "neutral", label: "Neutral" },
  { value: "assertive", label: "Assertive" },
  { value: "diplomatic", label: "Diplomatic" },
] as const;

export type ToneValue = (typeof TONE_OPTIONS)[number]["value"];

interface ToneSelectorProps {
  value: ToneValue;
  onChange: (value: ToneValue) => void;
  disabled?: boolean;
}

export function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div className="w-full">
      <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
        Tone
      </label>
      <select
        id="tone"
        value={value}
        onChange={(e) => onChange(e.target.value as ToneValue)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {TONE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
