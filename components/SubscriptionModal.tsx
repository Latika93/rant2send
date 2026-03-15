"use client";

import { useState } from "react";
import { CREDIT_PLANS, FREE_CREDITS, type PlanId } from "@/lib/plans";

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newCredits: number) => void;
  userId: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
    }) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.head.appendChild(s);
  });
}

export function SubscriptionModal({ open, onClose, onSuccess, userId }: SubscriptionModalProps) {
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy(planId: PlanId) {
    setError(null);
    setLoading(planId);
    try {
      await loadRazorpayScript();
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create order");
        return;
      }
      const { orderId, amount, currency, keyId } = data;
      if (typeof window === "undefined" || !window.Razorpay) {
        setError("Razorpay not loaded. Please refresh.");
        return;
      }
      const rzp = new window.Razorpay({
        key: keyId,
        amount: Number(amount),
        currency: currency || "INR",
        order_id: orderId,
        handler: async (response) => {
          const successRes = await fetch("/api/payment-success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            }),
          });
          const successData = await successRes.json();
          if (successRes.ok && successData.success) {
            onSuccess(successData.remainingCredits);
            onClose();
          } else {
            setError(successData.error ?? "Payment verification failed");
          }
        },
      });
      rzp.open();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  if (!open) return null;

  const paidPlans: { id: PlanId; price: number; credits: number; label: string }[] = [
    { id: "starter", ...CREDIT_PLANS.starter },
    { id: "pro", ...CREDIT_PLANS.pro },
    { id: "power", ...CREDIT_PLANS.power },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} aria-hidden />
      <div className="relative rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Get more credits</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Choose a plan to continue using the translator.</p>
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 p-3 bg-gray-50 dark:bg-gray-700/50">
            <p className="font-medium text-gray-900 dark:text-white">Free → {FREE_CREDITS} uses</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">Included on signup</span>
          </div>
          {paidPlans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-600 p-3"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{plan.label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">₹{plan.price} → {plan.credits} uses</p>
              </div>
              <button
                type="button"
                onClick={() => handleBuy(plan.id)}
                disabled={loading !== null}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
              >
                {loading === plan.id ? "Opening..." : "Buy Plan"}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-gray-100 py-2 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
