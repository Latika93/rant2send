"use client";

interface CreditCounterProps {
  credits?: number;
  isGuest?: boolean;
  guestRemaining?: number;
}

export function CreditCounter({ credits, isGuest, guestRemaining }: CreditCounterProps) {
  if (isGuest && guestRemaining !== undefined) {
    return (
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Free uses left: {guestRemaining}
      </span>
    );
  }
  return (
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Credits remaining: {credits ?? 0}
    </span>
  );
}
