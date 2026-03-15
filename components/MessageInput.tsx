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
  const hasContent = value.length > 0;

  return (
    <div className="w-full">
      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Say what you really want to say
      </label>
      <textarea
        id="message"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
        disabled={disabled}
        placeholder="Type the message you wish you could send... we'll make it corporate-safe."
        rows={5}
        className={`w-full rounded-lg border-2 px-3 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-y min-h-[120px] transition-colors dark:text-gray-100 dark:placeholder-gray-400 ${
          error ? "border-red-400 bg-red-50/30 dark:border-red-500 dark:bg-red-950/20" : hasContent ? "border-amber-300/80 bg-amber-50/20 dark:border-amber-600 dark:bg-amber-950/30" : "border-gray-200 dark:border-gray-600"
        } ${disabled ? "bg-gray-100 cursor-not-allowed dark:bg-gray-700" : "bg-white dark:bg-gray-700"}`}
      />
      <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className={error ? "text-red-600 dark:text-red-400" : ""}>{error ?? ""}</span>
        <span>{remaining} characters left</span>
      </div>
    </div>
  );
}
