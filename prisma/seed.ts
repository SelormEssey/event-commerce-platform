import { countryCodes } from '../src/config/countries';
import {
  prototypeEvents,
  prototypeVenues,
} from '../src/modules/events/fixtures/events';
import { createScriptDatabase } from '../scripts/database';

async function seed() {
  const database = createScriptDatabase();
  try {
    await database.country.createMany({
      data: countryCodes.map((code) => ({ code })),
      skipDuplicates: true,
    });
    for (const venue of prototypeVenues) {
      await database.venue.upsert({
        where: { id: venue.id },
        create: venue,
        update: {
          name: venue.name,
          address: 'address' in venue ? venue.address : null,
          city: venue.city,
          countryCode: venue.countryCode,
        },
      });
    }
    for (const event of prototypeEvents) {
      await database.event.upsert({
        where: { id: event.id },
        create: {
          id: event.id,
          slug: event.slug,
          organizerDisplayName: event.organizerDisplayName,
          title: event.title,
          description: event.description,
          category: event.category,
          artworkReference: `${event.artwork.treatment}:${event.artwork.tone}`,
          venueId: event.venue.id,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          status: event.status,
          ageRestriction: event.ageRestriction ?? null,
          refundPolicy: event.refundPolicy,
          featuredRank: event.featuredRank ?? null,
          publishedAt: event.publishedAt,
        },
        update: {
          slug: event.slug,
          organizerDisplayName: event.organizerDisplayName,
          title: event.title,
          description: event.description,
          category: event.category,
          artworkReference: `${event.artwork.treatment}:${event.artwork.tone}`,
          venueId: event.venue.id,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime,
          status: event.status,
          ageRestriction: event.ageRestriction ?? null,
          refundPolicy: event.refundPolicy,
          featuredRank: event.featuredRank ?? null,
          publishedAt: event.publishedAt,
        },
      });
      for (const ticketTier of event.ticketTiers) {
        await database.ticketTier.upsert({
          where: { id: ticketTier.id },
          create: {
            id: ticketTier.id,
            eventId: event.id,
            name: ticketTier.name,
            description: ticketTier.description ?? null,
            priceMinor: BigInt(ticketTier.price.minorUnits),
            currency: ticketTier.price.currency,
            capacity: ticketTier.capacity,
            availableQuantity: ticketTier.availableQuantity,
            salesStart: ticketTier.salesStart,
            salesEnd: ticketTier.salesEnd,
          },
          update: {
            name: ticketTier.name,
            description: ticketTier.description ?? null,
            priceMinor: BigInt(ticketTier.price.minorUnits),
            currency: ticketTier.price.currency,
            capacity: ticketTier.capacity,
            availableQuantity: ticketTier.availableQuantity,
            salesStart: ticketTier.salesStart,
            salesEnd: ticketTier.salesEnd,
          },
        });
      }
    }
    console.info(
      'Country identifiers and fictional Sprint 1 event fixtures seeded.',
    );
  } finally {
    await database.$disconnect();
  }
}

seed().catch(() => {
  console.error(
    'Database seed failed. Check local configuration, connectivity, and migration status. Credentials are not logged.',
  );
  process.exitCode = 1;
});
