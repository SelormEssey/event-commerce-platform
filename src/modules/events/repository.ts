import type { EventRecord } from './domain';

export interface EventRepository {
  list(): Promise<readonly EventRecord[]>;
  findBySlug(slug: string): Promise<EventRecord | undefined>;
}
