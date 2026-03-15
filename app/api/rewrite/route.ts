import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import { buildRewritePrompt, isValidContext, isValidTone } from "@/lib/promptBuilder";
import { rewriteWithOpenAI } from "@/lib/openai";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { deductCredit } from "@/lib/credits";
import { rateLimit } from "@/lib/rateLimit";
import { canGuestUse, incrementGuestUsage } from "@/lib/guestUsage";

const MAX_MESSAGE_LENGTH = 500;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest) {
  try {
    if (request.method !== "POST") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const ip = getClientIp(request);
    const userId = token && "userId" in token ? (token as { userId: string }).userId : null;
    const rateLimitKey = userId ?? ip;
    const { ok: rateLimitOk } = rateLimit(rateLimitKey);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "RATE_LIMIT", message: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, context, tone, softer } = body;

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

    const isLoggedIn = !!userId;
    if (!isLoggedIn) {
      if (!canGuestUse(ip)) {
        return NextResponse.json(
          { error: "LOGIN_REQUIRED", message: "Sign in to continue. You get 10 free credits." },
          { status: 403 }
        );
      }
    } else {
      await connectDB();
      const user = await User.findById(userId).select("credits").lean() as { credits: number } | null;
      const credits = user?.credits ?? 0;
      if (credits <= 0) {
        return NextResponse.json(
          { error: "NO_CREDITS", message: "No credits left. Buy more to continue." },
          { status: 403 }
        );
      }
    }

    const prompt = buildRewritePrompt(trimmed, context, tone, !!softer);
    const { suggestions, detectedEmotion } = await rewriteWithOpenAI(prompt);

    if (!softer) {
      await connectDB();
      await Message.create({
        originalMessage: trimmed,
        rewrittenMessages: suggestions,
        context,
        tone,
      });
    }

    let remainingCredits: number | undefined;
    if (isLoggedIn && userId) {
      const result = await deductCredit(userId);
      if (!result.success) {
        return NextResponse.json(
          { error: "NO_CREDITS", message: "Credits could not be deducted." },
          { status: 403 }
        );
      }
      remainingCredits = result.remaining;
    } else {
      incrementGuestUsage(ip);
    }

    return NextResponse.json({
      suggestions,
      detected_emotion: detectedEmotion,
      ...(remainingCredits !== undefined && { remainingCredits }),
    });
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
