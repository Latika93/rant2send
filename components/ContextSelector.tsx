"use client";

export const CONTEXT_OPTIONS = [
  { value: "manager", label: "Manager" },
  { value: "colleague", label: "Colleague" },
  { value: "client", label: "Client" },
  { value: "hr", label: "HR" },
  { value: "recruiter", label: "Recruiter" },
] as const;

export type ContextValue = (typeof CONTEXT_OPTIONS)[number]["value"];

interface ContextSelectorProps {
  value: ContextValue;
  onChange: (value: ContextValue) => void;
  disabled?: boolean;
}

export function ContextSelector({ value, onChange, disabled }: ContextSelectorProps) {
  return (
    <div className="w-full">
      <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
        Recipient
      </label>
      <select
        id="context"
        value={value}
        onChange={(e) => onChange(e.target.value as ContextValue)}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {CONTEXT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
