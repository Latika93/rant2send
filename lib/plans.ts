export const FREE_CREDITS = 10;

export const CREDIT_PLANS = {
  starter: { price: 49, credits: 40, label: "Starter" },
  pro: { price: 99, credits: 120, label: "Pro" },
  power: { price: 299, credits: 500, label: "Power" },
} as const;

export type PlanId = keyof typeof CREDIT_PLANS;

export function isValidPlanId(id: string): id is PlanId {
  return id in CREDIT_PLANS;
}
