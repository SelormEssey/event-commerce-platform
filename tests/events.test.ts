import { describe, expect, it } from 'vitest';
import { ticketAvailability } from '../src/modules/events/availability';
import { resolveCategory } from '../src/modules/events/categories';
import type {
  EventRecord,
  TicketTierRecord,
} from '../src/modules/events/domain';
import { prototypeEvents } from '../src/modules/events/fixtures/events';
import { formatMoney, money } from '../src/modules/events/money';
import {
  filterPublicEvents,
  getPublicEventBySlug,
  listPublicEvents,
} from '../src/modules/events/public-events';
import type { EventRepository } from '../src/modules/events/repository';

describe('public event discovery', () => {
  it.each([
    ['SL', 3],
    ['GH', 3],
    ['CI', 3],
  ] as const)('returns only %s events', async (country, count) => {
    const events = await listPublicEvents({ country });
    expect(events).toHaveLength(count);
    expect(events.every((event) => event.venue.countryCode === country)).toBe(
      true,
    );
  });

  it('filters by category', () => {
    const events = filterPublicEvents(prototypeEvents, {
      country: 'GH',
      category: 'SPORTS',
    });
    expect(events.map((event) => event.slug)).toEqual(['night-court-social']);
  });

  it.each([
    ['harbour', 'afterglow-sessions-freetown'],
    ['signal house', 'atlantic-frequency'],
    ['freetown', 'afterglow-sessions-freetown'],
    ['Editions Passage', 'passage-des-arts'],
  ])('searches public text for %s', (search, slug) => {
    const country = slug === 'passage-des-arts' ? 'CI' : 'SL';
    expect(
      filterPublicEvents(prototypeEvents, { country, search }).map(
        (event) => event.slug,
      ),
    ).toContain(slug);
  });

  it('excludes non-public event statuses', async () => {
    const published = prototypeEvents[0];
    const draft: EventRecord = { ...published, status: 'DRAFT' };
    const repository: EventRepository = {
      async list() {
        return [published, draft];
      },
      async findBySlug(slug) {
        return slug === draft.slug ? draft : undefined;
      },
    };
    expect(await listPublicEvents({ country: 'SL' }, repository)).toEqual([
      published,
    ]);
    expect(await getPublicEventBySlug(draft.slug, repository)).toBeUndefined();
  });

  it('returns no public record for an unknown event', async () => {
    await expect(
      getPublicEventBySlug('event-that-does-not-exist'),
    ).resolves.toBeUndefined();
  });

  it('rejects invalid and ambiguous category filters predictably', () => {
    expect(resolveCategory('sports')).toEqual({
      category: 'SPORTS',
      invalid: false,
    });
    expect(resolveCategory('unknown')).toEqual({ invalid: true });
    expect(resolveCategory(['sports', 'concerts'])).toEqual({ invalid: true });
  });
});

describe('ticket availability', () => {
  const baseTier: TicketTierRecord = {
    id: 'tier',
    name: 'General',
    price: money('1000', 'SLE'),
    capacity: 20,
    availableQuantity: 10,
    salesStart: '2026-09-10T00:00:00.000Z',
    salesEnd: '2026-09-20T00:00:00.000Z',
  };

  it('uses the approved reason precedence', () => {
    const soldOut = { ...baseTier, availableQuantity: 0 };
    expect(ticketAvailability(soldOut, new Date('2026-09-01'))).toBe(
      'SALE_NOT_STARTED',
    );
    expect(ticketAvailability(soldOut, new Date('2026-09-21'))).toBe(
      'SALE_ENDED',
    );
    expect(ticketAvailability(soldOut, new Date('2026-09-15'))).toBe(
      'SOLD_OUT',
    );
    expect(ticketAvailability(baseTier, new Date('2026-09-15'))).toBe(
      'AVAILABLE',
    );
  });
});

describe('exact ticket money', () => {
  it('formats integer minor units without floating-point arithmetic', () => {
    expect(formatMoney(money('123450', 'SLE'), 'SL', 'en')).toContain(
      '1,234.50',
    );
    expect(formatMoney(money('123450', 'GHS'), 'GH', 'en')).toContain(
      '1,234.50',
    );
    expect(formatMoney(money('1234', 'XOF'), 'CI', 'fr')).toContain('1 234');
  });

  it('rejects malformed amounts and cross-market currencies', () => {
    expect(() => money('10.50', 'SLE')).toThrow('integer string');
    expect(() => formatMoney(money('1000', 'GHS'), 'SL', 'en')).toThrow(
      'does not match',
    );
  });
});
