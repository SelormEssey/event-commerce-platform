import type { CurrencyCode } from '../../config/countries';
import type { Money } from '../events/domain';

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT';

type PromotionBase = {
  id: string;
  eventId: string;
  code: string;
  name: string;
  startsAt: string;
  endsAt: string;
  usageLimit?: number;
  isActive: boolean;
  attributionLabel?: string;
  ticketTierIds: readonly string[];
};

export type PercentagePromotion = PromotionBase & {
  type: 'PERCENTAGE';
  percentageBasisPoints: number;
};

export type FixedAmountPromotion = PromotionBase & {
  type: 'FIXED_AMOUNT';
  fixedAmount: Money & { currency: CurrencyCode };
};

export type PromotionRecord = PercentagePromotion | FixedAmountPromotion;

export type PromotionStatus = 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'ENDED';
