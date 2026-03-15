import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not defined in environment variables.");
}

export const openai = new OpenAI({ apiKey });

export async function rewriteWithOpenAI(
  prompt: string
): Promise<[string, string, string]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty response from OpenAI.");
  }

  const stripNumber = (s: string) => s.replace(/^\d+[\.\)]\s*/, "").trim();
  const rawBlocks = content.split(/\n\s*\n/).map((s) => stripNumber(s.trim())).filter(Boolean);
  let suggestions: string[] = [];

  if (rawBlocks.length >= 3) {
    suggestions = rawBlocks.slice(0, 3);
  } else if (rawBlocks.length > 0) {
    suggestions = rawBlocks;
    const lines = content.split("\n").map((s) => stripNumber(s.trim())).filter(Boolean);
    for (const line of lines) {
      if (suggestions.length >= 3) break;
      if (line && !suggestions.includes(line)) suggestions.push(line);
    }
  } else {
    const lines = content.split("\n").map((s) => stripNumber(s.trim())).filter(Boolean);
    suggestions = lines.slice(0, 3);
  }

  const [a, b, c] = [suggestions[0] ?? "", suggestions[1] ?? "", suggestions[2] ?? ""];
  if (!a) {
    throw new Error("Could not parse exactly 3 suggestions from OpenAI response.");
  }
  return [a, b || a, c || b || a];
}
