const CONTEXTS = ["manager", "colleague", "client", "hr", "recruiter"] as const;
const TONES = ["polite", "neutral", "assertive", "diplomatic"] as const;
const EMOTIONS = ["frustrated", "angry", "passive-aggressive", "sarcastic", "neutral", "annoyed"] as const;

export type Context = (typeof CONTEXTS)[number];
export type Tone = (typeof TONES)[number];
export type DetectedEmotion = (typeof EMOTIONS)[number];

export function isValidContext(s: string): s is Context {
  return CONTEXTS.includes(s as Context);
}

export function isValidTone(s: string): s is Tone {
  return TONES.includes(s as Tone);
}

const CONTEXT_GUIDELINES: Record<Context, string> = {
  manager: "Respectful, diplomatic, collaborative.",
  colleague: "Friendly, cooperative, professional.",
  client: "Polished, calm, customer-focused.",
  hr: "Formal, neutral, precise.",
  recruiter: "Positive, professional, concise.",
};

const TONE_LEVELS: Record<Tone, string> = {
  polite: "Very respectful and soft language.",
  neutral: "Professional but straightforward.",
  assertive: "Clear and direct while remaining respectful.",
  diplomatic: "Carefully worded to avoid blame or conflict.",
};

function baseInstructions(softer: boolean): string {
  return `You are an expert in professional workplace communication.

Your task is to translate emotionally written workplace messages into professional, respectful corporate communication.

Context:
The user has written a message expressing frustration or emotion that cannot be sent directly in a professional environment.

Your job is to preserve the meaning of the message while transforming the tone so it can be safely sent in a workplace setting.
${softer ? "\nThis time, make the output even more polite and softened—one step nicer than a standard professional rewrite.\n" : ""}

Instructions:
- Keep the original meaning of the message.
- Remove aggressive or emotional language.
- Do not sound robotic or overly corporate.
- Make the message sound natural and professional.
- Avoid clichés like "Hope this finds you well."
- Ensure the message feels realistic for Slack, email, or workplace chat.
- Do not add unnecessary explanations.
- Generate exactly 3 different rewritten versions.
- Each version should feel slightly different in wording but maintain the requested tone.`;
}

export function buildRewritePrompt(
  message: string,
  context: Context,
  tone: Tone,
  softer = false
): string {
  return `${baseInstructions(softer)}

Recipient: ${context}
Tone style: ${tone}

Recipient guidelines:
${context}: ${CONTEXT_GUIDELINES[context]}

Tone levels:
${tone}: ${TONE_LEVELS[tone]}

User message:
"${message}"

Respond with EXACTLY this format—no other text:
Line 1: DETECTED_EMOTION: <one of: frustrated, angry, passive-aggressive, sarcastic, neutral, annoyed>
Line 2: (blank)
Lines 3–5: One complete rewritten message per line (exactly 3 messages). Do not number them.`;
}
