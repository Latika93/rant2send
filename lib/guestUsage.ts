const GUEST_LIMIT = 2;
const store = new Map<string, number>();

export function getGuestUsageCount(ip: string): number {
  return store.get(ip) ?? 0;
}

export function incrementGuestUsage(ip: string): void {
  const current = store.get(ip) ?? 0;
  store.set(ip, current + 1);
}

export function canGuestUse(ip: string): boolean {
  return getGuestUsageCount(ip) < GUEST_LIMIT;
}
