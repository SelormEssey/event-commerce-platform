CREATE TYPE "EventCategory" AS ENUM (
  'CONCERTS',
  'PARTIES',
  'FESTIVALS',
  'NIGHTLIFE',
  'SPORTS',
  'ARTS_CULTURE',
  'CONFERENCES',
  'OTHER'
);

CREATE TYPE "EventStatus" AS ENUM (
  'DRAFT',
  'PUBLISHED',
  'CANCELLED',
  'COMPLETED'
);

CREATE TABLE "Venue" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "city" TEXT NOT NULL,
  "countryCode" CHAR(2) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Venue_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Venue_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Event" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "organizerDisplayName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "EventCategory" NOT NULL,
  "artworkReference" TEXT,
  "venueId" UUID NOT NULL,
  "startDateTime" TIMESTAMPTZ(3) NOT NULL,
  "endDateTime" TIMESTAMPTZ(3) NOT NULL,
  "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
  "ageRestriction" TEXT,
  "refundPolicy" TEXT NOT NULL,
  "featuredRank" INTEGER,
  "publishedAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Event_dates_check" CHECK ("endDateTime" > "startDateTime"),
  CONSTRAINT "Event_featuredRank_check" CHECK ("featuredRank" IS NULL OR "featuredRank" > 0),
  CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "TicketTier" (
  "id" UUID NOT NULL,
  "eventId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "priceMinor" BIGINT NOT NULL,
  "currency" CHAR(3) NOT NULL,
  "capacity" INTEGER NOT NULL,
  "availableQuantity" INTEGER NOT NULL,
  "salesStart" TIMESTAMPTZ(3) NOT NULL,
  "salesEnd" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "TicketTier_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TicketTier_priceMinor_check" CHECK ("priceMinor" >= 0),
  CONSTRAINT "TicketTier_capacity_check" CHECK ("capacity" >= 0),
  CONSTRAINT "TicketTier_availableQuantity_check" CHECK ("availableQuantity" >= 0 AND "availableQuantity" <= "capacity"),
  CONSTRAINT "TicketTier_sales_dates_check" CHECK ("salesEnd" > "salesStart"),
  CONSTRAINT "TicketTier_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE INDEX "Venue_countryCode_city_idx" ON "Venue"("countryCode", "city");
CREATE INDEX "Event_status_startDateTime_idx" ON "Event"("status", "startDateTime");
CREATE INDEX "Event_venueId_idx" ON "Event"("venueId");
CREATE INDEX "TicketTier_eventId_salesStart_salesEnd_idx" ON "TicketTier"("eventId", "salesStart", "salesEnd");
