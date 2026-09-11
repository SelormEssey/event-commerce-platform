import { countryCodes } from '../src/config/countries';
import {
  prototypeAllEvents,
  prototypeVenues,
} from '../src/modules/events/fixtures/events';
import { prototypeOrganizers } from '../src/modules/organizers/fixtures/organizers';
import { prototypePromotions } from '../src/modules/promotions/fixtures/promotions';
import type { PromotionRecord } from '../src/modules/promotions/domain';
import { createScriptDatabase } from '../scripts/database';

async function seed() {
  const database = createScriptDatabase();
  try {
    await database.country.createMany({
      data: countryCodes.map((code) => ({ code })),
      skipDuplicates: true,
    });
    for (const organizer of prototypeOrganizers) {
      await database.organizer.upsert({
        where: { id: organizer.id },
        create: organizer,
        update: {
          slug: organizer.slug,
          displayName: organizer.displayName,
          about: organizer.about ?? null,
        },
      });
    }
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
    for (const event of prototypeAllEvents) {
      await database.event.upsert({
        where: { id: event.id },
        create: {
          id: event.id,
          slug: event.slug,
          organizerDisplayName: event.organizerDisplayName,
          organizerId: event.organizerId ?? null,
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
          publishedAt: event.publishedAt ?? null,
        },
        update: {
          slug: event.slug,
          organizerDisplayName: event.organizerDisplayName,
          organizerId: event.organizerId ?? null,
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
          publishedAt: event.publishedAt ?? null,
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
    for (const promotion of prototypePromotions as readonly PromotionRecord[]) {
      await database.promotion.upsert({
        where: { id: promotion.id },
        create: {
          id: promotion.id,
          eventId: promotion.eventId,
          code: promotion.code,
          name: promotion.name,
          type: promotion.type,
          percentageBasisPoints:
            promotion.type === 'PERCENTAGE'
              ? promotion.percentageBasisPoints
              : null,
          fixedAmountMinor:
            promotion.type === 'FIXED_AMOUNT'
              ? BigInt(promotion.fixedAmount.minorUnits)
              : null,
          currency:
            promotion.type === 'FIXED_AMOUNT'
              ? promotion.fixedAmount.currency
              : null,
          startsAt: promotion.startsAt,
          endsAt: promotion.endsAt,
          usageLimit: promotion.usageLimit ?? null,
          isActive: promotion.isActive,
          attributionLabel: promotion.attributionLabel ?? null,
        },
        update: {
          eventId: promotion.eventId,
          code: promotion.code,
          name: promotion.name,
          type: promotion.type,
          percentageBasisPoints:
            promotion.type === 'PERCENTAGE'
              ? promotion.percentageBasisPoints
              : null,
          fixedAmountMinor:
            promotion.type === 'FIXED_AMOUNT'
              ? BigInt(promotion.fixedAmount.minorUnits)
              : null,
          currency:
            promotion.type === 'FIXED_AMOUNT'
              ? promotion.fixedAmount.currency
              : null,
          startsAt: promotion.startsAt,
          endsAt: promotion.endsAt,
          usageLimit: promotion.usageLimit ?? null,
          isActive: promotion.isActive,
          attributionLabel: promotion.attributionLabel ?? null,
        },
      });
      await database.promotionTicketTier.deleteMany({
        where: { promotionId: promotion.id },
      });
      if (promotion.ticketTierIds.length > 0) {
        await database.promotionTicketTier.createMany({
          data: promotion.ticketTierIds.map((ticketTierId) => ({
            promotionId: promotion.id,
            promotionEventId: promotion.eventId,
            ticketTierId,
            ticketTierEventId: promotion.eventId,
          })),
        });
      }
    }
    console.info(
      'Country, organizer, event, ticket tier, and promotion fixtures seeded.',
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
