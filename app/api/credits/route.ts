import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getCredits } from "@/lib/credits";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token && "userId" in token ? (token as { userId: string }).userId : null;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const credits = await getCredits(userId);
    return NextResponse.json({ credits });
  } catch {
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 });
  }
}
