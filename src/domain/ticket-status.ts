// Future domain vocabulary; no ticket records or transitions exist in Sprint 0.
export const ticketStatuses = [
  'UNUSED',
  'USED',
  'REFUNDED',
  'CANCELLED',
  'VOID',
] as const;
export type TicketStatus = (typeof ticketStatuses)[number];
