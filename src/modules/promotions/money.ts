import type { Money } from '../events/domain';
import { money } from '../events/money';
import type { PromotionRecord, PromotionStatus } from './domain';

export function normalizePromotionCode(value: string) {
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(normalized)) {
    throw new Error('INVALID_PROMO_CODE');
  }
  return normalized;
}

export function parseBasisPoints(value: string) {
  const match = /^(\d{1,3})(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match?.[1]) throw new Error('INVALID_PERCENTAGE');
  const basisPoints =
    Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  if (
    !Number.isInteger(basisPoints) ||
    basisPoints < 1 ||
    basisPoints > 10_000
  ) {
    throw new Error('INVALID_PERCENTAGE');
  }
  return basisPoints;
}

export function formatBasisPoints(basisPoints: number) {
  const whole = Math.floor(basisPoints / 100);
  const fraction = (basisPoints % 100).toString().padStart(2, '0');
  return fraction === '00' ? `${whole}%` : `${whole}.${fraction}%`;
}

export function previewPromotion(price: Money, promotion: PromotionRecord) {
  if (promotion.type === 'FIXED_AMOUNT') {
    if (promotion.fixedAmount.currency !== price.currency) {
      throw new Error('CURRENCY_MISMATCH');
    }
    const original = BigInt(price.minorUnits);
    const discount = BigInt(promotion.fixedAmount.minorUnits);
    if (discount > original) throw new Error('DISCOUNT_EXCEEDS_PRICE');
    return money((original - discount).toString(), price.currency);
  }
  const original = BigInt(price.minorUnits);
  const discount =
    (original * BigInt(promotion.percentageBasisPoints)) / 10_000n;
  return money((original - discount).toString(), price.currency);
}

export function promotionStatus(
  promotion: PromotionRecord,
  now: Date = new Date(),
): PromotionStatus {
  if (!promotion.isActive) return 'INACTIVE';
  if (now.getTime() < Date.parse(promotion.startsAt)) return 'SCHEDULED';
  if (now.getTime() > Date.parse(promotion.endsAt)) return 'ENDED';
  return 'ACTIVE';
}
