"use client";

const EMOTION_MAP: Record<string, string> = {
  frustrated: "😤 Frustrated",
  angry: "😠 Angry",
  "passive-aggressive": "😑 Passive Aggressive",
  sarcastic: "😅 Sarcastic",
  neutral: "😐 Neutral",
  annoyed: "😒 Annoyed",
};

interface EmotionBadgeProps {
  emotion: string;
}

export function EmotionBadge({ emotion }: EmotionBadgeProps) {
  const label = EMOTION_MAP[emotion.toLowerCase()] ?? `😐 ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
      <span>Detected tone:</span>
      <span>{label}</span>
    </div>
  );
}
