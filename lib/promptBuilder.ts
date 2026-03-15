const CONTEXTS = ["manager", "colleague", "client", "hr", "recruiter"] as const;
const TONES = ["polite", "neutral", "assertive", "diplomatic"] as const;

export type Context = (typeof CONTEXTS)[number];
export type Tone = (typeof TONES)[number];

export function isValidContext(s: string): s is Context {
  return CONTEXTS.includes(s as Context);
}

export function isValidTone(s: string): s is Tone {
  return TONES.includes(s as Tone);
}

export function buildRewritePrompt(message: string, context: Context, tone: Tone): string {
  return `Convert the following workplace message into professional and respectful communication.

Context: speaking to a ${context}

Tone: ${tone}

Rules:
- Keep the same meaning
- Remove emotional or aggressive language
- Make it suitable for corporate communication
- Write clearly and professionally
- Generate exactly 3 variations

Message:
"${message}"

Return only the rewritten messages, one per line. Do not number them or add labels. Each line is one complete professional message.`;
}
