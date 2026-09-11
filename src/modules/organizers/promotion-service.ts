import type { EventRecord, Money } from '../events/domain';
import { assertCurrencyForCountry } from '../events/money-input';
import type {
  FixedAmountPromotion,
  PercentagePromotion,
  PromotionRecord,
} from '../promotions/domain';
import { normalizePromotionCode } from '../promotions/money';
import { WorkspaceError } from './errors';
import { requireOwnedEvent } from './event-service';
import type { WorkspaceRepositories } from './repository';
import { cleanOptional, cleanRequired, isValidDate } from './validation';

export type PromotionInput = {
  code: string;
  name: string;
  startsAt: string;
  endsAt: string;
  usageLimit?: number;
  isActive: boolean;
  attributionLabel?: string;
  ticketTierIds: readonly string[];
} & (
  | { type: 'PERCENTAGE'; percentageBasisPoints: number }
  | { type: 'FIXED_AMOUNT'; fixedAmount: Money }
);

function validatePromotion(
  input: PromotionInput,
  event: EventRecord,
):
  | Omit<PercentagePromotion, 'id' | 'eventId'>
  | Omit<FixedAmountPromotion, 'id' | 'eventId'> {
  if (
    !isValidDate(input.startsAt) ||
    !isValidDate(input.endsAt) ||
    Date.parse(input.endsAt) <= Date.parse(input.startsAt)
  ) {
    throw new WorkspaceError('INVALID_DATES');
  }
  if (
    input.usageLimit !== undefined &&
    (!Number.isSafeInteger(input.usageLimit) || input.usageLimit <= 0)
  ) {
    throw new WorkspaceError('INVALID_USAGE_LIMIT');
  }
  const ticketTierIds = [...new Set(input.ticketTierIds)];
  if (
    ticketTierIds.some(
      (tierId) => !event.ticketTiers.some((tier) => tier.id === tierId),
    )
  ) {
    throw new WorkspaceError('CROSS_EVENT_TIER');
  }
  let code: string;
  try {
    code = normalizePromotionCode(input.code);
  } catch {
    throw new WorkspaceError('INVALID_PROMOTION');
  }
  const attributionLabel = cleanOptional(input.attributionLabel, 120);
  const base = {
    code,
    name: cleanRequired(input.name, 120),
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString(),
    ...(input.usageLimit === undefined ? {} : { usageLimit: input.usageLimit }),
    isActive: input.isActive,
    ...(attributionLabel ? { attributionLabel } : {}),
    ticketTierIds,
  };

  if (input.type === 'PERCENTAGE') {
    if (
      !Number.isSafeInteger(input.percentageBasisPoints) ||
      input.percentageBasisPoints < 1 ||
      input.percentageBasisPoints > 10_000
    ) {
      throw new WorkspaceError('INVALID_PROMOTION');
    }
    return {
      ...base,
      type: 'PERCENTAGE',
      percentageBasisPoints: input.percentageBasisPoints,
    };
  }

  try {
    assertCurrencyForCountry(
      input.fixedAmount.currency,
      event.venue.countryCode,
    );
  } catch {
    throw new WorkspaceError('CURRENCY_MISMATCH');
  }
  if (BigInt(input.fixedAmount.minorUnits) <= 0n) {
    throw new WorkspaceError('INVALID_PROMOTION');
  }
  const applicableTiers = ticketTierIds.length
    ? event.ticketTiers.filter((tier) => ticketTierIds.includes(tier.id))
    : event.ticketTiers;
  if (
    applicableTiers.some(
      (tier) =>
        BigInt(input.fixedAmount.minorUnits) > BigInt(tier.price.minorUnits),
    )
  ) {
    throw new WorkspaceError('DISCOUNT_EXCEEDS_PRICE');
  }
  return { ...base, type: 'FIXED_AMOUNT', fixedAmount: input.fixedAmount };
}

export async function saveOrganizerPromotion(
  currentOrganizerId: string,
  eventId: string,
  promotionId: string | undefined,
  input: PromotionInput,
  repositories: WorkspaceRepositories,
) {
  const event = await requireOwnedEvent(
    currentOrganizerId,
    eventId,
    repositories,
  );
  if (event.ticketTiers.length === 0) {
    throw new WorkspaceError('TIER_REQUIRED_TO_PUBLISH');
  }
  const validated = validatePromotion(input, event);
  const existingPromotions = await repositories.promotions.listByEvent(
    event.id,
  );
  if (
    existingPromotions.some(
      (promotion) =>
        promotion.id !== promotionId && promotion.code === validated.code,
    )
  ) {
    throw new WorkspaceError('DUPLICATE_PROMO_CODE');
  }
  if (promotionId) {
    const existing = await repositories.promotions.findById(promotionId);
    if (!existing) throw new WorkspaceError('NOT_FOUND');
    if (existing.eventId !== event.id) throw new WorkspaceError('NOT_OWNED');
  }
  const promotion: PromotionRecord = {
    id: promotionId ?? crypto.randomUUID(),
    eventId: event.id,
    ...validated,
  } as PromotionRecord;
  await repositories.promotions.save(promotion);
  return promotion;
}

export function organizerEventCounts(
  events: readonly EventRecord[],
  promotions: readonly PromotionRecord[],
  now: Date = new Date(),
) {
  return {
    totalEvents: events.length,
    publishedEvents: events.filter((event) => event.status === 'PUBLISHED')
      .length,
    draftEvents: events.filter((event) => event.status === 'DRAFT').length,
    upcomingEvents: events.filter(
      (event) => Date.parse(event.endDateTime) >= now.getTime(),
    ).length,
    ticketTiers: events.reduce(
      (sum, event) => sum + event.ticketTiers.length,
      0,
    ),
    activePromotions: promotions.filter((promotion) => promotion.isActive)
      .length,
  };
}
