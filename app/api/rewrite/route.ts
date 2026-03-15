import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { buildRewritePrompt, isValidContext, isValidTone } from "@/lib/promptBuilder";
import { rewriteWithOpenAI } from "@/lib/openai";
import { Message } from "@/models/Message";

const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, tone } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string." },
        { status: 400 }
      );
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be at most ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (!context || !isValidContext(context)) {
      return NextResponse.json(
        { error: "Valid context is required (manager, colleague, client, hr, recruiter)." },
        { status: 400 }
      );
    }

    if (!tone || !isValidTone(tone)) {
      return NextResponse.json(
        { error: "Valid tone is required (polite, neutral, assertive, diplomatic)." },
        { status: 400 }
      );
    }

    const prompt = buildRewritePrompt(trimmed, context, tone);
    const suggestions = await rewriteWithOpenAI(prompt);

    await connectDB();
    await Message.create({
      originalMessage: trimmed,
      rewrittenMessages: suggestions,
      context,
      tone,
    });

    return NextResponse.json({ suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("rate limit") || message.includes("Rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }
    if (message.includes("OPENAI") || message.includes("OpenAI")) {
      return NextResponse.json(
        { error: "AI service error. Please check your API key and try again." },
        { status: 502 }
      );
    }
    console.error("Rewrite API error:", err);
    return NextResponse.json(
      { error: "Failed to rewrite message. Please try again." },
      { status: 500 }
    );
  }
}
