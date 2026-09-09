import type { EventRepository } from '../repository';
import { prototypeEvents } from './events';

export const fixtureEventRepository: EventRepository = {
  async list() {
    return prototypeEvents;
  },
  async findBySlug(slug) {
    return prototypeEvents.find((event) => event.slug === slug);
  },
};
