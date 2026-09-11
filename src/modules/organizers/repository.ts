import type { EventRepository } from '../events/repository';
import type { EventRecord, TicketTierRecord } from '../events/domain';
import type { PromotionRecord } from '../promotions/domain';
import type { OrganizerRecord } from './domain';

export interface OrganizerRepository {
  list(): Promise<readonly OrganizerRecord[]>;
  findById(id: string): Promise<OrganizerRecord | undefined>;
  findBySlug(slug: string): Promise<OrganizerRecord | undefined>;
  save(organizer: OrganizerRecord): Promise<void>;
}

export interface OrganizerEventRepository extends EventRepository {
  findById(id: string): Promise<EventRecord | undefined>;
  save(event: EventRecord): Promise<void>;
  removeTicketTier(eventId: string, tierId: string): Promise<void>;
  saveTicketTier(eventId: string, tier: TicketTierRecord): Promise<void>;
}

export interface PromotionRepository {
  listByEvent(eventId: string): Promise<readonly PromotionRecord[]>;
  findById(id: string): Promise<PromotionRecord | undefined>;
  save(promotion: PromotionRecord): Promise<void>;
}

export type WorkspaceRepositories = {
  organizers: OrganizerRepository;
  events: OrganizerEventRepository;
  promotions: PromotionRepository;
};
