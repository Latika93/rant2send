import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import Razorpay from "razorpay";
import { CREDIT_PLANS, isValidPlanId } from "@/lib/plans";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set");
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token && "userId" in token ? (token as { userId: string }).userId : null;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;
    if (!planId || !isValidPlanId(planId)) {
      return NextResponse.json(
        { error: "Invalid plan. Use starter, pro, or power." },
        { status: 400 }
      );
    }

    const plan = CREDIT_PLANS[planId];
    const amountPaise = plan.price * 100;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment is not configured." },
        { status: 503 }
      );
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `credits_${planId}_${Date.now()}`,
      notes: { userId, planId, credits: String(plan.credits) },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
}
