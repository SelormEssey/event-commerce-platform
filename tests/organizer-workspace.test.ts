import { describe, expect, it } from 'vitest';
import { money } from '../src/modules/events/money';
import { parseMajorUnits } from '../src/modules/events/money-input';
import { listPublicEvents } from '../src/modules/events/public-events';
import {
  createOrganizerEvent,
  createOrganizerTicketTier,
  requireOwnedEvent,
  setOrganizerEventPublished,
  updateOrganizerTicketTier,
  updateOrganizerEvent,
  type EventDetailsInput,
} from '../src/modules/organizers/event-service';
import { prototypeOrganizers } from '../src/modules/organizers/fixtures/organizers';
import { createPrototypeRepositories } from '../src/modules/prototype-data/repositories';

const eventInput: EventDetailsInput = {
  title: 'Prototype Test Event',
  description: 'A fictional event used to exercise organizer domain rules.',
  category: 'CONCERTS',
  artwork: { treatment: 'orbit', tone: 'lilac' },
  venue: {
    name: 'Test Room',
    city: 'Freetown',
    countryCode: 'SL',
  },
  startDateTime: '2027-08-01T18:00:00.000Z',
  endDateTime: '2027-08-01T22:00:00.000Z',
  refundPolicy: 'Prototype refund terms.',
};

describe('organizer workspace ownership and publication', () => {
  it('preserves nine public fixtures and stable organizer relationships', async () => {
    const repositories = createPrototypeRepositories();
    const events = await repositories.events.list();
    const publicEvents = events.filter((event) => event.status === 'PUBLISHED');

    expect(publicEvents).toHaveLength(9);
    expect(prototypeOrganizers).toHaveLength(9);
    expect(
      publicEvents.every((event) => event.organizerId && event.organizer),
    ).toBe(true);
    expect(
      ['SL', 'GH', 'CI'].map(
        (country) =>
          publicEvents.filter((event) => event.venue.countryCode === country)
            .length,
      ),
    ).toEqual([3, 3, 3]);
  });

  it('requires server-verified ownership for event mutation', async () => {
    const repositories = createPrototypeRepositories();
    const event = (await repositories.events.list())[0];
    const otherOrganizer = prototypeOrganizers[1];
    expect(event).toBeDefined();
    expect(otherOrganizer).toBeDefined();

    await expect(
      requireOwnedEvent(otherOrganizer!.id, event!.id, repositories),
    ).rejects.toMatchObject({ code: 'NOT_OWNED' });
  });

  it('creates drafts with an organizer and only publishes after a tier exists', async () => {
    const repositories = createPrototypeRepositories();
    const organizer = prototypeOrganizers[0]!;
    const created = await createOrganizerEvent(
      organizer.id,
      eventInput,
      repositories,
    );

    expect(created.status).toBe('DRAFT');
    expect(created.organizerId).toBe(organizer.id);
    await expect(
      setOrganizerEventPublished(organizer.id, created.id, true, repositories),
    ).rejects.toMatchObject({ code: 'TIER_REQUIRED_TO_PUBLISH' });

    await createOrganizerTicketTier(
      organizer.id,
      created.id,
      {
        name: 'General',
        price: money('15000', 'SLE'),
        capacity: 100,
        salesStart: '2027-01-01T00:00:00.000Z',
        salesEnd: '2027-07-31T23:00:00.000Z',
      },
      repositories,
    );
    const published = await setOrganizerEventPublished(
      organizer.id,
      created.id,
      true,
      repositories,
    );
    expect(published.status).toBe('PUBLISHED');
    await expect(
      listPublicEvents({ country: 'SL' }, repositories.events),
    ).resolves.toContainEqual(expect.objectContaining({ id: created.id }));
  });

  it('rejects invalid event dates and an incompatible market change', async () => {
    const repositories = createPrototypeRepositories();
    const organizer = prototypeOrganizers[0]!;
    await expect(
      createOrganizerEvent(
        organizer.id,
        { ...eventInput, endDateTime: eventInput.startDateTime },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_DATES' });

    const event = (await repositories.events.list()).find(
      (candidate) => candidate.slug === 'afterglow-sessions-freetown',
    )!;
    await expect(
      updateOrganizerEvent(
        event.organizerId!,
        event.id,
        {
          ...eventInput,
          title: event.title,
          venue: { ...eventInput.venue, countryCode: 'GH' },
        },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'CURRENCY_MISMATCH' });
  });
});

describe('system-controlled ticket inventory', () => {
  it('starts new tier availability at capacity and preserves existing availability', async () => {
    const repositories = createPrototypeRepositories();
    const event = (await repositories.events.list()).find(
      (candidate) => candidate.slug === 'afterglow-sessions-freetown',
    )!;
    const tier = await createOrganizerTicketTier(
      event.organizerId!,
      event.id,
      {
        name: 'Balcony',
        price: money('20000', 'SLE'),
        capacity: 40,
        salesStart: '2026-10-01T00:00:00.000Z',
        salesEnd: '2027-01-16T18:00:00.000Z',
      },
      repositories,
    );
    expect(tier.availableQuantity).toBe(40);

    const existing = event.ticketTiers[1]!;
    const updated = await updateOrganizerTicketTier(
      event.organizerId!,
      existing.id,
      {
        name: existing.name,
        price: existing.price,
        capacity: 200,
        salesStart: existing.salesStart,
        salesEnd: existing.salesEnd,
      },
      repositories,
    );
    expect(updated.availableQuantity).toBe(existing.availableQuantity);
  });

  it('rejects capacity below current availability', async () => {
    const repositories = createPrototypeRepositories();
    const event = (await repositories.events.list()).find(
      (candidate) => candidate.slug === 'afterglow-sessions-freetown',
    )!;
    const existing = event.ticketTiers[1]!;
    await expect(
      updateOrganizerTicketTier(
        event.organizerId!,
        existing.id,
        {
          name: existing.name,
          price: existing.price,
          capacity: existing.availableQuantity - 1,
          salesStart: existing.salesStart,
          salesEnd: existing.salesEnd,
        },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'CAPACITY_BELOW_AVAILABLE' });
  });

  it('rejects invalid capacity, sales windows, and cross-organizer tier edits', async () => {
    const repositories = createPrototypeRepositories();
    const event = (await repositories.events.list()).find(
      (candidate) => candidate.slug === 'afterglow-sessions-freetown',
    )!;
    const tier = event.ticketTiers[0]!;
    const base = {
      name: tier.name,
      price: tier.price,
      capacity: tier.capacity,
      salesStart: tier.salesStart,
      salesEnd: tier.salesEnd,
    };
    await expect(
      updateOrganizerTicketTier(
        event.organizerId!,
        tier.id,
        { ...base, capacity: 0 },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_CAPACITY' });
    await expect(
      updateOrganizerTicketTier(
        event.organizerId!,
        tier.id,
        { ...base, salesEnd: base.salesStart },
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'INVALID_SALES_WINDOW' });
    await expect(
      updateOrganizerTicketTier(
        prototypeOrganizers[1]!.id,
        tier.id,
        base,
        repositories,
      ),
    ).rejects.toMatchObject({ code: 'NOT_OWNED' });
  });
});

describe('money input conversion', () => {
  it('converts major units to exact integer minor units for every market', () => {
    expect(parseMajorUnits('12.50', 'SL')).toEqual(money('1250', 'SLE'));
    expect(parseMajorUnits('12.50', 'GH')).toEqual(money('1250', 'GHS'));
    expect(parseMajorUnits('1250', 'CI')).toEqual(money('1250', 'XOF'));
  });

  it('rejects excess precision and decimal XOF values', () => {
    expect(() => parseMajorUnits('12.501', 'SL')).toThrow('INVALID_MONEY');
    expect(() => parseMajorUnits('12.50', 'CI')).toThrow('INVALID_MONEY');
  });
});
