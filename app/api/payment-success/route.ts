import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getToken } from "next-auth/jwt";
import { addCredits } from "@/lib/credits";
import { CREDIT_PLANS, isValidPlanId } from "@/lib/plans";

const keySecret = process.env.RAZORPAY_KEY_SECRET;

function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token && "userId" in token ? (token as { userId: string }).userId : null;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (!isValidPlanId(planId)) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    if (!keySecret) {
      return NextResponse.json({ error: "Payment not configured." }, { status: 503 });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );
    if (!isValid) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const plan = CREDIT_PLANS[planId];
    const newBalance = await addCredits(userId, plan.credits);

    return NextResponse.json({
      success: true,
      creditsAdded: plan.credits,
      remainingCredits: newBalance,
    });
  } catch (err) {
    console.error("Payment success error:", err);
    return NextResponse.json(
      { error: "Failed to process payment." },
      { status: 500 }
    );
  }
}
