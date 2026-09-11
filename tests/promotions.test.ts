import { describe, expect, it } from 'vitest';
import { money } from '../src/modules/events/money';
import { saveOrganizerPromotion } from '../src/modules/organizers/promotion-service';
import {
  formatBasisPoints,
  normalizePromotionCode,
  parseBasisPoints,
  previewPromotion,
  promotionStatus,
} from '../src/modules/promotions/money';
import { createPrototypeRepositories } from '../src/modules/prototype-data/repositories';

describe('exact promotion preview math', () => {
  const percentage = {
    id: 'percentage',
    eventId: 'event',
    code: 'SAVE25',
    name: 'Quarter off',
    type: 'PERCENTAGE' as const,
    percentageBasisPoints: 2500,
    startsAt: '2026-01-01T00:00:00.000Z',
    endsAt: '2027-01-01T00:00:00.000Z',
    isActive: true,
    ticketTierIds: [],
  };

  it('uses basis points and integer arithmetic', () => {
    expect(previewPromotion(money('1001', 'SLE'), percentage)).toEqual(
      money('751', 'SLE'),
    );
    expect(parseBasisPoints('12.50')).toBe(1250);
    expect(formatBasisPoints(1250)).toBe('12.50%');
  });

  it('allows a fixed amount equal to price and rejects an excess', () => {
    const fixed = {
      ...percentage,
      type: 'FIXED_AMOUNT' as const,
      fixedAmount: money('1000', 'SLE'),
    };
    expect(previewPromotion(money('1000', 'SLE'), fixed)).toEqual(
      money('0', 'SLE'),
    );
    expect(() => previewPromotion(money('999', 'SLE'), fixed)).toThrow(
      'DISCOUNT_EXCEEDS_PRICE',
    );
  });

  it('normalizes codes and reports schedule state without redemption behavior', () => {
    expect(normalizePromotionCode(' save_20 ')).toBe('SAVE_20');
    expect(promotionStatus(percentage, new Date('2025-12-01'))).toBe(
      'SCHEDULED',
    );
    expect(promotionStatus(percentage, new Date('2026-06-01'))).toBe('ACTIVE');
    expect(promotionStatus({ ...percentage, isActive: false })).toBe(
      'INACTIVE',
    );
  });
});

describe('promotion service rules', () => {
  it('enforces ownership, event-local tiers, fixed limits, and code uniqueness', async () => {
    const repositories = createPrototypeRepositories();
    const events = await repositories.events.list();
    const event = events.find(
      (candidate) => candidate.slug === 'afterglow-sessions-freetown',
    )!;
    const other = events.find(
      (candidate) => candidate.slug === 'golden-hour-assembly',
    )!;
    const shared = {
      code: 'NEWCODE',
      name: 'Prototype configuration',
      startsAt: '2026-10-01T00:00:00.000Z',
      endsAt: '2027-01-01T00:00:00.000Z',
      isActive: true,
      ticketTierIds: [] as string[],
    };

    await expect(
      saveOrganizerPromotion(
        other.organizerId!,
        event.id,
        undefined,
        {
          ...shared,
          type: 'PERCENTAGE',
          percentageBasisPoints: 1000,
        },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'NOT_OWNED' });

    await expect(
      saveOrganizerPromotion(
        event.organizerId!,
        event.id,
        undefined,
        {
          ...shared,
          ticketTierIds: [other.ticketTiers[0]!.id],
          type: 'PERCENTAGE',
          percentageBasisPoints: 1000,
        },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'CROSS_EVENT_TIER' });

    await expect(
      saveOrganizerPromotion(
        event.organizerId!,
        event.id,
        undefined,
        {
          ...shared,
          type: 'FIXED_AMOUNT',
          fixedAmount: money('12001', 'SLE'),
        },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'DISCOUNT_EXCEEDS_PRICE' });

    await saveOrganizerPromotion(
      event.organizerId!,
      event.id,
      undefined,
      {
        ...shared,
        type: 'PERCENTAGE',
        percentageBasisPoints: 1000,
      },
      repositories,
    );
    await expect(
      saveOrganizerPromotion(
        event.organizerId!,
        event.id,
        undefined,
        {
          ...shared,
          code: 'newcode',
          type: 'PERCENTAGE',
          percentageBasisPoints: 2000,
        },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'DUPLICATE_PROMO_CODE' });
  });

  it('accepts a full fixed discount for one applicable tier', async () => {
    const repositories = createPrototypeRepositories();
    const event = (await repositories.events.list()).find(
      (candidate) => candidate.slug === 'afterglow-sessions-freetown',
    )!;
    const tier = event.ticketTiers[0]!;
    const promotion = await saveOrganizerPromotion(
      event.organizerId!,
      event.id,
      undefined,
      {
        code: 'FULLTIER',
        name: 'Full tier preview',
        startsAt: '2026-10-01T00:00:00.000Z',
        endsAt: '2027-01-01T00:00:00.000Z',
        isActive: true,
        ticketTierIds: [tier.id],
        type: 'FIXED_AMOUNT',
        fixedAmount: tier.price,
      },
      repositories,
    );
    expect(promotion.type).toBe('FIXED_AMOUNT');
  });

  it('allows the same normalized code on different events', async () => {
    const repositories = createPrototypeRepositories();
    const events = (await repositories.events.list()).filter(
      (event) => event.ticketTiers.length > 0,
    );
    const input = {
      code: 'SHARED10',
      name: 'Event-local code',
      startsAt: '2026-10-01T00:00:00.000Z',
      endsAt: '2027-01-01T00:00:00.000Z',
      isActive: true,
      ticketTierIds: [] as string[],
      type: 'PERCENTAGE' as const,
      percentageBasisPoints: 1000,
    };
    for (const event of events.slice(0, 2)) {
      await expect(
        saveOrganizerPromotion(
          event.organizerId!,
          event.id,
          undefined,
          input,
          repositories,
        ),
      ).resolves.toMatchObject({ code: 'SHARED10' });
    }
  });

  it('rejects invalid schedules, usage limits, money, and fixed currency', async () => {
    const repositories = createPrototypeRepositories();
    const event = (await repositories.events.list()).find(
      (candidate) => candidate.slug === 'afterglow-sessions-freetown',
    )!;
    const shared = {
      code: 'RULETEST',
      name: 'Rule test',
      startsAt: '2026-10-01T00:00:00.000Z',
      endsAt: '2027-01-01T00:00:00.000Z',
      isActive: true,
      ticketTierIds: [] as string[],
      type: 'PERCENTAGE' as const,
      percentageBasisPoints: 1000,
    };
    await expect(
      saveOrganizerPromotion(
        event.organizerId!,
        event.id,
        undefined,
        { ...shared, endsAt: shared.startsAt },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_DATES' });
    await expect(
      saveOrganizerPromotion(
        event.organizerId!,
        event.id,
        undefined,
        { ...shared, usageLimit: 0 },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_USAGE_LIMIT' });
    await expect(
      saveOrganizerPromotion(
        event.organizerId!,
        event.id,
        undefined,
        {
          ...shared,
          type: 'FIXED_AMOUNT',
          fixedAmount: money('100', 'GHS'),
        },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'CURRENCY_MISMATCH' });
    expect(() => parseBasisPoints('10.001')).toThrow('INVALID_PERCENTAGE');
  });

  it('keeps zero-fraction XOF fixed previews exact', () => {
    const fixed = {
      id: 'xof',
      eventId: 'ci',
      code: 'XOF500',
      name: 'XOF preview',
      type: 'FIXED_AMOUNT' as const,
      fixedAmount: money('500', 'XOF'),
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2027-01-01T00:00:00.000Z',
      isActive: true,
      ticketTierIds: [],
    };
    expect(previewPromotion(money('1200', 'XOF'), fixed)).toEqual(
      money('700', 'XOF'),
    );
  });
});
