import type { EventRepository } from '../repository';
import { prototypeAllEvents } from './events';

export const fixtureEventRepository: EventRepository = {
  async list() {
    return prototypeAllEvents;
  },
  async findBySlug(slug) {
    return prototypeAllEvents.find((event) => event.slug === slug);
  },
};
