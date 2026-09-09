import type { TicketAvailability, TicketTierRecord } from './domain';

export function ticketAvailability(
  tier: TicketTierRecord,
  now: Date = new Date(),
): TicketAvailability {
  const currentTime = now.getTime();
  if (currentTime < Date.parse(tier.salesStart)) return 'SALE_NOT_STARTED';
  if (currentTime > Date.parse(tier.salesEnd)) return 'SALE_ENDED';
  if (tier.availableQuantity === 0) return 'SOLD_OUT';
  return 'AVAILABLE';
}

export function eventAvailability(
  tiers: readonly TicketTierRecord[],
  now: Date = new Date(),
): TicketAvailability {
  const states = tiers.map((tier) => ticketAvailability(tier, now));
  if (states.includes('AVAILABLE')) return 'AVAILABLE';
  if (states.includes('SALE_NOT_STARTED')) return 'SALE_NOT_STARTED';
  if (states.includes('SOLD_OUT')) return 'SOLD_OUT';
  return 'SALE_ENDED';
}
