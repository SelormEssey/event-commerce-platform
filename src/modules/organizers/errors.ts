export type WorkspaceErrorCode =
  | 'NOT_FOUND'
  | 'NOT_OWNED'
  | 'INVALID_TEXT'
  | 'INVALID_DATES'
  | 'INVALID_COUNTRY'
  | 'INVALID_CAPACITY'
  | 'CAPACITY_BELOW_AVAILABLE'
  | 'INVALID_SALES_WINDOW'
  | 'CURRENCY_MISMATCH'
  | 'INVALID_MONEY'
  | 'TIER_REQUIRED_TO_PUBLISH'
  | 'FINAL_PUBLISHED_TIER'
  | 'TIER_HAS_PROMOTIONS'
  | 'STATUS_NOT_EDITABLE'
  | 'INVALID_PROMOTION'
  | 'INVALID_USAGE_LIMIT'
  | 'DUPLICATE_PROMO_CODE'
  | 'CROSS_EVENT_TIER'
  | 'DISCOUNT_EXCEEDS_PRICE';

export class WorkspaceError extends Error {
  constructor(public readonly code: WorkspaceErrorCode) {
    super(code);
  }
}
