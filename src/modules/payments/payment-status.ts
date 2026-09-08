// Internal vocabulary, not a claim about any provider's response format.
export const paymentStatuses = [
  'PENDING',
  'SUCCESSFUL',
  'FAILED',
  'REFUNDED',
  'REVERSED',
] as const;
export type PaymentStatus = (typeof paymentStatuses)[number];
