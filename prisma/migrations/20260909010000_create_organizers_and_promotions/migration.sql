CREATE TABLE "Organizer" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "about" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organizer_slug_key" ON "Organizer"("slug");

ALTER TABLE "Event" ADD COLUMN "organizerId" UUID;
ALTER TABLE "Event"
  ADD CONSTRAINT "Event_organizerId_fkey"
  FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Event_organizerId_status_startDateTime_idx"
  ON "Event"("organizerId", "status", "startDateTime");

CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

CREATE TABLE "Promotion" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "PromotionType" NOT NULL,
  "percentageBasisPoints" INTEGER,
  "fixedAmountMinor" BIGINT,
  "currency" CHAR(3),
  "startsAt" TIMESTAMPTZ(3) NOT NULL,
  "endsAt" TIMESTAMPTZ(3) NOT NULL,
  "usageLimit" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "attributionLabel" TEXT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Promotion_dates_check" CHECK ("endsAt" > "startsAt"),
  CONSTRAINT "Promotion_usageLimit_check" CHECK ("usageLimit" IS NULL OR "usageLimit" > 0),
  CONSTRAINT "Promotion_code_normalized_check" CHECK ("code" = UPPER(BTRIM("code"))),
  CONSTRAINT "Promotion_discount_shape_check" CHECK (
    (
      "type" = 'PERCENTAGE'
      AND "percentageBasisPoints" BETWEEN 1 AND 10000
      AND "fixedAmountMinor" IS NULL
      AND "currency" IS NULL
    )
    OR
    (
      "type" = 'FIXED_AMOUNT'
      AND "percentageBasisPoints" IS NULL
      AND "fixedAmountMinor" > 0
      AND "currency" IS NOT NULL
    )
  ),
  CONSTRAINT "Promotion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Promotion_eventId_code_key" ON "Promotion"("eventId", "code");
CREATE UNIQUE INDEX "Promotion_id_eventId_key" ON "Promotion"("id", "eventId");
CREATE INDEX "Promotion_eventId_isActive_startsAt_endsAt_idx"
  ON "Promotion"("eventId", "isActive", "startsAt", "endsAt");

CREATE UNIQUE INDEX "TicketTier_id_eventId_key" ON "TicketTier"("id", "eventId");

CREATE TABLE "PromotionTicketTier" (
  "promotionId" UUID NOT NULL,
  "promotionEventId" UUID NOT NULL,
  "ticketTierId" UUID NOT NULL,
  "ticketTierEventId" UUID NOT NULL,
  CONSTRAINT "PromotionTicketTier_pkey" PRIMARY KEY ("promotionId", "ticketTierId"),
  CONSTRAINT "PromotionTicketTier_same_event_check" CHECK ("promotionEventId" = "ticketTierEventId"),
  CONSTRAINT "PromotionTicketTier_promotion_fkey"
    FOREIGN KEY ("promotionId", "promotionEventId") REFERENCES "Promotion"("id", "eventId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PromotionTicketTier_ticketTier_fkey"
    FOREIGN KEY ("ticketTierId", "ticketTierEventId") REFERENCES "TicketTier"("id", "eventId") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "PromotionTicketTier_ticketTierId_idx" ON "PromotionTicketTier"("ticketTierId");
