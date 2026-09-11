import type { EventRecord, TicketTierRecord } from '../events/domain';
import { prototypeAllEvents, prototypeVenues } from '../events/fixtures/events';
import type {
  OrganizerEventRepository,
  OrganizerRepository,
  PromotionRepository,
  WorkspaceRepositories,
} from '../organizers/repository';
import type { OrganizerRecord } from '../organizers/domain';
import { prototypeOrganizers } from '../organizers/fixtures/organizers';
import type { PromotionRecord } from '../promotions/domain';
import { prototypePromotions } from '../promotions/fixtures/promotions';

export type PrototypeData = {
  organizers: OrganizerRecord[];
  events: EventRecord[];
  promotions: PromotionRecord[];
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

export function createPrototypeData(): PrototypeData {
  return clone({
    organizers: [...prototypeOrganizers],
    events: [...prototypeAllEvents],
    promotions: [...prototypePromotions],
  });
}

export function createPrototypeRepositories(
  data: PrototypeData = createPrototypeData(),
): WorkspaceRepositories {
  const organizers: OrganizerRepository = {
    async list() {
      return clone(data.organizers);
    },
    async findById(id) {
      return clone(data.organizers.find((item) => item.id === id));
    },
    async findBySlug(slug) {
      return clone(data.organizers.find((item) => item.slug === slug));
    },
    async save(organizer) {
      const index = data.organizers.findIndex(
        (item) => item.id === organizer.id,
      );
      if (index === -1) data.organizers.push(clone(organizer));
      else data.organizers[index] = clone(organizer);
      data.events = data.events.map((event) =>
        event.organizerId === organizer.id
          ? {
              ...event,
              organizerDisplayName: organizer.displayName,
              organizer: {
                id: organizer.id,
                slug: organizer.slug,
                displayName: organizer.displayName,
              },
            }
          : event,
      );
    },
  };

  const events: OrganizerEventRepository = {
    async list() {
      return clone(data.events);
    },
    async findBySlug(slug) {
      return clone(data.events.find((event) => event.slug === slug));
    },
    async findById(id) {
      return clone(data.events.find((event) => event.id === id));
    },
    async save(event) {
      const index = data.events.findIndex((item) => item.id === event.id);
      if (index === -1) data.events.push(clone(event));
      else data.events[index] = clone(event);
    },
    async removeTicketTier(eventId, tierId) {
      const event = data.events.find((item) => item.id === eventId);
      if (!event) return;
      await this.save({
        ...event,
        ticketTiers: event.ticketTiers.filter((tier) => tier.id !== tierId),
      });
    },
    async saveTicketTier(eventId, tier: TicketTierRecord) {
      const event = data.events.find((item) => item.id === eventId);
      if (!event) return;
      const exists = event.ticketTiers.some((item) => item.id === tier.id);
      await this.save({
        ...event,
        ticketTiers: exists
          ? event.ticketTiers.map((item) => (item.id === tier.id ? tier : item))
          : [...event.ticketTiers, tier],
      });
    },
  };

  const promotions: PromotionRepository = {
    async listByEvent(eventId) {
      return clone(
        data.promotions.filter((promotion) => promotion.eventId === eventId),
      );
    },
    async findById(id) {
      return clone(data.promotions.find((promotion) => promotion.id === id));
    },
    async save(promotion) {
      const index = data.promotions.findIndex(
        (item) => item.id === promotion.id,
      );
      if (index === -1) data.promotions.push(clone(promotion));
      else data.promotions[index] = clone(promotion);
    },
  };

  return { organizers, events, promotions };
}

export const prototypeVenueFixtures = prototypeVenues;
