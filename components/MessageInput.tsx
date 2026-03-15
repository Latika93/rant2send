"use client";

const MAX_LENGTH = 2000;

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function MessageInput({ value, onChange, disabled, error }: MessageInputProps) {
  const remaining = MAX_LENGTH - value.length;

  return (
    <div className="w-full">
      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
        Your message
      </label>
      <textarea
        id="message"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
        disabled={disabled}
        placeholder="e.g. Why is this still not done? I asked for this yesterday."
        rows={5}
        className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[120px] ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>{error ?? ""}</span>
        <span>{remaining} characters left</span>
      </div>
    </div>
  );
}
