export const businessConfiguration = {
  label: 'PROTOTYPE DEFAULTS — NOT FINAL BUSINESS POLICY',
  status: 'unconfigured',
  platformFee: null,
  feePayer: null,
  payoutTiming: null,
  refundPolicy: null,
  reservePolicy: null,
} as const;

// Null means undecided, never zero fees or an automatic approval.
// Founder 1 must approve policy before financial behavior is implemented.
