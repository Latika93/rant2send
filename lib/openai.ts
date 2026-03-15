import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not defined in environment variables.");
}

export const openai = new OpenAI({ apiKey });

const EMOTION_PREFIX = "DETECTED_EMOTION:";

export interface RewriteResult {
  suggestions: [string, string, string];
  detectedEmotion: string;
}

export async function rewriteWithOpenAI(prompt: string): Promise<RewriteResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from OpenAI.");
  }

  const lines = content.split("\n").map((s) => s.trim());
  let detectedEmotion = "neutral";
  const restLines: string[] = [];

  for (const line of lines) {
    if (line.toUpperCase().startsWith(EMOTION_PREFIX)) {
      const emotion = line.slice(EMOTION_PREFIX.length).trim().toLowerCase();
      if (emotion) detectedEmotion = emotion;
    } else if (line) {
      restLines.push(line.replace(/^\d+[\.\)]\s*/, "").trim());
    }
  }

  const stripNumber = (s: string) => s.replace(/^\d+[\.\)]\s*/, "").trim();
  const contentLines = content
    .split("\n")
    .map((s) => stripNumber(s.trim()))
    .filter((s) => s && !s.toUpperCase().startsWith(EMOTION_PREFIX));

  const rawBlocks = content
    .split(/\n\s*\n/)
    .map((s) => stripNumber(s.trim()))
    .filter((s) => s && !s.toUpperCase().startsWith(EMOTION_PREFIX));

  let suggestions: string[] = [];
  if (rawBlocks.length >= 3) {
    suggestions = rawBlocks.slice(0, 3);
  } else if (contentLines.length >= 3) {
    suggestions = contentLines.slice(0, 3);
  } else if (rawBlocks.length > 0) {
    for (const block of rawBlocks) {
      const lines = block.split("\n").map((s) => stripNumber(s.trim())).filter(Boolean);
      suggestions.push(...lines);
      if (suggestions.length >= 3) break;
    }
    suggestions = suggestions.slice(0, 3);
  }
  if (suggestions.length < 3 && contentLines.length > 0) {
    suggestions = contentLines.slice(0, 3);
  }

  const [a, b, c] = [suggestions[0] ?? "", suggestions[1] ?? "", suggestions[2] ?? ""];
  if (!a) {
    throw new Error("Could not parse exactly 3 suggestions from OpenAI response.");
  }
  return {
    suggestions: [a, b || a, c || b || a],
    detectedEmotion,
  };
}
